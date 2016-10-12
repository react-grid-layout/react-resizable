### React-Resizable

[View the Demo](https://strml.github.io/react-resizable/examples/1.html)

A simple widget that can be resized via a handle.

You can either use the `<Resizable>` element directly, or use the much simpler `<ResizableBox>` element.

See the example and associated code in [TestLayout](/test/TestLayout.jsx) and
[ResizableBox](/lib/ResizableBox.jsx) for more details.

Make sure you use the associated styles in [/css/styles.css](/css/styles.css), as without them, you will have
problems with handle placement and visibility.

You can pass options directly to the underlying `Draggable` instance by using the prop `draggableOpts`.
See the [demo](/test/TestLayout.jsx) for more on this.

### Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save react-resizable

### Usage

```javascript
var Resizable = require('react-resizable').Resizable; // or,
var ResizableBox = require('react-resizable').ResizableBox;

// Using ES6 transpiler
import { Resizable, ResizableBox } from 'react-resizable';

...
render: function() {
  return (
    <ResizableBox width={200} height={200} draggableOpts={{...}}
        minConstraints={[100, 100]} maxConstraints={[300, 300]}>
      <span>Contents</span>
    </ResizableBox>
  );
}
```

### `<Resizable>` Options

```js
{
// Functions
onResizeStop: React.PropTypes.func,
onResizeStart: React.PropTypes.func,
onResize: React.PropTypes.func,

width: React.PropTypes.number.isRequired,
height: React.PropTypes.number.isRequired,
// If you change this, be sure to update your css
handleSize: React.PropTypes.array,
// These will be passed wholesale to react-draggable
draggableOpts: React.PropTypes.object
}
```

### `<ResizableBox>` Options

```js
{
lockAspectRatio: React.PropTypes.bool, // Preserves aspect

// Constaints coords, pass [x,y]
minConstraints: React.PropTypes.arrayOf(React.PropTypes.number),
maxConstraints: React.PropTypes.arrayOf(React.PropTypes.number),

// Initial width/height - otherwise use CSS
height: React.PropTypes.number,
width: React.PropTypes.number
}
```
```
