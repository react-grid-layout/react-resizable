// @flow
import React from 'react';
import PropTypes from 'prop-types';
import Resizable from './Resizable';
import type {Props as ResizableProps, ResizeCallbackData} from './Resizable';
import type {Node as ReactNode} from 'react';

type State = {
  width: number, height: number,
};

// An example use of Resizable.
export default class ResizableBox extends React.Component<ResizableProps, State> {
  static propTypes = {
    children: PropTypes.node.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    handle: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
    ]),
    handleSize: PropTypes.arrayOf(PropTypes.number),
    onResize: PropTypes.func,
    onResizeStart: PropTypes.func,
    onResizeStop: PropTypes.func,
    draggableOpts: PropTypes.shape({
      allowAnyClick: PropTypes.bool,
      cancel: PropTypes.string,
      children: PropTypes.node,
      disabled: PropTypes.bool,
      enableUserSelectHack: PropTypes.bool,
      offsetParent: PropTypes.node,
      grid: PropTypes.arrayOf(PropTypes.number),
      handle: PropTypes.string,
      nodeRef: PropTypes.object,
      onStart: PropTypes.func,
      onDrag: PropTypes.func,
      onStop: PropTypes.func,
      onMouseDown: PropTypes.func,
      scale: PropTypes.number,
    }),
    minConstraints: PropTypes.arrayOf(PropTypes.number),
    maxConstraints: PropTypes.arrayOf(PropTypes.number),
    lockAspectRatio: PropTypes.bool,
    axis: PropTypes.oneOf(['both', 'x', 'y', 'none']),
    resizeHandles: PropTypes.arrayOf(PropTypes.oneOf(['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'])),
  };

  static defaultProps = {
    handleSize: [20, 20],
    lockAspectRatio: false,
    axis: 'both',
    minConstraints: [20, 20],
    maxConstraints: [Infinity, Infinity],
    resizeHandles: ['se'],
  };

  state: State = {
    width: this.props.width,
    height: this.props.height,
  };

  static getDerivedStateFromProps(props: ResizableProps, state: State) {
    // If parent changes height/width, set that in our state.
    if (state.width !== props.width || state.width !== props.height) {
      return {
        width: props.width,
        height: props.height,
      };
    }
    return null;
  }

  onResize = (e: SyntheticEvent<>, data: ResizeCallbackData) => {
    if (this.props.onResize) {
      e.persist && e.persist();
      this.props.onResize(e, data);
    }
  };

  render(): ReactNode {
    // Basic wrapper around a Resizable instance.
    // If you use Resizable directly, you are responsible for updating the child component
    // with a new width and height.
    const {
      handle,
      handleSize,
      onResize,
      onResizeStart,
      onResizeStop,
      draggableOpts,
      minConstraints,
      maxConstraints,
      lockAspectRatio,
      axis,
      resizeHandles,
      children
    } = this.props;

    return (
      <Resizable
        handle={handle}
        handleSize={handleSize}
        width={this.state.width}
        height={this.state.height}
        onResizeStart={onResizeStart}
        onResize={this.onResize}
        onResizeStop={onResizeStop}
        draggableOpts={draggableOpts}
        minConstraints={minConstraints}
        maxConstraints={maxConstraints}
        lockAspectRatio={lockAspectRatio}
        axis={axis}
        resizeHandles={resizeHandles}
      >
        <div style={{width: this.state.width, height: this.state.height}}>
          {children}
        </div>
      </Resizable>
    );
  }
}
