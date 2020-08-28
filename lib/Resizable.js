// @flow
import React from 'react';
import type {Node as ReactNode} from 'react';
import {DraggableCore} from 'react-draggable';
import {cloneElement} from './utils';
import {resizableProps} from "./propTypes";
import type {ResizeHandleAxis, Props, ResizableState, DragCallbackData, ClientRect} from './propTypes';

export default class Resizable extends React.Component<Props, ResizableState> {
  static propTypes = resizableProps;

  static defaultProps =  {
    handleSize: [20, 20],
    lockAspectRatio: false,
    axis: 'both',
    minConstraints: [20, 20],
    maxConstraints: [Infinity, Infinity],
    resizeHandles: ['se'],
    transformScale: 1
  };

  state: ResizableState = {
    slackW: 0, slackH: 0,
  };

  lastHandleRect: ?ClientRect = null;
  draggingNode: ?HTMLElement = null;

  lockAspectRatio(width: number, height: number, aspectRatio: number): [number, number] {
    height = width / aspectRatio;
    width = height * aspectRatio;
    return [width, height];
  }

  // If you do this, be careful of constraints
  runConstraints(width: number, height: number): [number, number] {
    const [min, max] = [this.props.minConstraints, this.props.maxConstraints];
    if (!min && !max) return [width, height];

    // Fit width & height to aspect ratio
    if (this.props.lockAspectRatio) {
      if (height === this.props.height) {
        const ratio = this.props.width / this.props.height;
        height = width / ratio;
        width = height * ratio;
      } else {
        // Take into account vertical resize with N/S handles on locked aspect
        // ratio. Calculate the change height-first, instead of width-first
        const ratio = this.props.height / this.props.width;
        width = height / ratio;
        height = width * ratio;
      }
    }

    const [oldW, oldH] = [width, height];

    // Add slack to the values used to calculate bound position. This will ensure that if
    // we start removing slack, the element won't react to it right away until it's been
    // completely removed.
    let {slackW, slackH} = this.state;
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

    // If the numbers changed, we must have introduced some slack. Record it for the next iteration.
    slackW += (oldW - width);
    slackH += (oldH - height);
    if (slackW !== this.state.slackW || slackH !== this.state.slackH) {
      this.setState({slackW, slackH});
    }

    return [width, height];
  }

  /**
   * Wrapper around drag events to provide more useful data.
   *
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
  resizeHandler(handlerName: string, axis: ResizeHandleAxis): Function {
    return (e: SyntheticEvent<> | MouseEvent, {node, deltaX, deltaY}: DragCallbackData) => {
      deltaX /= this.props.transformScale;
      deltaY /= this.props.transformScale;

      // Axis restrictions
      const canDragX = (this.props.axis === 'both' || this.props.axis === 'x') && ['n', 's'].indexOf(axis) === -1;
      const canDragY = (this.props.axis === 'both' || this.props.axis === 'y') && ['e', 'w'].indexOf(axis) === -1;

      /*
        Track the element being dragged to account for changes in position.
        If a handle's position is changed between callbacks, we need to factor this in to the next callback
      */
      if (this.draggingNode == null && e.target instanceof HTMLElement) {
        this.draggingNode = e.target;
      }
      if (this.draggingNode instanceof HTMLElement) {
        const handleRect = this.draggingNode.getBoundingClientRect();
        if (this.lastHandleRect != null) {
          // Find how much the handle has moved since the last callback
          const deltaLeftSinceLast = handleRect.left - this.lastHandleRect.left;
          const deltaTopSinceLast = handleRect.top - this.lastHandleRect.top;
          
          // If the handle has repositioned on either axis since last render,
          // we need to increase our callback values by this much.
          // Only checking 'n', 'w' since resizing by 's', 'w' won't affect the overall position on page
          if (canDragX && axis[axis.length - 1] === 'w') {
            deltaX += deltaLeftSinceLast / this.props.transformScale;
          }
          if(canDragY && axis[0] === 'n') {
            deltaY += deltaTopSinceLast / this.props.transformScale;
          }
        }
        this.lastHandleRect = {
          top: handleRect.top,
          left: handleRect.left,
        };
      }

      // reverse delta if using top or left drag handles
      if (canDragX && axis[axis.length - 1] === 'w') {
        deltaX = -deltaX;
      }
      if (canDragY && axis[0] === 'n') {
        deltaY = -deltaY;
      }

      // Update w/h
      let width = this.props.width + (canDragX ? deltaX : 0);
      let height = this.props.height + (canDragY ? deltaY : 0);

      // Early return if no change
      const widthChanged = width !== this.props.width, heightChanged = height !== this.props.height;
      if (handlerName === 'onResize' && !widthChanged && !heightChanged) return;

      [width, height] = this.runConstraints(width, height);

      // Set the appropriate state for this handler.
      const newState = {};
      if (handlerName === 'onResizeStart') {
        // nothing
      } else if (handlerName === 'onResizeStop') {
        newState.slackW = newState.slackH = 0;
        this.lastHandleRect = this.draggingNode = null;
      } else {
        // Early return if no change after constraints
        if (width === this.props.width && height === this.props.height) return;
      }

      const hasCb = typeof this.props[handlerName] === 'function';
      if (hasCb) {
        // $FlowIgnore isn't refining this correctly to SyntheticEvent
        if (typeof e.persist === 'function') e.persist();
        this.setState(newState, () => this.props[handlerName](e, {node, size: {width, height}, handle: axis}));
      } else {
        this.setState(newState);
      }
    };
  }

  renderResizeHandle(resizeHandleAxis: ResizeHandleAxis): ReactNode {
    const {handle} = this.props;
    if (handle) {
      if (typeof handle === 'function') {
        return handle(resizeHandleAxis);
      }
      return handle;
    }
    return <span className={`react-resizable-handle react-resizable-handle-${resizeHandleAxis}`} />;
  }

  render(): ReactNode {
    const {children, draggableOpts, resizeHandles, className} = this.props;

    // What we're doing here is getting the child of this element, and cloning it with this element's props.
    // We are then defining its children as:
    // Its original children (resizable's child's children), and
    // One or more draggable handles.
    return cloneElement(children, {
      className: `${className ? `${className} ` : ''}react-resizable`,
      children: [
        ...children.props.children,
        ...resizeHandles.map(h => (
          <DraggableCore
            {...draggableOpts}
            key={`resizableHandle-${h}`}
            onStop={this.resizeHandler('onResizeStop', h)}
            onStart={this.resizeHandler('onResizeStart', h)}
            onDrag={this.resizeHandler('onResize', h)}
          >
            {this.renderResizeHandle(h)}
          </DraggableCore>
        ))
      ]
    });
  }
}
