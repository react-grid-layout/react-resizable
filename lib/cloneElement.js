// @flow
import React from 'react';

// React.addons.cloneWithProps look-alike that merges style & className.
module.exports = function cloneElement(element: React.Element<any>, props: Object): React.Element<any> {
  if (props.style && element.props.style) {
    props.style = {...element.props.style, ...props.style};
  }
  if (props.className && element.props.className) {
    props.className = `${element.props.className} ${props.className}`;
  }
  return React.cloneElement(element, props);
};
