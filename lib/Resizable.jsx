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
    return parseConstraints(this.props.minConstraints, this.props.handleSize[0]) || this.props.handleSize;
  },

  maxConstraints() {
    return parseConstraints(this.props.maxConstraints, this.props.handleSize[1]);
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
      me.props[handlerName] && me.props[handlerName](e, {element, size: calcWH(position, me.props.handleSize)});
    };
  },

  render() {
    var p = this.props;
    // What we're doing here is getting the child of this element, and cloning it with this element's props. 
    // We are then defining its children as: 
    // Its original children (resizable's child's children), and
    // A draggable handle.

    return React.addons.cloneWithProps(p.children, assign({}, p, {
      children: [
        p.children.props.children,
        <Draggable
          start={{x: p.width - 20 + 'px', y: p.height - 20 + 'px'}}
          moveOnStartChange={true}
          onStop={this.resizeHandler('onResizeStop')}
          onStart={this.resizeHandler('onResizeStart')}
          onDrag={this.resizeHandler('onResize')}
          minConstraints={this.minConstraints()}
          maxConstraints={this.maxConstraints()}
          >
          <span className="react-resizable-handle" />
        </Draggable>
      ]
    }));
  }
});

/**
 * Parse left and top coordinates; we have to add the handle size to get the full picture.
 * @param  {Number} options.left Left coordinate.
 * @param  {Number} options.top  Top coordinate.
 * @param  {Array}  handleSize   Handle data.
 * @return {Object}              Coordinates
 */
function calcWH({left, top}, handleSize) {
  return {width: left + handleSize[0], height: top + handleSize[1]};
}

/**
 * Constraints must be subtracted by the size of the handle to work properly.
 * This has a side-effect of effectively limiting the minimum size to the handleSize,
 * which IMO is fine.
 * @param  {Array} constraints Constraints array.
 * @param  {Array} handleSize  Handle size array.
 * @return {Array}             Transformed constraints.
 */
function parseConstraints(constraints, handleSize) {
  if (!constraints) return;
  return constraints.map(function(c) {
    return c - handleSize;
  });
}
