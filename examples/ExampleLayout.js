import React from 'react';
import Resizable from '../lib/Resizable';
import ResizableBox from '../lib/ResizableBox';
import 'style-loader!css-loader!../css/styles.css';
import 'style-loader!css-loader!./example.css';

export default class ExampleLayout extends React.Component<{}, {width: number, height: number}> {
  state = {
    width: 200,
    height: 200,
    absoluteWidth: 200,
    absoluteHeight: 200,
    absoluteLeft: 0,
    absoluteTop: 0,
  };

  onResetClick = () => {
    this.setState({ width: 200, height: 200, absoluteWidth: 200, absoluteHeight: 200 });
  };

  // On top layout
  onResize = (event, {element, size, handle}) => {
    this.setState({width: size.width, height: size.height});
  };

  // On bottom layout. Used to resize the center element around its flex parent.
  onResizeAbsolute = (event, {element, size, handle}) => {
    this.setState((state) => {
      let newLeft = state.absoluteLeft;
      let newTop = state.absoluteTop;
      const deltaHeight = size.height - state.absoluteHeight;
      const deltaWidth = size.width - state.absoluteWidth;
      if (handle[0] === 'n') {
        newTop -= deltaHeight;
      } else if (handle[0] === 's') {
        newTop += deltaHeight;
      }
      if (handle[handle.length - 1] === 'w') {
        newLeft -= deltaWidth;
      } else if (handle[handle.length - 1] === 'e') {
        newLeft += deltaWidth;
      }

      return {
        absoluteWidth: size.width,
        absoluteHeight: size.height,
        absoluteLeft: newLeft,
        absoluteTop: newTop,
      };
    });
  };

  render() {
    return (
      <div>

        <h3>Statically Positioned Layout</h3>
        <div className="layoutRoot">
          <Resizable className="box" height={this.state.height} width={this.state.width} onResize={this.onResize} resizeHandles={['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's']}>
            <div className="box" style={{width: this.state.width + 'px', height: this.state.height + 'px'}}>
              <span className="text">{"Raw use of <Resizable> element. 200x200, all Resize Handles."}</span>
              <button onClick={this.onResetClick} style={{'marginTop': '10px'}}>Reset this element's width/height</button>
            </div>
          </Resizable>
          <ResizableBox className="box" width={200} height={200}>
            <span className="text">{"<ResizableBox>"}</span>
          </ResizableBox>
          <ResizableBox
            className="custom-box box"
            width={200}
            height={200}
            handle={<span className="custom-handle custom-handle-se" />}
            handleSize={[8, 8]}>
            <span className="text">{"<ResizableBox> with custom overflow style & handle in SE corner."}</span>
          </ResizableBox>
          <ResizableBox
            className="custom-box box"
            width={200}
            height={200}
            handle={(h) => <span className={`custom-handle custom-handle-${h}`} />}
            handleSize={[8, 8]}
            resizeHandles={['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's']}>
            <span className="text">{"<ResizableBox> with custom handles in all locations."}</span>
          </ResizableBox>
          <ResizableBox className="box" width={200} height={200} draggableOpts={{grid: [25, 25]}}>
            <span className="text">Resizable box that snaps to even intervals of 25px.</span>
          </ResizableBox>
          <ResizableBox className="box" width={200} height={200} minConstraints={[150, 150]} maxConstraints={[500, 300]}>
            <span className="text">Resizable box, starting at 200x200. Min size is 150x150, max is 500x300.</span>
          </ResizableBox>
          <ResizableBox className="box hover-handles" width={200} height={200} minConstraints={[150, 150]} maxConstraints={[500, 300]}>
            <span className="text">Resizable box with a handle that only appears on hover.</span>
          </ResizableBox>
          <ResizableBox className="box" width={200} height={200} lockAspectRatio={true}>
            <span className="text">Resizable square with a locked aspect ratio.</span>
          </ResizableBox>
          <ResizableBox className="box" width={200} height={120} lockAspectRatio={true}>
            <span className="text">Resizable rectangle with a locked aspect ratio.</span>
          </ResizableBox>
          <ResizableBox className="box" width={200} height={200} axis="x">
            <span className="text">Only resizable by "x" axis.</span>
          </ResizableBox>
          <ResizableBox className="box" width={200} height={200} axis="y">
            <span className="text">Only resizable by "y" axis.</span>
          </ResizableBox>
          <ResizableBox className="box" width={200} height={200} axis="both">
            <span className="text">Resizable ("both" axis).</span>
          </ResizableBox>
          <ResizableBox className="box" width={200} height={200} axis="none">
            <span className="text">Not resizable ("none" axis).</span>
          </ResizableBox>
        </div>

        <h3>Absolutely Positioned layout</h3>
        <div className="layoutRoot absoluteLayout">
          <ResizableBox className="box absolutely-positioned top-aligned left-aligned" height={200} width={200} resizeHandles={['se', 'e', 's']}>
            <span className="text">Top-left Aligned</span>
          </ResizableBox>
          <ResizableBox className="box absolutely-positioned bottom-aligned left-aligned" height={200} width={200} resizeHandles={['ne', 'e', 'n']}>
            <span className="text">Bottom-left Aligned</span>
          </ResizableBox>
          {/* See implementation of `onResizeAbsolute` for how this can be moved around its container */}
          <Resizable
            className="box absolutely-positioned"
            height={this.state.absoluteHeight}
            width={this.state.absoluteWidth}
            onResize={this.onResizeAbsolute}
            resizeHandles={['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's']}
          >
            <div
              style={{
                width: this.state.absoluteWidth,
                height: this.state.absoluteHeight,
                margin: `${this.state.absoluteTop} 0 0 ${this.state.absoluteLeft}`,
              }}
            >
              <span className="text">{"Raw use of <Resizable> element with controlled position. Resize and reposition in all directions."}</span>
            </div>
          </Resizable>
          <ResizableBox className="box absolutely-positioned top-aligned right-aligned" height={200} width={200} resizeHandles={['sw', 'w', 's']}>
            <span className="text">Top-right Aligned</span>
          </ResizableBox>
          <ResizableBox className="box absolutely-positioned bottom-aligned right-aligned" height={200} width={200} resizeHandles={['nw', 'w', 'n']}>
            <span className="text">Bottom-right Aligned</span>
          </ResizableBox>
        </div>

      </div>
    );
  }
}
