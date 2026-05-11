import * as React from 'react';
import PropTypes from 'prop-types';

import Resizable from './Resizable';
import {resizableProps} from './propTypes';
import type {Props as ResizableProps, ResizeCallbackData, ResizableBoxState} from './propTypes';

// <ResizableBox> does not have defaultProps, so we make all of <Resizable>'s defaults optional here
// and add an optional `style` property.
type ResizableBoxProps = Omit<ResizableProps, 'children'> & {
  style?: React.CSSProperties;
  children?: React.ReactElement<any>;
  className?: string | null;
};

export default class ResizableBox extends React.Component<ResizableBoxProps, ResizableBoxState> {

  // PropTypes are identical to <Resizable>, except that children are not strictly required to be present.
  static propTypes = {
    ...resizableProps,
    children: PropTypes.element,
  };

  state: ResizableBoxState = {
    width: this.props.width,
    height: this.props.height,
    propsWidth: this.props.width,
    propsHeight: this.props.height,
  };

  static getDerivedStateFromProps(
    props: ResizableBoxProps,
    state: ResizableBoxState,
  ): ResizableBoxState | null {
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

  onResize = (e: React.SyntheticEvent, data: ResizeCallbackData): void => {
    const {size} = data;
    if (this.props.onResize) {
      (e as any).persist?.();
      this.setState(size, () => this.props.onResize && this.props.onResize(e, data));
    } else {
      this.setState(size);
    }
  };

  render(): React.ReactNode {
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
      style,
      transformScale,
      ...props
    } = this.props;

    return (
      <Resizable
        axis={axis as any}
        draggableOpts={draggableOpts}
        handle={handle}
        handleSize={handleSize as any}
        height={this.state.height}
        lockAspectRatio={lockAspectRatio as any}
        maxConstraints={maxConstraints as any}
        minConstraints={minConstraints as any}
        onResizeStart={onResizeStart}
        onResize={this.onResize}
        onResizeStop={onResizeStop}
        resizeHandles={resizeHandles as any}
        transformScale={transformScale as any}
        width={this.state.width}
      >
        <div
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
          style={{...style, width: this.state.width + 'px', height: this.state.height + 'px'}}
        />
      </Resizable>
    );
  }
}
