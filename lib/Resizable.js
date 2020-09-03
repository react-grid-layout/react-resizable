// @flow
import React from 'react';
import type {Node as ReactNode} from 'react';
import {DraggableCore} from 'react-draggable';
import {cloneElement} from './utils';
import {resizableProps} from "./propTypes";
import type {ResizeHandleAxis, Props, ResizableState, DragCallbackData} from './propTypes';

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

  state: ResizableState = undefined;

  lastHandleRect: ?ClientRect = null;
  slack: ?[number, number] = null;

  componentWillUnmount() {
    this.resetData();
  }

  lockAspectRatio(width: number, height: number, aspectRatio: number): [number, number] {
    height = width / aspectRatio;
    width = height * aspectRatio;
    return [width, height];
  }

  resetData() {
    this.lastHandleRect = this.slack = null;
  }

  // Clamp width and height within provided constraints
  runConstraints(width: number, height: number): [number, number] {
    const [min, max] = [this.props.minConstraints, this.props.maxConstraints];
    if (!min && !max) return [width, height];

    // If constraining to min and max, we need to also fit width and height to aspect ratio.
    if (this.props.lockAspectRatio) {
      const resizingHorizontally = height === this.props.height;
      if (resizingHorizontally) {
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
    let [slackW, slackH] = this.slack || [0, 0];
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

    // If the width or height changed, we must have introduced some slack. Record it for the next iteration.
    this.slack = [slackW + (oldW - width), slackH + (oldH - height)];

    return [width, height];
  }

  /**
   * Wrapper around drag events to provide more useful data.
   *
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
  resizeHandler(handlerName: 'onResize' | 'onResizeStart' | 'onResizeStop', axis: ResizeHandleAxis): Function {
    return (e: SyntheticEvent<>, {node, deltaX, deltaY}: DragCallbackData) => {
      // Reset data in case it was left over somehow (should not be possible)
      if (handlerName === 'onResizeStart') this.resetData();

      // Axis restrictions
      const canDragX = (this.props.axis === 'both' || this.props.axis === 'x') && axis !== 'n' && axis !== 's';
      const canDragY = (this.props.axis === 'both' || this.props.axis === 'y') && axis !== 'e' && axis !== 'w';
      // No dragging possible.
      if (!canDragX && !canDragY) return;

      // Decompose axis for later use
      const axisV = axis[0];
      const axisH = axis[axis.length - 1]; // intentionally not axis[1], so that this catches axis === 'w' for example

      // Track the element being dragged to account for changes in position.
      // If a handle's position is changed between callbacks, we need to factor this in to the next callback.
      // Failure to do so will cause the element to "skip" when resized upwards or leftwards.
      const handleRect = node.getBoundingClientRect();
      if (this.lastHandleRect != null) {
        // If the handle has repositioned on either axis since last render,
        // we need to increase our callback values by this much.
        // Only checking 'n', 'w' since resizing by 's', 'w' won't affect the overall position on page,
        if (axisH === 'w') {
          const deltaLeftSinceLast = handleRect.left - this.lastHandleRect.left;
          deltaX += deltaLeftSinceLast;
        }
        if (axisV === 'n') {
          const deltaTopSinceLast = handleRect.top - this.lastHandleRect.top;
          deltaY += deltaTopSinceLast;
        }
      }
      // Storage of last rect so we know how much it has really moved.
      this.lastHandleRect = handleRect;

      // Reverse delta if using top or left drag handles.
      if (axisH === 'w') deltaX = -deltaX;
      if (axisV === 'n') deltaY = -deltaY;

      // Update w/h by the deltas. Also factor in transformScale.
      let width = this.props.width + (canDragX ? deltaX / this.props.transformScale : 0);
      let height = this.props.height + (canDragY ? deltaY / this.props.transformScale : 0);

      // Run user-provided constraints.
      [width, height] = this.runConstraints(width, height);

      const dimensionsChanged = width !== this.props.width || height !== this.props.height;

      // Call user-supplied callback if present.
      const cb = typeof this.props[handlerName] === 'function' ? this.props[handlerName] : null;
      // Don't call 'onResize' if dimensions haven't changed.
      const shouldSkipCb = handlerName === 'onResize' && !dimensionsChanged;
      if (cb && !shouldSkipCb) {
        if (typeof e.persist === 'function') e.persist();
        cb(e, {node, size: {width, height}, handle: axis});
      }

      // Reset internal data
      if (handlerName === 'onResizeStop') this.resetData();
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
    // Pass along only props not meant for the `<Resizable>`.`
    // eslint-disable-next-line no-unused-vars
    const {children, className, draggableOpts, width, height, handle, handleSize,
            lockAspectRatio, axis, minConstraints, maxConstraints, onResize,
            onResizeStop, onResizeStart, resizeHandles, transformScale, ...p} = this.props;

    // What we're doing here is getting the child of this element, and cloning it with this element's props.
    // We are then defining its children as:
    // Its original children (resizable's child's children), and
    // One or more draggable handles.
    return cloneElement(children, {
      ...p,
      className: `${className ? `${className} ` : ''}react-resizable`,
      children: [
        ...children.props.children,
        ...resizeHandles.map((handleAxis) => (
          <DraggableCore
            {...draggableOpts}
            key={`resizableHandle-${handleAxis}`}
            onStop={this.resizeHandler('onResizeStop', handleAxis)}
            onStart={this.resizeHandler('onResizeStart', handleAxis)}
            onDrag={this.resizeHandler('onResize', handleAxis)}
          >
            {this.renderResizeHandle(handleAxis)}
          </DraggableCore>
        ))
      ]
    });
  }
}
