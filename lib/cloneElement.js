'use strict';

var assign = require('object-assign');
var React = require('react');

module.exports = function cloneElement(element, props) {
  if (props.style && element.props.style) {
    props.style = assign({}, element.props.style, props.style);
  }
  if (props.className && element.props.className) {
    props.className  = element.props.className + ' ' + props.className;
  }
  return React.cloneElement(element, props);
}
