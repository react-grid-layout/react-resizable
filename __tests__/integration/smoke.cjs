#!/usr/bin/env node
// Build-artifact smoke test.
//
// Runs after `yarn build`. Verifies that:
//   1. The package's CJS root entry (`index.js`) can be required.
//   2. The public surface (`Resizable`, `ResizableBox`) is present and constructible.
//   3. Bundled type declarations (`build/*.d.ts`) exist and re-export the public surface.
//   4. The default `require('react-resizable')()` legacy guard throws as documented.
//
// This file is intentionally plain CJS so it runs against the published shape
// (the same shape a consumer would `require()`), not the TS source.

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const pkgRoot = path.resolve(__dirname, '..', '..');
const pkg = require(path.join(pkgRoot, 'package.json'));

console.log(`smoke-test: react-resizable@${pkg.version}`);

// 1. Root CJS entry resolves.
const entry = path.join(pkgRoot, pkg.main);
assert.ok(fs.existsSync(entry), `package.json#main resolves: ${entry}`);

const lib = require(entry);
assert.equal(typeof lib, 'function', 'root export is the legacy guard function');

// 2. Named exports present and look like React class components.
assert.ok(lib.Resizable, 'Resizable is exported');
assert.ok(lib.ResizableBox, 'ResizableBox is exported');
assert.equal(typeof lib.Resizable, 'function', 'Resizable is a constructor');
assert.equal(typeof lib.ResizableBox, 'function', 'ResizableBox is a constructor');
assert.equal(lib.Resizable.name, 'Resizable', 'Resizable class name preserved');
assert.equal(lib.ResizableBox.name, 'ResizableBox', 'ResizableBox class name preserved');
assert.ok(lib.Resizable.defaultProps, 'Resizable.defaultProps is set');
assert.equal(lib.Resizable.defaultProps.axis, 'both', 'Resizable.defaultProps.axis === both');
assert.deepEqual(
  lib.Resizable.defaultProps.resizeHandles,
  ['se'],
  'Resizable.defaultProps.resizeHandles === ["se"]',
);
assert.ok(lib.Resizable.propTypes, 'Resizable.propTypes is set (runtime validation preserved)');

// 3. Type declarations exist.
const typesEntry = path.resolve(pkgRoot, pkg.types);
assert.ok(fs.existsSync(typesEntry), `package.json#types resolves: ${typesEntry}`);
const typesSource = fs.readFileSync(typesEntry, 'utf8');
for (const sym of ['Resizable', 'ResizableBox', 'ResizeCallbackData', 'ResizeHandleAxis']) {
  assert.match(typesSource, new RegExp(`\\b${sym}\\b`), `${sym} present in ${pkg.types}`);
}
for (const f of ['Resizable.d.ts', 'ResizableBox.d.ts', 'propTypes.d.ts']) {
  const p = path.join(pkgRoot, 'build', f);
  assert.ok(fs.existsSync(p), `bundled declaration exists: build/${f}`);
}

// 4. Calling the root export throws the legacy guard error.
assert.throws(
  () => lib(),
  /Don't instantiate Resizable directly/,
  'legacy require() guard throws',
);

// 5. The `files` whitelist in package.json must include `build/` and `css/`.
assert.ok(Array.isArray(pkg.files), 'package.json#files is an array');
assert.ok(pkg.files.includes('build/'), 'package.json#files contains build/');
assert.ok(pkg.files.includes('css/'), 'package.json#files contains css/');

// 6. CSS is present.
assert.ok(
  fs.existsSync(path.join(pkgRoot, 'css', 'styles.css')),
  'css/styles.css is present',
);

console.log('smoke-test: OK');
