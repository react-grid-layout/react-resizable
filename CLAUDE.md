# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
yarn

# Run tests with coverage
yarn test

# Run tests in watch mode
yarn unit

# Lint (ESLint + Flow)
yarn lint

# Type check only
yarn flow

# Build (transpile lib/ to build/)
yarn build

# Run dev server with examples
yarn dev

# Build examples for production
yarn build-example
```

Run a single test file:
```bash
npx jest __tests__/Resizable.test.js
```

Run tests matching a pattern:
```bash
npx jest --testNamePattern="snapshot"
```

## Architecture

This is a React component library providing resizable functionality via two main components:

### Core Components (`lib/`)

- **Resizable.js** - Stateless base component. Wraps a child element with draggable resize handles using `react-draggable`'s `DraggableCore`. Computes size changes from drag deltas, applies constraints, and invokes callbacks. Does not manage state - parent must set `width`/`height` props from callback data.

- **ResizableBox.js** - Stateful wrapper around `<Resizable>`. Manages width/height state internally and renders a `<div>` with those dimensions. Simpler API for common use cases.

- **propTypes.js** - Shared Flow types and PropTypes definitions. Exports `resizableProps` object and types like `ResizeHandleAxis`, `ResizeCallbackData`, etc.

- **utils.js** - Helper `cloneElement()` that merges `style` and `className` when cloning React elements.

### Key Implementation Details

- Resize handles are rendered as `<DraggableCore>` wrappers around handle elements
- Handle positions: `'s'`, `'w'`, `'e'`, `'n'`, `'sw'`, `'nw'`, `'se'`, `'ne'`
- The `runConstraints()` method applies min/max constraints and aspect ratio locking with slack tracking
- Position tracking via `lastHandleRect` compensates for element repositioning during north/west drags
- `transformScale` prop adjusts deltas when parent has CSS transform scaling

### Build Output

`yarn build` transpiles `lib/*.js` to `build/` and copies source files as `*.js.flow` for Flow consumers.

## Testing

Tests use Jest with Enzyme for shallow/mount rendering. Test files in `__tests__/` mirror the lib structure. Snapshot tests verify render output; unit tests verify resize behavior, constraint handling, and callback data.
