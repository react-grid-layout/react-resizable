# React-Resizable

[![npm version](https://img.shields.io/npm/v/react-resizable.svg)](https://www.npmjs.com/package/react-resizable)
[![npm downloads](https://img.shields.io/npm/dm/react-resizable.svg)](https://www.npmjs.com/package/react-resizable)
[![Build Status](https://github.com/react-grid-layout/react-resizable/actions/workflows/test.yml/badge.svg)](https://github.com/react-grid-layout/react-resizable/actions/workflows/test.yml)

[**View the Demo**](https://react-grid-layout.github.io/react-resizable/examples/)

A simple widget that can be resized via one or more handles.

You can either use the `<Resizable>` element directly, or use the much simpler `<ResizableBox>` element.

See the example and associated code in [ExampleLayout](https://github.com/react-grid-layout/react-resizable/blob/master/examples/ExampleLayout.js) and
[ResizableBox](https://github.com/react-grid-layout/react-resizable/blob/master/lib/ResizableBox.js) for more details.

## Table of Contents

- [Installation](#installation)
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

## Compatibility

| Version | React Version |
|---------|---------------|
| [3.x](https://github.com/react-grid-layout/react-resizable/blob/master/CHANGELOG.md#300-may-10-2021) | `>= 16.3` |
| 2.x | Skipped |
| [1.x](https://github.com/react-grid-layout/react-resizable/blob/master/CHANGELOG.md#1111-mar-5-2021) | `14 - 17` |

## Usage

This package has two major exports:

* [`<Resizable>`](https://github.com/react-grid-layout/react-resizable/blob/master/lib/Resizable.js): A raw component that does not have state. Use as a building block for larger components, by listening to its callbacks and setting its props.
* [`<ResizableBox>`](https://github.com/react-grid-layout/react-resizable/blob/master/lib/ResizableBox.js): A simple `<div {...props} />` element that manages basic state. Convenient for simple use-cases.

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

```js
type ResizeCallbackData = {
  node: HTMLElement,
  size: {width: number, height: number},
  handle: ResizeHandleAxis
};

type ResizeHandleAxis = 's' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne';

type ResizableProps = {
  children: React.Element<any>,
  width: number,
  height: number,
  // Either a ReactElement to be used as handle, or a function
  // returning an element that is fed the handle's location as its first argument.
  handle: ReactElement<any> | (resizeHandle: ResizeHandleAxis, ref: ReactRef<HTMLElement>) => ReactElement<any>,
  // If you change this, be sure to update your css
  handleSize: [number, number] = [10, 10],
  lockAspectRatio: boolean = false,
  axis: 'both' | 'x' | 'y' | 'none' = 'both',
  minConstraints: [number, number] = [10, 10],
  maxConstraints: [number, number] = [Infinity, Infinity],
  onResizeStop?: ?(e: SyntheticEvent, data: ResizeCallbackData) => any,
  onResizeStart?: ?(e: SyntheticEvent, data: ResizeCallbackData) => any,
  onResize?: ?(e: SyntheticEvent, data: ResizeCallbackData) => any,
  draggableOpts?: ?Object,
  resizeHandles?: ?Array<ResizeHandleAxis> = ['se'],
  // If `transform: scale(n)` is set on the parent, this should be set to `n`.
  transformScale?: number = 1
};
```

The following props can also be used on `<ResizableBox>`:

```js
{
  style?: Object // styles the returned <div />
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
