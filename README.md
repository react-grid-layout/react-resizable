### React-Resizable

[View the Demo](https://strml.github.io/react-resizable/examples/1.html)

A simple widget that can be resized via a handle.

You can either use the `<Resizable>` element directly, or use the much simpler `<ResizableBox>` element.

See the example and associated code in [TestLayout](/test/TestLayout.jsx) and 
[ResizableBox](/lib/ResizableBox.jsx) for more details.

Make sure you use the associated styles in [/css/styles.css](/css/styles.css), as without them, you will have
problems with handle placement and visibility.


### Usage

```javascript
var ResizableBox = require('react-resizable').ResizableBox;

...
render: function() {
  return (
    <ResizableBox width={200} height={200} 
        minConstraints={[100, 100]} maxConstraints={[300, 300]}>
      <span>Contents</span>
    </ResizableBox>
  );
}
