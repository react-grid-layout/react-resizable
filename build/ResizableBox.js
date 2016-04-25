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
var _Resizable = require('./Resizable');
var _Resizable2 = _interopRequireDefault(_Resizable);
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
var ResizableBox = function(_React$Component) {
  _inherits(ResizableBox, _React$Component);
  function ResizableBox() {
    var _temp,
        _this,
        _ret;
    _classCallCheck(this, ResizableBox);
    for (var _len = arguments.length,
        args = Array(_len),
        _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.state = {
      width: _this.props.width,
      height: _this.props.height
    }, _this.onResize = function(event, _ref) {
      var element = _ref.element;
      var size = _ref.size;
      var width = size.width;
      var height = size.height;
      _this.setState(size, function() {
        _this.props.onResize && _this.props.onResize(event, {
          element: element,
          size: size
        });
      });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }
  ResizableBox.prototype.render = function render() {
    var _props = this.props;
    var handleSize = _props.handleSize;
    var onResizeStart = _props.onResizeStart;
    var onResizeStop = _props.onResizeStop;
    var draggableOpts = _props.draggableOpts;
    var minConstraints = _props.minConstraints;
    var maxConstraints = _props.maxConstraints;
    var lockAspectRatio = _props.lockAspectRatio;
    var width = _props.width;
    var height = _props.height;
    var props = _objectWithoutProperties(_props, ['handleSize', 'onResizeStart', 'onResizeStop', 'draggableOpts', 'minConstraints', 'maxConstraints', 'lockAspectRatio', 'width', 'height']);
    return _react2.default.createElement(_Resizable2.default, {
      handleSize: handleSize,
      width: this.state.width,
      height: this.state.height,
      onResizeStart: onResizeStart,
      onResize: this.onResize,
      onResizeStop: onResizeStop,
      draggableOpts: draggableOpts,
      minConstraints: minConstraints,
      maxConstraints: maxConstraints,
      lockAspectRatio: lockAspectRatio
    }, _react2.default.createElement('div', _extends({style: {
        width: this.state.width + 'px',
        height: this.state.height + 'px'
      }}, props)));
  };
  return ResizableBox;
}(_react2.default.Component);
ResizableBox.propTypes = {
  height: _react.PropTypes.number,
  width: _react.PropTypes.number
};
ResizableBox.defaultProps = {handleSize: [20, 20]};
exports.default = ResizableBox;
