// @flow
import {default as React, PropTypes} from 'react';
import Draggable from 'react-draggable';
import cloneElement from './cloneElement';

type Bounds = {
  top: number,
  right: number,
  bottom: number,
  left: number
};
type Position = {
  deltaX: number,
  deltaY: number
};
type State = {
  aspectRatio: number,
  bounds: Bounds,
  resizing: boolean,
  height: number,
  width: number,
};
type DragCallbackData = {
  node: HTMLElement,
  deltaX: number,
  deltaY: number,
  position: {left: number, top: number}
};

export default class Resizable extends React.Component {

  static propTypes = {
    //
    // Required Props
    //

    // Require that one and only one child be present.
    children: PropTypes.element.isRequired,

    // Initial w/h
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,

    //
    // Optional props
    //

    // If you change this, be sure to update your css
    handleSize: PropTypes.array,

    // If true, will only allow width/height to move in lockstep
    lockAspectRatio: PropTypes.bool,

    // Min/max size
    minConstraints: PropTypes.arrayOf(PropTypes.number),
    maxConstraints: PropTypes.arrayOf(PropTypes.number),

    // Callbacks
    onResizeStop: PropTypes.func,
    onResizeStart: PropTypes.func,
    onResize: PropTypes.func,

    // These will be passed wholesale to react-draggable's DraggableCore
    draggableOpts: PropTypes.object
  };

  static defaultProps =  {
    handleSize: [20, 20],
    lockAspectRatio: false,
    minConstraints: [20, 20],
    maxConstraints: [Infinity, Infinity]
  };

  state: State = {
    aspectRatio: this.props.width / this.props.height,
    bounds: this.constraintsToBounds(),
    resizing: false,
    height: this.props.height,
    width: this.props.width,
  };

  componentWillReceiveProps(nextProps: Object) {
    if (!this.state.resizing &&
        (nextProps.width !== this.props.width || nextProps.height !== this.props.height)) {
      this.setState({
        width: nextProps.width,
        height: nextProps.height
      });
    }
  }

  constraintsToBounds(): Bounds {
    const {minConstraints, maxConstraints, height, width} = this.props;
    return {
      left: minConstraints[0] - width,
      top: minConstraints[1] - height,
      right: maxConstraints[0] - width,
      bottom: maxConstraints[1] - height
    };
  }

  lockAspectRatio(width: number, height: number, aspectRatio: number): [number, number] {
    height = width / this.state.aspectRatio;
    width = height * this.state.aspectRatio;
    return [width, height];
  }

  /**
   * Wrapper around drag events to provide more useful data.
   *
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
  resizeHandler(handlerName: string): Function {
    return (e, {node, deltaX, deltaY}: DragCallbackData) => {
      let width = this.state.width + deltaX, height = this.state.height + deltaY;

      let widthChanged = width !== this.state.width, heightChanged = height !== this.state.height;
      if (!widthChanged && !heightChanged) return;

      if (this.props.lockAspectRatio) {
        [width, height] = this.lockAspectRatio(width, height, this.state.aspectRatio);
      }

      // Set the appropriate state for this handler.
      let newState = {};
      if (handlerName === 'onResizeStart') {
        newState.resizing = true;
      } else if (handlerName === 'onResizeStop') {
        newState.resizing = false;
      } else {
        newState.width = width;
        newState.height = height;
      }

      this.setState(newState, () => {
        this.props[handlerName] && this.props[handlerName](e, {node, size: {width, height}});
      });

    };
  }

  render(): ReactElement {
    let p = this.props;
    let className = p.className ?
      `${p.className} react-resizable`:
      'react-resizable';

    // What we're doing here is getting the child of this element, and cloning it with this element's props.
    // We are then defining its children as:
    // Its original children (resizable's child's children), and
    // A draggable handle.
    return cloneElement(p.children, {
      ...p,
      className,
      children: [
        p.children.props.children,
        <Draggable
          {...p.draggableOpts}
          ref="draggable"
          axis="none"
          onStop={this.resizeHandler('onResizeStop')}
          onStart={this.resizeHandler('onResizeStart')}
          onDrag={this.resizeHandler('onResize')}
          bounds={this.state.bounds}
          >
          <span className="react-resizable-handle" />
        </Draggable>
      ]
    });
  }
}
