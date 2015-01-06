"use strict";

var _objectWithoutProperties = function (obj, keys) {
  var target = {};
  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

"use strict";
var React = require("react/addons");
var Resizable = require("./Resizable");

// An example use of Resizable.
var ResizableBox = module.exports = React.createClass({
  displayName: "ResizableBox",
  mixins: [React.addons.PureRenderMixin],

  propTypes: {},

  getInitialState: function () {
    return {
      width: this.props.width,
      height: this.props.height
    };
  },

  onResize: function (event, _ref) {
    var element = _ref.element;
    var size = _ref.size;
    if (size.width !== this.state.width || size.height !== this.state.height) {
      this.setState({
        width: size.width,
        height: size.height
      });
    }
  },

  render: function () {
    // Basic wrapper around a Resizable instance.
    // If you use Resizable directly, you are responsible for updating the component
    // with a new width and height.
    var handleSize = this.props.handleSize;
    var minConstraints = this.props.minConstraints;
    var maxConstraints = this.props.maxConstraints;
    var props = _objectWithoutProperties(this.props, ["handleSize", "minConstraints", "maxConstraints"]);

    return React.createElement(Resizable, {
      minConstraints: minConstraints,
      maxConstraints: maxConstraints,
      handleSize: handleSize,
      width: this.state.width,
      height: this.state.height,
      onResize: this.onResize,
      draggableOpts: this.props.draggableOpts
    }, React.createElement("div", React.__spread({
      style: { width: this.state.width + "px", height: this.state.height + "px" }
    }, props), this.props.children));
  }
});