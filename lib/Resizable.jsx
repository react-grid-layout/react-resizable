import {default as React, PropTypes} from 'react';
import {DraggableCore} from 'react-draggable';
import assign from 'object-assign';
import cloneElement from './cloneElement';

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
    handleSize: [20, 20]
  };

  state = {
    bounds: this.constraintsToBounds(),
    width: this.props.width,
    height: this.props.height
  };

  componentWillReceiveProps(props: Object) {
    if (!this.state.resizing) {
      this.setState({
        width: props.width,
        height: props.height,
        bounds: this.constraintsToBounds()
      });
    }
  }

  constraintsToBounds() {
    let p = this.props;
    let mins = p.minConstraints || p.handleSize;
    let maxes = p.maxConstraints || [Infinity, Infinity];
    return {
      left: mins[0] - p.width,
      top: mins[1] - p.height,
      right: maxes[0] - p.width,
      bottom: maxes[1] - p.height
    };
  }

  /**
   * Wrapper around drag events to provide more useful data.
   *
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
  resizeHandler(handlerName: string) {
    return (e, {node, position}) => {
      let width = this.state.width + position.deltaX, height = this.state.height + position.deltaY;
      this.props[handlerName] && this.props[handlerName](e, {node, size: {width, height}});

      if (handlerName === 'onResizeStart') {
        this.setState({resizing: true});
      } else if (handlerName === 'onResizeStop') {
        this.setState({resizing: false});
      } else {
        this.setState({width, height});
      }
    };
  }

  render() {
    let p = this.props;
    let className = p.className ?
      `${p.className} react-resizable`:
      'react-resizable'

    // What we're doing here is getting the child of this element, and cloning it with this element's props.
    // We are then defining its children as:
    // Its original children (resizable's child's children), and
    // A draggable handle.
    return cloneElement(p.children, assign({}, p, {
      className,
      children: [
        p.children.props.children,
        <DraggableCore
          {...p.draggableOpts}
          ref="draggable"
          onStop={this.resizeHandler('onResizeStop')}
          onStart={this.resizeHandler('onResizeStart')}
          onDrag={this.resizeHandler('onResize')}
          bounds={this.state.bounds}
          >
          <span className="react-resizable-handle" />
        </DraggableCore>
      ]
    }));
  }
}
