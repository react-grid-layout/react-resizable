### React-Resizable

[View the Demo](https://strml.github.io/react-resizable/examples/1.html)

A simple widget that can be resized via one or more handles.

You can either use the `<Resizable>` element directly, or use the much simpler `<ResizableBox>` element.

See the example and associated code in [TestLayout](/test/TestLayout.js) and
[ResizableBox](/lib/ResizableBox.js) for more details.

Make sure you use the associated styles in [/css/styles.css](/css/styles.css), as without them, you will have
problems with handle placement and visibility.

You can pass options directly to the underlying `DraggableCore` instance by using the prop `draggableOpts`.
See the [demo](/test/TestLayout.js) for more on this.

### Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save react-resizable

### Usage

```js
const Resizable = require('react-resizable').Resizable; // or,
const ResizableBox = require('react-resizable').ResizableBox;

// ES6
import { Resizable, ResizableBox } from 'react-resizable';

// ...
render() {
  return (
    <ResizableBox width={200} height={200} draggableOpts={{...}}
        minConstraints={[100, 100]} maxConstraints={[300, 300]}>
      <span>Contents</span>
    </ResizableBox>
  );
}
```

### Props

These props apply to both `<Resizable>` and `<ResizableBox>`.

```js
{
  children: React.Element<any>,
  width: number,
  height: number,
  // Either a ReactElement to be used as handle, or a function returning an element that is fed the handle's location as its first argument.
  handle: ReactElement<any> | (resizeHandle: 's' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne') => ReactElement<any>,
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
  resizeHandles?: ?Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'> = ['se']
};
```
