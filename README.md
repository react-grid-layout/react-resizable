# React-Resizable

[![npm version](https://img.shields.io/npm/v/react-resizable.svg)](https://www.npmjs.com/package/react-resizable)
[![npm downloads](https://img.shields.io/npm/dm/react-resizable.svg)](https://www.npmjs.com/package/react-resizable)
[![Build Status](https://github.com/react-grid-layout/react-resizable/actions/workflows/test.yml/badge.svg)](https://github.com/react-grid-layout/react-resizable/actions/workflows/test.yml)

[**View the Demo**](https://react-grid-layout.github.io/react-resizable/examples/)

A simple widget that can be resized via one or more handles.

You can either use the `<Resizable>` element directly, or use the much simpler `<ResizableBox>` element.

See the example and associated code in [ExampleLayout](https://github.com/react-grid-layout/react-resizable/blob/master/examples/ExampleLayout.js) and
[ResizableBox](https://github.com/react-grid-layout/react-resizable/blob/master/lib/ResizableBox.tsx) for more details.

## Table of Contents

- [Installation](#installation)
- [TypeScript](#typescript)
- [Compatibility](#compatibility)
- [Usage](#usage)
  - [Resizable](#resizable)
  - [ResizableBox](#resizablebox)
- [Props](#props)
- [Extracting Styles](#extracting-styles)
- [Custom Resize Handles](#resize-handle)

## Installation

```bash
$ npm install --save react-resizable
```

## Extracting Styles

You **must** include the associated styles in your application, otherwise the resize handles will not be visible and will not work properly.

```js
// In your JS/TS entry point:
import 'react-resizable/css/styles.css';
```

Or import it in your CSS:

```css
@import 'react-resizable/css/styles.css';
```

If you're using a bundler that doesn't support CSS imports, you can find the styles at `node_modules/react-resizable/css/styles.css` and include them manually.

## TypeScript

As of `4.0.0`, the library is authored in TypeScript and ships bundled type
declarations in `build/*.d.ts`. You **do not** need to install
`@types/react-resizable`; if you previously installed it, remove it so the
bundled types take precedence:

```bash
npm uninstall @types/react-resizable
# or
yarn remove @types/react-resizable
```

Public types are re-exported from the package root:

```ts
import {
  Resizable,
  ResizableBox,
  // types
  type ResizeCallbackData,
  type ResizeHandleAxis,
  type Axis,
  type Props as ResizableProps,
} from 'react-resizable';
```

### Flow

Flow is no longer supported as of `4.0.0`. Earlier versions shipped
`*.js.flow` sidecar files generated from the Flow-annotated source; those
have been removed.

If you still need Flow types, you can vendor the last Flow-annotated source
locally from the [`3.2.0` tag](https://github.com/react-grid-layout/react-resizable/tree/db2e37eda85fb21b1864e36b01c4922452f28418/lib).
They will not be updated to reflect changes landing after `4.0.0`. The
official recommendation is to migrate to TypeScript.

## Compatibility

| Version | React Version | Types          |
|---------|---------------|----------------|
| [4.x](https://github.com/react-grid-layout/react-resizable/blob/master/CHANGELOG.md#400-may-12-2026) | `>= 16.3` | TypeScript (bundled) |
| [3.x](https://github.com/react-grid-layout/react-resizable/blob/master/CHANGELOG.md#300-may-10-2021) | `>= 16.3` | Flow (`*.js.flow`) |
| 2.x | Skipped | — |
| [1.x](https://github.com/react-grid-layout/react-resizable/blob/master/CHANGELOG.md#1111-mar-5-2021) | `14 - 17` | Flow |

## Usage

This package has two major exports:

* [`<Resizable>`](https://github.com/react-grid-layout/react-resizable/blob/master/lib/Resizable.tsx): A raw component that does not have state. Use as a building block for larger components, by listening to its callbacks and setting its props.
* [`<ResizableBox>`](https://github.com/react-grid-layout/react-resizable/blob/master/lib/ResizableBox.tsx): A simple `<div {...props} />` element that manages basic state. Convenient for simple use-cases.

### `<Resizable>`

```js
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';

class Example extends React.Component {
  state = {
    width: 200,
    height: 200,
  };

  onResize = (event, {node, size, handle}) => {
    this.setState({width: size.width, height: size.height});
  };

  render() {
    return (
      <Resizable
        height={this.state.height}
        width={this.state.width}
        onResize={this.onResize}
      >
        <div
          className="box"
          style={{width: this.state.width + 'px', height: this.state.height + 'px'}}
        >
          <span>Contents</span>
        </div>
      </Resizable>
    );
  }
}
```

### `<ResizableBox>`

```js
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

class Example extends React.Component {
  render() {
    return (
      <ResizableBox
        width={200}
        height={200}
        draggableOpts={{grid: [25, 25]}}
        minConstraints={[100, 100]}
        maxConstraints={[300, 300]}
      >
        <span>Contents</span>
      </ResizableBox>
    );
  }
}
```

## Props

These props apply to both `<Resizable>` and `<ResizableBox>`. Unknown props that are not in the list below will be passed to the child component.

```ts
type ResizeCallbackData = {
  node: HTMLElement;
  size: {width: number; height: number};
  handle: ResizeHandleAxis;
};

type ResizeHandleAxis = 's' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne';

type ResizableProps = {
  children: React.ReactElement<any>;
  width: number;
  height: number;
  // Either a ReactElement to be used as handle, or a function
  // returning an element that is fed the handle's location as its first argument.
  handle?:
    | React.ReactElement<any>
    | ((resizeHandle: ResizeHandleAxis, ref: React.RefObject<HTMLElement>) => React.ReactElement<any>);
  // If you change this, be sure to update your css. Default: [20, 20].
  handleSize?: [number, number];
  lockAspectRatio?: boolean;                       // default: false
  axis?: 'both' | 'x' | 'y' | 'none';              // default: 'both'
  minConstraints?: [number, number];               // default: [20, 20]
  maxConstraints?: [number, number];               // default: [Infinity, Infinity]
  onResizeStop?:  (e: React.SyntheticEvent, data: ResizeCallbackData) => any;
  onResizeStart?: (e: React.SyntheticEvent, data: ResizeCallbackData) => any;
  onResize?:      (e: React.SyntheticEvent, data: ResizeCallbackData) => any;
  // Forwarded to react-draggable's <DraggableCore>.
  draggableOpts?: Partial<React.ComponentProps<typeof import('react-draggable').DraggableCore>>;
  resizeHandles?: ResizeHandleAxis[];              // default: ['se']
  // If `transform: scale(n)` is set on the parent, this should be set to `n`.
  transformScale?: number;                         // default: 1
};
```

The following props can also be used on `<ResizableBox>`:

```ts
{
  style?: React.CSSProperties; // styles the returned <div />
}
```

If a `width` or `height` is passed to `<ResizableBox>`'s `style` prop, it will be ignored as it is required for internal function.

You can pass options directly to the underlying `DraggableCore` instance by using the prop `draggableOpts`. See the [demo](https://react-grid-layout.github.io/react-resizable/examples/) for more on this.

## Resize Handle

If you override the resize handle, we expect that any `ref` passed to your new handle will represent the underlying DOM element.

This is required, as `react-resizable` must be able to access the underlying DOM node to attach handlers and measure position deltas.

There are a few ways to do this:

### Native DOM Element

This requires no special treatment.

```js
<Resizable handle={<div className="foo" />} />
```

### Custom React Component

You must [forward the ref](https://reactjs.org/docs/forwarding-refs.html) and props to the underlying DOM element.

#### Class Components

```js
class MyHandleComponent extends React.Component {
  render() {
    const {handleAxis, innerRef, ...props} = this.props;
    return <div ref={innerRef} className={`foo handle-${handleAxis}`} {...props} />
  }
}
const MyHandle = React.forwardRef((props, ref) => <MyHandleComponent innerRef={ref} {...props} />);

<Resizable handle={<MyHandle />} />
```

#### Functional Components

```js
const MyHandle = React.forwardRef((props, ref) => {
  const {handleAxis, ...restProps} = props;
  return <div ref={ref} className={`foo handle-${handleAxis}`} {...restProps} />;
});

<Resizable handle={<MyHandle />} />
```

### Custom Function

You can define a function as a handle, which will simply receive an axis (see above `ResizeHandleAxis` type) and ref. This may be more clear to read, depending on your coding style.

```js
const MyHandle = (props) => {
  return <div ref={props.innerRef} className="foo" {...props} />;
};

<Resizable handle={(handleAxis, ref) => <MyHandle innerRef={ref} className={`foo handle-${handleAxis}`} />} />
```

## License

MIT
