import * as fs from 'node:fs';
import * as path from 'node:path';
import {serialize} from './serialize';

export function expectGolden(name: string, trace: Parameters<typeof serialize>[0]) {
  if (!/^[a-zA-Z0-9.-]+$/.test(name)) throw new Error(`Invalid golden name: ${name}`);
  const file = path.join(__dirname, '__golden__', `${name}.golden.json`);
  const actual = serialize(trace);
  if (process.env.GOLDEN_UPDATE === '1') {
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, actual);
  }
  if (!fs.existsSync(file)) throw new Error(`Missing ${name}.golden.json. Run corepack yarn golden:update.`);
  // Jest's line diff points directly to the changed input, callback, or DOM field.
  expect(actual).toBe(fs.readFileSync(file, 'utf8'));
}
