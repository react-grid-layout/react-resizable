import React from 'react';

// React.addons.cloneWithProps look-alike that merges style & className.
export function cloneElement(
  element: React.ReactElement<any>,
  props: Record<string, any>,
): React.ReactElement<any> {
  if (props.style && (element.props as any).style) {
    props.style = {...(element.props as any).style, ...props.style};
  }
  if (props.className && (element.props as any).className) {
    props.className = `${(element.props as any).className} ${props.className}`;
  }
  return React.cloneElement(element, props);
}
