import {default as React, PropTypes} from 'react';
import Resizable from './Resizable';

type Size = {width: number, height: number};
type ResizeData = {element: Element, size: Size};

// An example use of Resizable.
export default class ResizableBox extends React.Component {
  static propTypes = {
    lockAspectRatio: PropTypes.bool,
    minConstraints: PropTypes.arrayOf(PropTypes.number),
    maxConstraints: PropTypes.arrayOf(PropTypes.number),
    height: PropTypes.number,
    width: PropTypes.number
  };

  static defaultProps = {
    lockAspectRatio: false,
    handleSize: [20,20]
  };

  state = {
    width: this.props.width,
    height: this.props.height,
    aspectRatio: this.props.width / this.props.height
  };

  // TODO data is ResizeData type, but that doesn't work in babel-typecheck pre-babel6
  onResize = (event: Event, data: Object) => {
    let {element, size} = data;
    let {width, height} = size;
    let widthChanged = width !== this.state.width, heightChanged = height !== this.state.height;
    if (!widthChanged && !heightChanged) return;

    [width, height] = this.runConstraints(width, height);

    this.setState({width, height}, () => {
      if (this.props.onResize) {
        this.props.onResize(event, {element, size: {width, height}});
      }
    });
  }

  // If you do this, be careful of constraints
  runConstraints(width: number, height: number) {
    let [min, max] = [this.props.minConstraints, this.props.maxConstraints];

    if (this.props.lockAspectRatio) {
      height = width / this.state.aspectRatio;
      width = height * this.state.aspectRatio;
    }

    if (min) {
      width = Math.max(min[0], width);
      height = Math.max(min[1], height);
    }
    if (max) {
      width = Math.min(max[0], width);
      height = Math.min(max[1], height);
    }
    return [width, height];
  };

  render() {
    // Basic wrapper around a Resizable instance.
    // If you use Resizable directly, you are responsible for updating the component
    // with a new width and height.
    let {handleSize, minConstraints, maxConstraints, ...props} = this.props;
    return (
      <Resizable
        minConstraints={minConstraints}
        maxConstraints={maxConstraints}
        handleSize={handleSize}
        width={this.state.width}
        height={this.state.height}
        onResizeStart={this.props.onResizeStart}
        onResize={this.onResize}
        onResizeStop={this.props.onResizeStop}
        draggableOpts={this.props.draggableOpts}
        >
        <div style={{width: this.state.width + 'px', height: this.state.height + 'px'}} {...props}>
          {this.props.children}
        </div>
      </Resizable>
    );
  }
}
