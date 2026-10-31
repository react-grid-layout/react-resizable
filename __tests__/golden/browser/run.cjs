const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const webpack = require('webpack');

const repo = path.resolve(__dirname, '../../..');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'react-resizable-browser-'));

// In GitHub Actions, also emit a workflow error command so the first lines of
// each failure show up as a check annotation, readable without the full log.
function annotate(title, message) {
  if (!process.env.GITHUB_ACTIONS) return;
  const body = String(message).split('\n').slice(0, 40).join('\n')
    .replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  process.stdout.write(`::error title=${title}::${body}\n`);
}

function bundle() {
  return new Promise((resolve, reject) => {
    const compiler = webpack({
      mode: 'development',
      context: repo,
      entry: path.join(__dirname, 'app.tsx'),
      output: {path: output, filename: 'app.js'},
      devtool: false,
      resolve: {extensions: ['.tsx', '.ts', '.js']},
      module: {rules: [{test: /\.[jt]sx?$/, exclude: /node_modules/,
        loader: require.resolve('babel-loader'),
        options: {configFile: path.join(repo, '.babelrc'), babelrc: false}}]},
    });
    compiler.run((error, stats) => {
      compiler.close(closeError => {
        if (error || closeError) return reject(error || closeError);
        if (stats.hasErrors()) return reject(new Error(stats.toString({all: false, errors: true})));
        resolve();
      });
    });
  });
}

// Native Chromium layout is independent of the deterministic jsdom layout shim.
// Ignore only the shim's instrumentation counters; every observed field remains.
function observable(trace) {
  return {...trace, steps: trace.steps.map(({rectReads, ...step}) => step)};
}

async function main() {
  await bundle();
  fs.writeFileSync(path.join(output, 'index.html'),
    '<!doctype html><meta charset="utf-8"><script defer src="app.js"></script>');
  const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
  // One launch attempt: preserve Chromium's full diagnostic if the host blocks it.
  const browser = await chromium.launch({headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? {executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {})});
  const failures = [];
  let checked = 0;
  try {
    const listingPage = await browser.newPage();
    const url = pathToFileURL(path.join(output, 'index.html')).href;
    await listingPage.goto(url);
    const names = await listingPage.evaluate(() => window.goldenBrowser.names);
    assert.ok(names.length > 0, 'No browser scenarios were loaded');
    await listingPage.close();
    for (const name of names) {
      const page = await browser.newPage({viewport: {width: 2000, height: 2000}});
      await page.goto(url);
      const gestures = await page.evaluate(name => window.goldenBrowser.mount(name), name);
      for (const gesture of gestures) {
        const origin = await page.evaluate(axis => window.goldenBrowser.origin(axis), gesture.axis);
        await page.mouse.move(origin.x, origin.y);
        for (const input of gesture.inputs) {
          await page.evaluate(input => window.goldenBrowser.begin(input), input);
          if (input.type === 'mousedown') await page.mouse.down();
          else if (input.type === 'mousemove') {
            await page.mouse.move(origin.x + input.clientX, origin.y + input.clientY);
          } else if (input.type === 'mouseup' && !name.endsWith('known-mouseup-delta')) {
            await page.mouse.up();
          } else if (input.type === 'mouseup') {
            // The displaced-mouseup case must release at a new location without
            // synthesizing a mousemove, which would change the behavior tested.
            const session = await page.context().newCDPSession(page);
            await session.send('Input.dispatchMouseEvent', {type: 'mouseReleased',
              x: origin.x + input.clientX, y: origin.y + input.clientY,
              button: 'left', buttons: 0, clickCount: 1});
            await session.detach();
          } else throw new Error(`Unsupported browser input: ${input.type}`);
          await page.evaluate(() => window.goldenBrowser.end());
        }
      }
      const actual = await page.evaluate(() => window.goldenBrowser.finish());
      const expectedPath = path.join(__dirname, '../__golden__', `${name}.golden.json`);
      try {
        const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));
        assert.deepStrictEqual(observable(actual), observable(expected));
        checked++;
        process.stdout.write(`PASS ${name}\n`);
      } catch (error) {
        fs.writeFileSync(path.join(output, `${name}.actual.json`), JSON.stringify(actual, null, 2) + '\n');
        failures.push(name);
        process.stderr.write(`FAIL ${name}\n${error.stack}\n`);
        annotate(`browser parity: ${name}`, error.message);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
  process.stdout.write(`Browser parity: ${checked} passed, ${failures.length} failed. Artifacts: ${output}\n`);
  if (failures.length) process.exitCode = 1;
}

main().catch(error => {
  annotate('browser cross-check crashed', error.stack);
  process.stderr.write(`${error.stack}\nBrowser artifacts: ${output}\n`);
  process.exitCode = 1;
});
