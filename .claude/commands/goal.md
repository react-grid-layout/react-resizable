---
description: Convert react-resizable from Flow to TypeScript
---

# Goal: Convert react-resizable from Flow to TypeScript

## Why

The repo is currently typed with Flow (v0.153.0, pinned to a 2020 version). Flow is no longer well-supported in the React ecosystem and most consumers expect TypeScript declarations. Convert the library source, tests, and build pipeline to TypeScript while preserving all public runtime behavior (including PropTypes) and the existing build output shape (CommonJS lib + ambient declarations consumed via `build/`).

## Constraints

- No behavior changes. Snapshots and unit tests must continue to pass.
- The public API surface is unchanged. `require('react-resizable').Resizable` and `.ResizableBox` must keep working.
- Keep `prop-types` runtime validation in place (downstream JS consumers rely on it).
- Continue to emit a CommonJS bundle from `build/` plus type declarations next to each module.
- Drop Flow (`flow-bin`, `.flowconfig`, `flow-typed/`, `@babel/preset-flow`, `// @flow` pragmas).

## Acceptance criteria

- [ ] `yarn install` succeeds.
- [ ] `yarn typecheck` (tsc --noEmit) passes with no errors.
- [ ] `yarn lint` passes (ESLint with @typescript-eslint).
- [ ] `yarn test` passes (all existing tests, including snapshots).
- [ ] `yarn build` produces `build/Resizable.js`, `build/ResizableBox.js`, `build/utils.js`, `build/propTypes.js` plus matching `.d.ts` declaration files.
- [ ] `index.js` still resolves to the built output.
- [ ] `package.json` advertises `"types": "./build/index.d.ts"` (or equivalent) so TS consumers get IntelliSense.
- [ ] No `.flow` files remain in `lib/`. No `// @flow` pragmas.

## Plan

1. **Tooling**: add `typescript`, `@types/react`, `@types/react-dom`, `@types/prop-types`, `@types/jest`, `@babel/preset-typescript`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`. Remove `flow-bin`, `@babel/preset-flow`. Write `tsconfig.json` (target ES2020, jsx react, declaration true, declarationDir ./build, noEmit configurable via separate `tsconfig.build.json`).
2. **Babel**: replace `@babel/preset-flow` with `@babel/preset-typescript` in `.babelrc`.
3. **Source conversion (`lib/`)**:
   - `utils.js` → `utils.ts`
   - `propTypes.js` → `propTypes.ts` (keep runtime PropTypes; export TS types alongside)
   - `Resizable.js` → `Resizable.tsx`
   - `ResizableBox.js` → `ResizableBox.tsx`
   - Map Flow types: `?T` → `T | null | undefined`, `SyntheticEvent<>` → `React.SyntheticEvent`, `Node as ReactNode` → `React.ReactNode`, `Element as ReactElement` → `React.ReactElement`, `ElementConfig<typeof X>` → `React.ComponentProps<typeof X>`, `ReactRef<T>` → `React.RefObject<T>`.
   - Strip `// @flow` pragmas.
4. **Tests (`__tests__/`)**:
   - Rename `.test.js` → `.test.tsx` where JSX is used, otherwise `.test.ts`.
   - Fix any test typings that need help (e.g., enzyme/testing-library queries).
   - Re-record snapshots only if structural output is unchanged.
5. **Build pipeline**:
   - `build.sh` runs babel (transpile .ts/.tsx → JS) and `tsc --emitDeclarationOnly` for .d.ts files.
   - Drop the `cp *.js *.js.flow` step.
6. **package.json scripts**:
   - `lint`: ESLint over `.ts,.tsx`.
   - `typecheck`: `tsc --noEmit`.
   - Remove the `flow` script.
7. **ESLint**: update `eslint.config.js` to parse TS with `@typescript-eslint/parser` and include `@typescript-eslint` rules at "recommended" level. Keep existing react/jest plugins.
8. **Examples**: keep `examples/example.js` as JS — out of scope for this conversion. Update webpack to still build it.
9. **Run the acceptance gate**: `yarn install && yarn typecheck && yarn lint && yarn test && yarn build`. Fix everything until green.
10. **Commit**: one commit, message `chore: convert library from Flow to TypeScript`.

## Out of scope

- Examples directory (`examples/*.js`).
- API/behavior changes.
- Bumping major dependency versions beyond what's needed for TS to work.
- Migrating ESLint plugins beyond what's needed for TS parsing.
