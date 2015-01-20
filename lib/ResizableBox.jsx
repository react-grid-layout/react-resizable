'use strict';
var React = require('react');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var Resizable = require('./Resizable');

// An example use of Resizable.
var ResizableBox = module.exports = React.createClass({
  displayName: 'ResizableBox',
  mixins: [PureRenderMixin],

  propTypes: {
  },

  getInitialState() {
    return {
      width: this.props.width,
      height: this.props.height 
    };
  },

  onResize(event, {element, size}) {
    if (size.width !== this.state.width || size.height !== this.state.height) {
      this.setState({
        width: size.width,
        height: size.height
      });
    }
  },

  render() {
    // Basic wrapper around a Resizable instance.
    // If you use Resizable directly, you are responsible for updating the component
    // with a new width and height.
    var {handleSize, minConstraints, maxConstraints, ...props} = this.props;
    return (
      <Resizable 
        minConstraints={minConstraints}
        maxConstraints={maxConstraints}
        handleSize={handleSize}
        width={this.state.width}
        height={this.state.height}
        onResize={this.onResize}
        draggableOpts={this.props.draggableOpts}
        >
        <div style={{width: this.state.width + 'px', height: this.state.height + 'px'}} {...props}>
          {this.props.children}
        </div>
      </Resizable>
    );
  }
});
