'use strict';

var assign = require('object-assign');
var React = require('react');

// React.addons.cloneWithProps look-alike that merges style & className.
module.exports = function cloneElement(element: React.Component, props: Object) {
  if (props.style && element.props.style) {
    props.style = assign({}, element.props.style, props.style);
  }
  if (props.className && element.props.className) {
    props.className = element.props.className + ' ' + props.className;
  }
  return React.cloneElement(element, props);
};
