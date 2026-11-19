import * as React from 'react';
import {DraggableCore} from 'react-draggable';
import {cloneElement} from './utils';
import {resizableProps} from './propTypes';
import type {ResizeHandleAxis, DefaultProps, Props, DragCallbackData} from './propTypes';

// The base <Resizable> component.
// This component does not have state and relies on the parent to set its props based on callback data.
export default class Resizable extends React.Component<Props, {}> {
  static propTypes = resizableProps;

  static defaultProps: DefaultProps = {
    axis: 'both',
    handleSize: [20, 20],
    lockAspectRatio: false,
    minConstraints: [20, 20],
    maxConstraints: [Infinity, Infinity],
    resizeHandles: ['se'],
    transformScale: 1,
  };

  handleRefs: {[key in ResizeHandleAxis]?: React.RefObject<HTMLElement>} = {};
  lastHandleRect: DOMRect | null = null;
  slack: [number, number] | null = null;
  lastSize: {width: number; height: number} | null = null;
  // Absolute-coordinate resize tracking: eliminates all delta accumulation
  // issues caused by stale props between React renders.
  startSize: {width: number; height: number} | null = null;
  startMouseX: number = 0;
  startMouseY: number = 0;

  componentWillUnmount() {
    this.resetData();
  }

  resetData() {
    this.lastHandleRect = this.slack = this.lastSize = null;
    this.startSize = null;
  }

  // Clamp width and height within provided constraints
  runConstraints(width: number, height: number): [number, number] {
    const {minConstraints, maxConstraints, lockAspectRatio} = this.props;
    // short circuit
    if (!minConstraints && !maxConstraints && !lockAspectRatio) return [width, height];

    // If constraining to min and max, we need to also fit width and height to aspect ratio.
    if (lockAspectRatio) {
      const ratio = this.props.width / this.props.height;

      // Project (width, height) onto the line w = ratio * h.
      // Distributes tracking error across both axes instead of forcing one to overshoot.
      // t = (w * ratio + h) / (ratio^2 + 1),  new_w = t * ratio,  new_h = t
      height = (width * ratio + height) / (ratio * ratio + 1);
      width = height * ratio;
    }

    const [oldW, oldH] = [width, height];

    // Add slack to the values used to calculate bound position. This will ensure that if
    // we start removing slack, the element won't react to it right away until it's been
    // completely removed.
    const [slackW, slackH] = this.slack || [0, 0];
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
  resizeHandler(
    handlerName: 'onResize' | 'onResizeStart' | 'onResizeStop',
    axis: ResizeHandleAxis,
  ): (e: React.SyntheticEvent, data: DragCallbackData) => void {
    return (e: React.SyntheticEvent, {node, deltaX, deltaY, x, y}: DragCallbackData) => {
      // Reset data in case it was left over somehow (should not be possible)
      if (handlerName === 'onResizeStart') {
        this.resetData();
        // Record initial size and mouse position for absolute-coordinate resize.
        // This eliminates ALL delta accumulation issues caused by stale props
        // when React can't re-render between consecutive mousemove events.
        // See: https://github.com/react-grid-layout/react-resizable/issues/237
        this.startSize = {width: this.props.width, height: this.props.height};
        this.startMouseX = x;
        this.startMouseY = y;
      }

      // Axis restrictions
      const canDragX = (this.props.axis === 'both' || this.props.axis === 'x') && axis !== 'n' && axis !== 's';
      const canDragY = (this.props.axis === 'both' || this.props.axis === 'y') && axis !== 'e' && axis !== 'w';
      // No dragging possible.
      if (!canDragX && !canDragY) return;

      // Decompose axis for later use
      const axisV = axis[0];
      const axisH = axis[axis.length - 1]; // intentionally not axis[1], so that this catches axis === 'w' for example

      // Track the element being dragged to account for changes in position.
      // NOTE: With the absolute-coordinate approach (using startSize + total displacement),
      // the lastHandleRect correction is no longer needed for any axis, because DraggableCore's
      // x/y values are page-relative and already account for element repositioning.
      // Kept only as a no-op for compatibility; can be removed in a future cleanup.

      // Reverse delta if using top or left drag handles.
      if (axisH === 'w') deltaX = -deltaX;
      if (axisV === 'n') deltaY = -deltaY;

      // Compute size using absolute displacement from the start of the resize
      // operation. This avoids all issues with incremental delta accumulation
      // and stale props between renders.
      let width: number, height: number;
      if (this.startSize) {
        // Total mouse displacement since resize started (accounting for axis direction)
        const totalDx = (axisH === 'w') ? -(x - this.startMouseX) : (x - this.startMouseX);
        const totalDy = (axisV === 'n') ? -(y - this.startMouseY) : (y - this.startMouseY);
        width = this.startSize.width + (canDragX ? totalDx / this.props.transformScale : 0);
        height = this.startSize.height + (canDragY ? totalDy / this.props.transformScale : 0);
      } else {
        // Fallback (should not happen — startSize is always set on onResizeStart)
        const baseWidth = this.lastSize?.width ?? this.props.width;
        const baseHeight = this.lastSize?.height ?? this.props.height;
        width = baseWidth + (canDragX ? deltaX / this.props.transformScale : 0);
        height = baseHeight + (canDragY ? deltaY / this.props.transformScale : 0);
      }

      // Run user-provided constraints.
      [width, height] = this.runConstraints(width, height);

      // For onResizeStop, use the last size from onResize rather than recalculating.
      // This avoids issues where props.width/height are stale due to React's batched updates.
      if (handlerName === 'onResizeStop' && this.lastSize) {
        ({width, height} = this.lastSize);
      }

      // Compare against the previous callback size to suppress no-op onResize events
      // (e.g., when dragging against min/max constraints and the clamped size doesn't change).
      const refWidth = this.lastSize?.width ?? this.props.width;
      const refHeight = this.lastSize?.height ?? this.props.height;
      const dimensionsChanged = width !== refWidth || height !== refHeight;

      // Store the size for use in onResizeStop. We do this after the onResizeStop check
      // above so we don't overwrite the stored value with a potentially stale calculation.
      if (handlerName !== 'onResizeStop') {
        this.lastSize = {width, height};
      }

      // Call user-supplied callback if present.
      const cb = typeof this.props[handlerName] === 'function' ? this.props[handlerName] : null;
      // Don't call 'onResize' if dimensions haven't changed.
      const shouldSkipCb = handlerName === 'onResize' && !dimensionsChanged;
      if (cb && !shouldSkipCb) {
        (e as any).persist?.();
        cb(e, {node, size: {width, height}, handle: axis});
      }

      // Reset internal data
      if (handlerName === 'onResizeStop') this.resetData();
    };
  }

  // Render a resize handle given an axis & DOM ref. Ref *must* be attached for
  // the underlying draggable library to work properly.
  renderResizeHandle(
    handleAxis: ResizeHandleAxis,
    ref: React.RefObject<HTMLElement>,
  ): React.ReactNode {
    const {handle} = this.props;
    // No handle provided, make the default
    if (!handle) {
      return <span className={`react-resizable-handle react-resizable-handle-${handleAxis}`} ref={ref as React.RefObject<HTMLSpanElement>} />;
    }
    // Handle is a function, such as:
    // `handle={(handleAxis) => <span className={...} />}`
    if (typeof handle === 'function') {
      return handle(handleAxis, ref);
    }
    // Handle is a React component (composite or DOM).
    const isDOMElement = typeof handle.type === 'string';
    const props: Record<string, any> = {
      ref,
      // Add `handleAxis` prop iff this is not a DOM element,
      // otherwise we'll get an unknown property warning
      ...(isDOMElement ? {} : {handleAxis}),
    };
    return React.cloneElement(handle, props);
  }

  render(): React.ReactNode {
    // Pass along only props not meant for the `<Resizable>`.`
    const {
      children, className, draggableOpts, width, height, handle, handleSize,
      lockAspectRatio, axis, minConstraints, maxConstraints, onResize,
      onResizeStop, onResizeStart, resizeHandles, transformScale, ...p
    } = this.props;

    // What we're doing here is getting the child of this element, and cloning it with this element's props.
    // We are then defining its children as:
    // 1. Its original children (resizable's child's children), and
    // 2. One or more draggable handles.
    return cloneElement(children, {
      ...p,
      className: `${className ? `${className} ` : ''}react-resizable`,
      children: [
        ...React.Children.toArray((children.props as any).children),
        ...resizeHandles.map((handleAxis) => {
          // Create a ref to the handle so that `<DraggableCore>` doesn't have to use ReactDOM.findDOMNode().
          const ref =
            this.handleRefs[handleAxis] ??
            (this.handleRefs[handleAxis] = React.createRef<HTMLElement>());
          return (
            <DraggableCore
              {...(draggableOpts as any)}
              nodeRef={ref as React.RefObject<HTMLElement>}
              key={`resizableHandle-${handleAxis}`}
              onStop={this.resizeHandler('onResizeStop', handleAxis) as any}
              onStart={this.resizeHandler('onResizeStart', handleAxis) as any}
              onDrag={this.resizeHandler('onResize', handleAxis) as any}
            >
              {this.renderResizeHandle(handleAxis, ref)}
            </DraggableCore>
          );
        }),
      ],
    });
  }
}
