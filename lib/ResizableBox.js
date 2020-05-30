// @flow
import React from 'react';
import PropTypes from 'prop-types';
import Resizable from './Resizable';
import type {Props as ResizableProps, ResizeCallbackData} from './Resizable';
import type {Node as ReactNode} from 'react';

type State = {
  width: number, height: number,
  propsWidth: number, propsHeight: number
};

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
    propsWidth: this.props.width,
    propsHeight: this.props.height,
  };

  static getDerivedStateFromProps(props: ResizableProps, state: State) {
    // If parent changes height/width, set that in our state.
    if (state.propsWidth !== props.width || state.propsHeight !== props.height) {
      return {
        width: props.width,
        height: props.height,
        propsWidth: props.width,
        propsHeight: props.height,
      };
    }
    return null;
  }

  onResize = (e: SyntheticEvent<>, data: ResizeCallbackData) => {
    const {size} = data;
    if (this.props.onResize) {
      e.persist && e.persist();
      this.setState(size, () => this.props.onResize && this.props.onResize(e, data));
    } else {
      this.setState(size);
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
      width,
      height,
      resizeHandles,
      ...props
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
        <div style={{width: this.state.width + 'px', height: this.state.height + 'px'}} {...props} />
      </Resizable>
    );
  }
}
