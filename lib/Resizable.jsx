'use strict';
var React = require('react/addons');
var Draggable = require('react-draggable');

var Resizable = module.exports = React.createClass({
  displayName: 'Resizable',
  mixins: [React.addons.PureRenderMixin],

  propTypes: {
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

  getInitialState() {
    var p = this.props;
    return {
      cancelled: false,
      minConstraints: this.parseConstraints(p.minConstraints, p.handleSize[0]) || this.props.handleSize,
      maxConstraints: this.parseConstraints(p.maxConstraints, p.handleSize[1])
    };
  },

  componentWillReceiveProps(p) {
    this.setState({
      minConstraints: this.parseConstraints(p.minConstraints, p.handleSize[0]) || this.props.handleSize,
      maxConstraints: this.parseConstraints(p.maxConstraints, p.handleSize[1])
    });
  },

  parseConstraints(constraints, handleSize) {
    if (!constraints) return;
    return constraints.map(function(c) {
      return c - handleSize;
    });
  },

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
    var child = React.addons.cloneWithProps(React.Children.only(this.props.children), {
      children: [
        React.Children.only(this.props.children).props.children,
        <Draggable
          start={{x: p.width - 20 + 'px', y: p.height - 20 + 'px'}}
          moveOnStartChange={true}
          onStop={this.onResizeStop}
          onStart={this.onResizeStart}
          onDrag={this.onResize}
          minConstraints={this.state.minConstraints}
          maxConstraints={this.state.maxConstraints}
          >
          <span className="react-resizable-handle">⌟</span>
        </Draggable>
      ]
    });

    return child;
  }
});
