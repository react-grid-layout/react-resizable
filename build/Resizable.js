/* */ 
'use strict';
exports.__esModule = true;
var _extends = Object.assign || function(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};
var _react = require('react');
var _react2 = _interopRequireDefault(_react);
var _reactDraggable = require('react-draggable');
var _cloneElement = require('./cloneElement');
var _cloneElement2 = _interopRequireDefault(_cloneElement);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
function _objectWithoutProperties(obj, keys) {
  var target = {};
  for (var i in obj) {
    if (keys.indexOf(i) >= 0)
      continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i))
      continue;
    target[i] = obj[i];
  }
  return target;
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === "object" || typeof call === "function") ? call : self;
}
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }});
  if (superClass)
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
var Resizable = function(_React$Component) {
  _inherits(Resizable, _React$Component);
  function Resizable() {
    var _temp,
        _this,
        _ret;
    _classCallCheck(this, Resizable);
    for (var _len = arguments.length,
        args = Array(_len),
        _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.state = {
      resizing: false,
      width: _this.props.width,
      height: _this.props.height,
      slackW: 0,
      slackH: 0
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }
  Resizable.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (!this.state.resizing && (nextProps.width !== this.props.width || nextProps.height !== this.props.height)) {
      this.setState({
        width: nextProps.width,
        height: nextProps.height
      });
    }
  };
  Resizable.prototype.lockAspectRatio = function lockAspectRatio(width, height, aspectRatio) {
    height = width / aspectRatio;
    width = height * aspectRatio;
    return [width, height];
  };
  Resizable.prototype.runConstraints = function runConstraints(width, height) {
    var min = this.props.minConstraints;
    var max = this.props.maxConstraints;
    if (this.props.lockAspectRatio) {
      var ratio = this.state.width / this.state.height;
      height = width / ratio;
      width = height * ratio;
    }
    if (!min && !max)
      return [width, height];
    var oldW = width;
    var oldH = height;
    var _state = this.state;
    var slackW = _state.slackW;
    var slackH = _state.slackH;
    width += slackW;
    height += slackH;
    if (min) {
      width = Math.max(min[0], width);
      height = Math.max(min[1], height);
    }
    if (max) {
      width = Math.min(max[0], width);
      height = Math.min(max[1], height);
    }
    slackW += oldW - width;
    slackH += oldH - height;
    if (slackW !== this.state.slackW || slackH !== this.state.slackH) {
      this.setState({
        slackW: slackW,
        slackH: slackH
      });
    }
    return [width, height];
  };
  Resizable.prototype.resizeHandler = function resizeHandler(handlerName) {
    var _this2 = this;
    return function(e, _ref) {
      var node = _ref.node;
      var position = _ref.position;
      var deltaX = position.deltaX;
      var deltaY = position.deltaY;
      var width = _this2.state.width + deltaX,
          height = _this2.state.height + deltaY;
      var widthChanged = width !== _this2.state.width,
          heightChanged = height !== _this2.state.height;
      if (handlerName === 'onResize' && !widthChanged && !heightChanged)
        return;
      var _runConstraints = _this2.runConstraints(width, height);
      width = _runConstraints[0];
      height = _runConstraints[1];
      var newState = {};
      if (handlerName === 'onResizeStart') {
        newState.resizing = true;
      } else if (handlerName === 'onResizeStop') {
        newState.resizing = false;
      } else {
        if (width === _this2.state.width && height === _this2.state.height)
          return;
        newState.width = width;
        newState.height = height;
      }
      _this2.setState(newState, function() {
        _this2.props[handlerName] && _this2.props[handlerName](e, {
          node: node,
          size: {
            width: width,
            height: height
          }
        });
      });
    };
  };
  Resizable.prototype.render = function render() {
    var _props = this.props;
    var width = _props.width;
    var height = _props.height;
    var p = _objectWithoutProperties(_props, ['width', 'height']);
    var className = p.className ? p.className + ' react-resizable' : 'react-resizable';
    return (0, _cloneElement2.default)(p.children, _extends({}, p, {
      className: className,
      children: [p.children.props.children, _react2.default.createElement(_reactDraggable.DraggableCore, _extends({}, p.draggableOpts, {
        ref: 'draggable',
        onStop: this.resizeHandler('onResizeStop'),
        onStart: this.resizeHandler('onResizeStart'),
        onDrag: this.resizeHandler('onResize')
      }), _react2.default.createElement('span', {className: 'react-resizable-handle'}))]
    }));
  };
  return Resizable;
}(_react2.default.Component);
Resizable.propTypes = {
  children: _react.PropTypes.element.isRequired,
  width: _react.PropTypes.number.isRequired,
  height: _react.PropTypes.number.isRequired,
  handleSize: _react.PropTypes.array,
  lockAspectRatio: _react.PropTypes.bool,
  minConstraints: _react.PropTypes.arrayOf(_react.PropTypes.number),
  maxConstraints: _react.PropTypes.arrayOf(_react.PropTypes.number),
  onResizeStop: _react.PropTypes.func,
  onResizeStart: _react.PropTypes.func,
  onResize: _react.PropTypes.func,
  draggableOpts: _react.PropTypes.object
};
Resizable.defaultProps = {
  handleSize: [20, 20],
  lockAspectRatio: false,
  minConstraints: [20, 20],
  maxConstraints: [Infinity, Infinity]
};
exports.default = Resizable;
