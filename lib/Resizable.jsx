'use strict';
var React = require('react');
var Draggable = require('react-draggable');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var assign = require('object-assign');
var cloneElement = require('./cloneElement');

var Resizable = module.exports = React.createClass({
  displayName: 'Resizable',
  mixins: [PureRenderMixin],

  propTypes: {
    // Require that one and only one child be present.
    children: React.PropTypes.element.isRequired,
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
  },

  getDefaultProps() {
    return {
      handleSize: [20, 20]
    };
  },

  getInitialState: function() {
    return {
      bounds: this.constraintsToBounds(),
      initialWidth: this.props.width,
      initialHeight: this.props.height
    };
  },

  constraintsToBounds() {
    var p = this.props;
    var mins = p.minConstraints || p.handleSize;
    var maxes = p.maxConstraints || [Infinity, Infinity];
    return {
      left: mins[0] - p.width,
      top: mins[1] - p.height,
      right: maxes[0] - p.width,
      bottom: maxes[1] - p.height
    };
  },


  /**
   * Wrapper around drag events to provide more useful data.
   *
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
  resizeHandler(handlerName) {
    var me = this;
    return function(e, {node, position}) {
      me.props[handlerName] && me.props[handlerName](e, {node, size: calcWH(me.state, position)});

      if (handlerName === 'onResizeStart') {
        me.setState({resizing: true});
      } else if (handlerName === 'onResizeStop') {
        me.setState({resizing: false});
      }
    };
  },

  render() {
    var p = this.props, s = this.state;

    // What we're doing here is getting the child of this element, and cloning it with this element's props.
    // We are then defining its children as:
    // Its original children (resizable's child's children), and
    // A draggable handle.
    return cloneElement(p.children, assign({}, p, {
      children: [
        p.children.props.children,
        <Draggable
          {...p.draggableOpts}
          ref="draggable"
          onStop={this.resizeHandler('onResizeStop')}
          onStart={this.resizeHandler('onResizeStart')}
          onDrag={this.resizeHandler('onResize')}
          bounds={this.state.bounds}
          >
          <span className="react-resizable-handle" />
        </Draggable>
      ]
    }));
  }
});

/**
 * Parse left and top coordinates.
 * @param  {Number} options.left Left coordinate.
 * @param  {Number} options.top  Top coordinate.
 * @return {Object}              Coordinates
 */
function calcWH({initialWidth, initialHeight}, {left, top}) {
  return {width: initialWidth + left, height: initialHeight + top};
}
