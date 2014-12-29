'use strict';
var React = require('react/addons');
var Draggable = require('react-draggable');
var assign = Object.assign || require('object.assign');

var Resizable = module.exports = React.createClass({
  displayName: 'Resizable',
  mixins: [React.addons.PureRenderMixin],

  propTypes: {
    children: React.PropTypes.element,
    // Functions
    onResizeStop: React.PropTypes.func,
    onResizeStart: React.PropTypes.func,
    onResize: React.PropTypes.func,

    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    // If you change this, be sure to update styles
    handleSize: React.PropTypes.array
  },

  getDefaultProps() {
    return {
      handleSize: [20, 20] 
    };
  },

  minConstraints() {
    return this.parseConstraints(this.props.minConstraints, this.props.handleSize[0]) || this.props.handleSize;
  },

  maxConstraints() {
    return this.parseConstraints(this.props.maxConstraints, this.props.handleSize[1]);
  },

  /**
   * Constraints must be subtracted by the size of the handle to work properly.
   * This has a side-effect of effectively limiting the minimum size to the handleSize,
   * which IMO is fine.
   * @param  {Array} constraints Constraints array.
   * @param  {Array} handleSize  Handle size array.
   * @return {Array}             Transformed constraints.
   */
  parseConstraints(constraints, handleSize) {
    if (!constraints) return;
    return constraints.map(function(c) {
      return c - handleSize;
    });
  },

  /**
   * Given left and top coords of the handle, figure out the width and height of the box.
   * @param  {Number} options.left Left coord.
   * @param  {Number} options.top  Top coord.
   * @return {Object}              Width & height (px).
   */
  calcWH({left, top}) {
    var s = this.props.handleSize;
    return {width: left + s[0], height: top + s[1]};
  },

  /**
   * Wrapper around drag events to provide more useful data.
   * 
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
  resizeHandler(handlerName) {
    var me = this;
    return function(e, {element, position}) {
      this.props[handlerName] && this.props[handlerName](e, {element, size: this.calcWH(position)});
    };
  },

  onResizeStart(e, {element, position}) {
    this.props.onResizeStart && this.props.onResizeStart(e, {element, size: this.calcWH(position)});
  },

  onResize(e, {element, position}) {
    this.props.onResize && this.props.onResize(e, {element, size: this.calcWH(position)});
  },

  onResizeStop(e, {element, position}) {
    this.props.onResizeStop && this.props.onResizeStop(e, {element, size: this.calcWH(position)});
  },

  render() {
    var p = this.props;
    // What we're doing here is getting the child of this element, and cloning it with this element's props. 
    // We are then defining its children as: 
    // Its original children (resizable's child's children), and
    // A draggable handle.

    return React.addons.cloneWithProps(p.children, assign({}, p, {
      // Array.isArray() check fixes react-hot-loader, doesn't seem to have other consequences
      children: Array.isArray(p.children) ? p.children : [
        p.children.props.children,
        <Draggable
          start={{x: p.width - 20 + 'px', y: p.height - 20 + 'px'}}
          moveOnStartChange={true}
          onStop={this.onResizeStop}
          onStart={this.onResizeStart}
          onDrag={this.onResize}
          minConstraints={this.minConstraints()}
          maxConstraints={this.maxConstraints()}
          >
          <span className="react-resizable-handle">⌟</span>
        </Draggable>
      ]
    }));
  }
});
