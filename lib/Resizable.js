// @flow
import * as React from 'react';
import type {Node as ReactNode} from 'react';
import {DraggableCore} from 'react-draggable';
import {cloneElement} from './utils';
import {resizableProps} from "./propTypes";
import type {ResizeHandleAxis, DefaultProps, Props, ReactRef, DragCallbackData} from './propTypes';

// The base <Resizable> component.
// This component does not have state and relies on the parent to set its props based on callback data.
export default class Resizable extends React.Component<Props, void> {
  static propTypes = resizableProps;

  static defaultProps: DefaultProps =  {
    axis: 'both',
    handleSize: [20, 20],
    lockAspectRatio: false,
    minConstraints: [20, 20],
    maxConstraints: [Infinity, Infinity],
    resizeHandles: ['se'],
    transformScale: 1
  };

  handleRefs: {[key: ResizeHandleAxis]: ReactRef<HTMLElement>} = {};
  lastHandleRect: ?ClientRect = null;
  slack: ?[number, number] = null;
  // We add these two fields to remember the state at start of resizing
  dragStart = null;
  sizeStart = null;

  componentWillUnmount() {
    this.resetData();
  }

  resetData() {
    this.lastHandleRect = this.slack = null;
  }

  // Clamp width and height within provided constraints
  runConstraints(width: number, height: number): [number, number] {
    const {minConstraints, maxConstraints, lockAspectRatio} = this.props;
    // short circuit
    if (!minConstraints && !maxConstraints && !lockAspectRatio) return [width, height];

    // If constraining to min and max, we need to also fit width and height to aspect ratio.
    if (lockAspectRatio) {
      const ratio = this.props.width / this.props.height;
      const deltaW = width - this.props.width;
      const deltaH = height - this.props.height;

      // Find which coordinate was greater and should push the other toward it.
      // E.g.:
      // ratio = 1, deltaW = 10, deltaH = 5, deltaH should become 10.
      // ratio = 2, deltaW = 10, deltaH = 6, deltaW should become 12.
      if (Math.abs(deltaW) > Math.abs(deltaH * ratio)) {
        height = width / ratio;
      } else {
        width = height * ratio;
      }
    }

    const [oldW, oldH] = [width, height];

    // Add slack to the values used to calculate bound position. This will ensure that if
    // we start removing slack, the element won't react to it right away until it's been
    // completely removed.
    let [slackW, slackH] = this.slack || [0, 0];
    width += slackW;
    height += slackH;

    if (minConstraints) {
      width = Math.max(minConstraints[0], width);
      height = Math.max(minConstraints[1], height);
    }
    if (maxConstraints) {
      width = Math.min(maxConstraints[0], width);
      height = Math.min(maxConstraints[1], height);
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
    // Using `lastX` and `lastY` rather than `deltaX` and `deltaY` (see longer comment below)
    return (e: SyntheticEvent<>, {node, lastX, lastY}: DragCallbackData) => {
      // Reset data in case it was left over somehow (should not be possible)
      if (handlerName === 'onResizeStart') {
        this.resetData();
        // Remembering state at start of resizing
        this.dragStart = { x: lastX, y: lastY };
        this.sizeStart = { x: this.props.width, y: this.props.height };
      }

      // Axis restrictions
      const canDragX = (this.props.axis === 'both' || this.props.axis === 'x') && axis !== 'n' && axis !== 's';
      const canDragY = (this.props.axis === 'both' || this.props.axis === 'y') && axis !== 'e' && axis !== 'w';
      // No dragging possible.
      if (!canDragX && !canDragY) return;

      // In order to fix an issue where resizing does not correctly follow the mouse cursor, we use the `lastX` and
      // `lastY` properties of the mouse event rather than the `deltaX` and `deltaY` properties.
      //
      // This approach is more robust because `lastX` and `lastY` are absolute values and will remain true even if some
      // events get dropped, whereas calculating the resulting width with `deltaX` and `deltaY` in a cumulative way will
      // accumulate errors if some events are skipped.
      let width = this.sizeStart.x + (canDragX ? lastX - (this.dragStart.x ?? 0) : 0);
      let height = this.sizeStart.y + (canDragY ? lastY - (this.dragStart.y ?? 0) : 0);
      // Run user-provided constraints.
      [width, height] = this.runConstraints(width, height);

      const dimensionsChanged = width !== this.props.width || height !== this.props.height;

      // Call user-supplied callback if present.
      const cb = typeof this.props[handlerName] === 'function' ? this.props[handlerName] : null;
      // Don't call 'onResize' if dimensions haven't changed.
      const shouldSkipCb = handlerName === 'onResize' && !dimensionsChanged;
      if (cb && !shouldSkipCb) {
        e.persist?.();
        cb(e, {node, size: {width, height}, handle: axis});
      }

      // Reset internal data
      if (handlerName === 'onResizeStop') this.resetData();
    };
  }

  // Render a resize handle given an axis & DOM ref. Ref *must* be attached for
  // the underlying draggable library to work properly.
  renderResizeHandle(handleAxis: ResizeHandleAxis, ref: ReactRef<HTMLElement>): ReactNode {
    const {handle} = this.props;
    // No handle provided, make the default
    if (!handle) {
      return <span className={`react-resizable-handle react-resizable-handle-${handleAxis}`} ref={ref} />;
    }
    // Handle is a function, such as:
    // `handle={(handleAxis) => <span className={...} />}`
    if (typeof handle === 'function') {
      return handle(handleAxis, ref);
    }
    // Handle is a React component (composite or DOM).
    const isDOMElement = typeof handle.type === 'string';
    const props = {
      ref,
      // Add `handleAxis` prop iff this is not a DOM element,
      // otherwise we'll get an unknown property warning
      ...(isDOMElement ? {} : {handleAxis})
    };
    return React.cloneElement(handle, props);

  }

  render(): ReactNode {
    // Pass along only props not meant for the `<Resizable>`.`
    // eslint-disable-next-line no-unused-vars
    const {children, className, draggableOpts, width, height, handle, handleSize,
            lockAspectRatio, axis, minConstraints, maxConstraints, onResize,
            onResizeStop, onResizeStart, resizeHandles, transformScale, ...p} = this.props;

    // What we're doing here is getting the child of this element, and cloning it with this element's props.
    // We are then defining its children as:
    // 1. Its original children (resizable's child's children), and
    // 2. One or more draggable handles.
    return cloneElement(children, {
      ...p,
      className: `${className ? `${className} ` : ''}react-resizable`,
      children: [
        ...children.props.children,
        ...resizeHandles.map((handleAxis) => {
          // Create a ref to the handle so that `<DraggableCore>` doesn't have to use ReactDOM.findDOMNode().
          const ref = (this.handleRefs[handleAxis]) ?? (this.handleRefs[handleAxis] = React.createRef());
          return (
            <DraggableCore
              {...draggableOpts}
              nodeRef={ref}
              key={`resizableHandle-${handleAxis}`}
              onStop={this.resizeHandler('onResizeStop', handleAxis)}
              onStart={this.resizeHandler('onResizeStart', handleAxis)}
              onDrag={this.resizeHandler('onResize', handleAxis)}
            >
              {this.renderResizeHandle(handleAxis, ref)}
            </DraggableCore>
          );
        })
      ]
    });
  }
}
