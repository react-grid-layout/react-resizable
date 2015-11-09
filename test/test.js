'use strict';
var Layout = require('./TestLayout.jsx');
var React = require('react');
var ReactDOM = require('react-dom');
document.addEventListener("DOMContentLoaded", function(event) {
  var contentDiv = document.getElementById('content');
  ReactDOM.render(React.createElement(Layout), contentDiv);
});
