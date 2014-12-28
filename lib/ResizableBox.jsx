'use strict';
var React = require('react/addons');
var Resizable = require('./Resizable.jsx');

// An example use of Resizable.
var ResizableBox = module.exports = React.createClass({
  displayName: 'ResizableBox',
  mixins: [React.addons.PureRenderMixin],

  propTypes: {
  },

  getInitialState() {
    return {
      width: this.props.width,
      height: this.props.height 
    };
  },

  onResize(event, {element, size}) {
    this.setState({
      width: size.width,
      height: size.height
    });
  },

  render() {
    // Basic wrapper around a Resizable instance.
    // If you use Resizable directly, you are responsible for updating the component
    // with a new width and height.
    return (
      <Resizable 
        {...this.props}
        width={this.state.width}
        height={this.state.height}
        onResize={this.onResize}
        >
        <div className="box" style={{width: this.state.width + 'px', height: this.state.height + 'px'}}>
          {this.props.children}
        </div>
      </Resizable>
    );
  }
});
