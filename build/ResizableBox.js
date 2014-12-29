'use strict';
var React = require('react/addons');
var Resizable = require('./Resizable');

// An example use of Resizable.
var ResizableBox = module.exports = React.createClass({
  displayName: 'ResizableBox',
  mixins: [React.addons.PureRenderMixin],

  propTypes: {
  },

  getInitialState:function() {
    return {
      width: this.props.width,
      height: this.props.height 
    };
  },

  onResize:function(event, $__0 ) {var element=$__0.element,size=$__0.size;
    this.setState({
      width: size.width,
      height: size.height
    });
  },

  render:function() {
    // Basic wrapper around a Resizable instance.
    // If you use Resizable directly, you are responsible for updating the component
    // with a new width and height.
    var $__0=     this.props,handleSize=$__0.handleSize,minConstraints=$__0.minConstraints,maxConstraints=$__0.maxConstraints,props=(function(source, exclusion) {var rest = {};var hasOwn = Object.prototype.hasOwnProperty;if (source == null) {throw new TypeError();}for (var key in source) {if (hasOwn.call(source, key) && !hasOwn.call(exclusion, key)) {rest[key] = source[key];}}return rest;})($__0,{handleSize:1,minConstraints:1,maxConstraints:1});
    return (
      React.createElement(Resizable, {
        minConstraints: minConstraints, 
        maxConstraints: maxConstraints, 
        handleSize: handleSize, 
        width: this.state.width, 
        height: this.state.height, 
        onResize: this.onResize
        }, 
        React.createElement("div", React.__spread({style: {width: this.state.width + 'px', height: this.state.height + 'px'}},  props), 
          this.props.children
        )
      )
    );
  }
});
