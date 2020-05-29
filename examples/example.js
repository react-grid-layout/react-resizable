import React from 'react';
import ReactDOM from 'react-dom';

import ExampleLayout from './ExampleLayout';

document.addEventListener("DOMContentLoaded", function(event) {
  var contentDiv = document.getElementById('content');
  ReactDOM.render(React.createElement(ExampleLayout), contentDiv);
});
