import React from 'react';
import {render, screen} from '@testing-library/react';
import Resizable from '../lib/Resizable';

// Helper to simulate drag events on handle elements
// This simulates DraggableCore's onDrag callback by calling the component's resizeHandler
function createMockDragEvent() {
  return {};
}

describe('render Resizable', () => {
  const props = {
    axis: 'both',
    className: 'test-classname',
    draggableOpts: {},
    handleSize: [20, 20],
    height: 50,
    lockAspectRatio: false,
    maxConstraints: [Infinity, Infinity],
    minConstraints: [20, 20],
    onResize: jest.fn(),
    onResizeStart: jest.fn(),
    onResizeStop: jest.fn(),
    resizeHandles: ['se', 'e'],
    transformScale: 1,
    width: 50,
  };
  const userChildren = <span className={'children'} />;
  const resizableBoxChildren = <div style={{width: '50px', height: '50px'}}>{userChildren}</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('snapshot default props', () => {
    const {container} = render(<Resizable {...props}>{resizableBoxChildren}</Resizable>);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('with correct props', () => {
    const {container} = render(<Resizable {...props}>{resizableBoxChildren}</Resizable>);

    // Check test-classname exists and contains children
    expect(container.querySelector('.test-classname')).toBeInTheDocument();
    expect(container.querySelector('.test-classname .children')).toBeInTheDocument();

    // Check resize handles are rendered (DraggableCore wraps them, we verify by finding the handles)
    const seHandle = container.querySelector('.react-resizable-handle-se');
    const eHandle = container.querySelector('.react-resizable-handle-e');
    expect(seHandle).toBeInTheDocument();
    expect(eHandle).toBeInTheDocument();

    // Verify there are exactly 2 resize handles (corresponding to 2 DraggableCores)
    const allHandles = container.querySelectorAll('.react-resizable-handle');
    expect(allHandles).toHaveLength(2);
  });

  describe('Handles', () => {
    test('with handle function', () => {
      const handleFn = (axis, ref) => {
        expect(axis).toMatch(/(se|e)/);
        expect(ref).toMatchObject({current: null}); // ReactRef
        return <span className={`custom-handle-${axis}`} ref={ref} />;
      };
      const {container} = render(<Resizable {...props} handle={handleFn}>{resizableBoxChildren}</Resizable>);

      expect(container.querySelector('.test-classname .children')).toBeInTheDocument();

      // Custom handles should be rendered
      const cursorSe = container.querySelector('.custom-handle-se');
      const cursorE = container.querySelector('.custom-handle-e');
      expect(cursorSe).toBeInTheDocument();
      expect(cursorE).toBeInTheDocument();

      // Verify there are exactly 2 custom handles
      expect(container.querySelectorAll('[class^="custom-handle-"]')).toHaveLength(2);
    });

    test('with handle component', () => {
      const ResizeHandle = React.forwardRef((props, ref) => {
        // $FlowIgnore doesn't know this is cloned and has handleAxis
        const {handleAxis, ...restProps} = props;
        return (
          <div
            ref={ref}
            className={`react-resizable-handle element-handle-${handleAxis}`}
            {...restProps}
          />
        );
      });
      const {container} = render(<Resizable {...props} handle={<ResizeHandle />}>{resizableBoxChildren}</Resizable>);

      expect(container.querySelector('.test-classname .children')).toBeInTheDocument();

      // Element handles should be rendered
      const cursorSe = container.querySelector('.element-handle-se');
      const cursorE = container.querySelector('.element-handle-e');
      expect(cursorSe).toBeInTheDocument();
      expect(cursorE).toBeInTheDocument();

      // Verify there are exactly 2 custom handles
      expect(container.querySelectorAll('[class*="element-handle-"]')).toHaveLength(2);
    });

    describe('and pass handle props', () => {
      test('as component', () => {
        const customProps = {
          ...props,
          resizeHandles: ['se'],
          handle: <span className={'custom-component'} />
        };
        const {container} = render(<Resizable {...customProps}>{resizableBoxChildren}</Resizable>);
        expect(container.querySelector('.react-resizable-handle-se')).not.toBeInTheDocument();
        expect(container.querySelector('.custom-component')).toBeInTheDocument();
      });

      test('as function', () => {
        const customProps = {
          ...props,
          resizeHandles: ['se'],
          handle: (h) => <span className={`custom-component-${h}`} />
        };
        const {container} = render(<Resizable {...customProps}>{resizableBoxChildren}</Resizable>);
        expect(container.querySelector('.custom-component-se')).toBeInTheDocument();
      });
    });
  });

  describe('<Resizable> props filtering', () => {
    const allProps = {
      ...props,
      draggableOpts: {},
      handle: <div />,
    };

    // Ensure everything in propTypes is represented here. Otherwise the next two tests are not valid
    test('all intended props are in our allProps object', () => {
      expect(['children', ...Object.keys(allProps)].sort()).toEqual(Object.keys(Resizable.propTypes).sort());
    });

    test('none of these props leak down to the child', () => {
      const {container} = render(<Resizable {...allProps}><div className="foo">{[]}</div></Resizable>);
      const fooElement = container.querySelector('.foo');

      // Get the attributes that are actually on the DOM element
      // In RTL, we can't access React props directly, but we can check that
      // Resizable's props don't appear as DOM attributes
      const attributes = Array.from(fooElement.attributes).map(attr => attr.name);

      // The child should only have class and potentially children rendered inside
      // class becomes className in React but 'class' in DOM
      expect(attributes.filter(attr => attr !== 'class')).toEqual([]);

      // Verify the child has the correct classes
      expect(fooElement).toHaveClass('foo');
      expect(fooElement).toHaveClass(allProps.className);
      expect(fooElement).toHaveClass('react-resizable');
    });

    test('className is constructed properly', () => {
      const {container} = render(<Resizable {...allProps}><div className="foo">{[]}</div></Resizable>);
      const fooElement = container.querySelector('.foo');
      expect(fooElement.className).toEqual(`foo ${allProps.className} react-resizable`);
    });
  });

  describe('onResize callback with modified position', () => {
    const customProps = {
      ...props,
      resizeHandles: ['nw', 'sw', 'ne', 'se', 'n', 's', 'w', 'e'],
    };
    const mockClientRect = {
      left: 0,
      top: 0,
    };
    const node = document.createElement('div');
    // $FlowIgnore need to override to have control over dummy dom element
    node.getBoundingClientRect = () => ({ ...mockClientRect });
    const mockEvent = {};

    // Helper function to get component instance and call resizeHandler
    // Since RTL doesn't expose component instances, we need to test through the actual component
    // We'll use a ref to access the Resizable instance
    function renderWithRef(renderProps) {
      const ref = React.createRef();
      const Wrapper = () => {
        const resizableRef = React.useRef(null);
        // Store ref for external access
        React.useEffect(() => {
          ref.current = resizableRef.current;
        });
        return (
          <Resizable {...renderProps} ref={resizableRef}>
            {resizableBoxChildren}
          </Resizable>
        );
      };
      render(<Wrapper />);
      return ref;
    }

    // For these tests, we need to access the component's internal methods
    // Since Resizable is a class component, we can use a ref
    let resizableRef;

    beforeEach(() => {
      jest.clearAllMocks();
      mockClientRect.left = 0;
      mockClientRect.top = 0;
      resizableRef = React.createRef();
    });

    test('Gradual resizing without movement between does not modify callback', () => {
      render(
        <Resizable {...customProps} ref={resizableRef}>
          {resizableBoxChildren}
        </Resizable>
      );

      expect(props.onResize).not.toHaveBeenCalled();

      // Simulate drag on 'se' handle
      const resizeHandler = resizableRef.current.resizeHandler('onResize', 'se');
      resizeHandler(mockEvent, { node, deltaX: 5, deltaY: 10 });

      expect(props.onResize).toHaveBeenLastCalledWith(
        mockEvent,
        expect.objectContaining({
          size: {
            height: 60,
            width: 55,
          },
        })
      );
    });

    test('Movement between callbacks modifies response values', () => {
      render(
        <Resizable {...customProps} ref={resizableRef}>
          {resizableBoxChildren}
        </Resizable>
      );

      expect(props.onResize).not.toHaveBeenCalled();

      // Test nw handle with movement
      const nwHandler = resizableRef.current.resizeHandler('onResize', 'nw');

      // First call initializes lastHandleRect (simulating first drag event)
      nwHandler(mockEvent, { node, deltaX: 0, deltaY: 0 });

      mockClientRect.top = -10; // Object moves between callbacks
      nwHandler(mockEvent, { node, deltaX: 5, deltaY: 10 });
      expect(props.onResize).toHaveBeenLastCalledWith(
        mockEvent,
        expect.objectContaining({
          size: {
            height: 50, // No height change since deltaY is caused by clientRect moving vertically
            width: 45,
          },
        })
      );

      mockClientRect.left = 20; // Object moves between callbacks
      nwHandler(mockEvent, { node, deltaX: 5, deltaY: 10 });
      expect(props.onResize).toHaveBeenLastCalledWith(
        mockEvent,
        expect.objectContaining({
          size: {
            height: 40, // Height decreased as deltaY increases - no further top position change since last
            width: 25, // Width decreased 25 - 5 from deltaX and 20 from changing position
          },
        })
      );

      props.onResize.mockClear();
      mockClientRect.left -= 10; // Object moves between callbacks
      mockClientRect.top -= 10; // Object moves between callbacks
      nwHandler(mockEvent, { node, deltaX: 10, deltaY: 10 });
      expect(props.onResize).not.toHaveBeenCalled();

      mockClientRect.left -= 10; // Object moves between callbacks
      mockClientRect.top -= 10; // Object moves between callbacks
      const swHandler = resizableRef.current.resizeHandler('onResize', 'sw');
      swHandler(mockEvent, { node, deltaX: 10, deltaY: 10 });
      expect(props.onResize).toHaveBeenLastCalledWith(
        mockEvent,
        expect.objectContaining({
          size: {
            height: 60, // Changed since resizing from bottom doesn't cause position change
            width: 50, // No change - movement has caused entire delta
          },
        })
      );

      mockClientRect.left -= 10; // Object moves between callbacks
      mockClientRect.top -= 10; // Object moves between callbacks
      const neHandler = resizableRef.current.resizeHandler('onResize', 'ne');
      neHandler(mockEvent, { node, deltaX: 10, deltaY: 10 });
      expect(props.onResize).toHaveBeenLastCalledWith(
        mockEvent,
        expect.objectContaining({
          size: {
            height: 50, // No change - movement has caused entire delta
            width: 60, // Changed since resizing from right doesn't cause position change
          },
        })
      );

      mockClientRect.left -= 10; // Object moves between callbacks
      mockClientRect.top -= 10; // Object moves between callbacks
      const seHandler = resizableRef.current.resizeHandler('onResize', 'se');
      seHandler(mockEvent, { node, deltaX: 10, deltaY: 10 });
      expect(props.onResize).toHaveBeenLastCalledWith(
        mockEvent,
        expect.objectContaining({
          size: {
            height: 60, // Changed since resizing from right doesn't cause position change
            width: 60, // Changed since resizing from right doesn't cause position change
          },
        })
      );
    });

    test('use of < 1 transformScale', () => {
      render(
        <Resizable {...customProps} transformScale={0.5} ref={resizableRef}>
          {resizableBoxChildren}
        </Resizable>
      );

      expect(props.onResize).not.toHaveBeenCalled();
      const nwHandler = resizableRef.current.resizeHandler('onResize', 'nw');
      nwHandler(mockEvent, { node, deltaX: 5, deltaY: 10 });
      expect(props.onResize).toHaveBeenLastCalledWith(
        mockEvent,
        expect.objectContaining({
          size: {
            // Should be doubled
            height: 30,
            width: 40,
          },
        })
      );

      mockClientRect.left = 20; // Object moves between callbacks
      nwHandler(mockEvent, { node, deltaX: 5, deltaY: 10 });
      expect(props.onResize).toHaveBeenLastCalledWith(
        mockEvent,
        expect.objectContaining({
          size: {
            height: 30, // Height decreased as deltaY increases - no further top position change since last
            width: 20, // Width decreased 10 from deltaX and 20 from changing position
          },
        })
      );
    });

    test('use of > 1 transformScale', () => {
      render(
        <Resizable {...customProps} transformScale={2} ref={resizableRef}>
          {resizableBoxChildren}
        </Resizable>
      );

      expect(props.onResize).not.toHaveBeenCalled();
      const nwHandler = resizableRef.current.resizeHandler('onResize', 'nw');
      nwHandler(mockEvent, { node, deltaX: 5, deltaY: 10 });
      expect(props.onResize).toHaveBeenLastCalledWith(
        mockEvent,
        expect.objectContaining({
          size: {
            // Should be halved
            height: 45,
            width: 47.5,
          },
        })
      );
    });

    describe('lockAspectRatio', () => {
      [[5, 0], [0, 5], [10, 5], [5, 10], [50, 51]].forEach(([w, h]) => {
        test(`drags with aspect ratio preserved w:${w} h:${h}`, () => {
          render(
            <Resizable {...customProps} lockAspectRatio={true} ref={resizableRef}>
              {resizableBoxChildren}
            </Resizable>
          );

          expect(props.onResize).not.toHaveBeenCalled();
          const seHandler = resizableRef.current.resizeHandler('onResize', 'se');
          seHandler(mockEvent, { node, deltaX: w, deltaY: h });
          expect(props.onResize).toHaveBeenLastCalledWith(
            mockEvent,
            expect.objectContaining({
              size: {
                height: 50 + Math.max(w, h),
                width: 50 + Math.max(w, h),
              },
            })
          );
        });
      });
    });

    describe('onResizeStop with stale props', () => {
      // This tests the fix for a bug where onResizeStop would report stale size data
      // because React's batched state updates mean props.width/height haven't updated yet
      // when onResizeStop fires. The fix stores the last size from onResize and uses it
      // in onResizeStop. See: https://github.com/react-grid-layout/react-grid-layout/pull/2224

      test('onResizeStop reports correct size even when props are stale', () => {
        const onResizeStop = jest.fn();
        const onResize = jest.fn();
        const resizableRef = React.createRef();
        render(
          <Resizable {...customProps} onResize={onResize} onResizeStop={onResizeStop} ref={resizableRef}>
            {resizableBoxChildren}
          </Resizable>
        );

        // Simulate onResizeStart
        const startHandler = resizableRef.current.resizeHandler('onResizeStart', 'se');
        startHandler(mockEvent, { node, deltaX: 0, deltaY: 0 });

        // Simulate dragging - this calls onResize with the new size
        const dragHandler = resizableRef.current.resizeHandler('onResize', 'se');
        dragHandler(mockEvent, { node, deltaX: 20, deltaY: 30 });
        expect(onResize).toHaveBeenLastCalledWith(
          mockEvent,
          expect.objectContaining({
            size: { width: 70, height: 80 },
          })
        );

        // Now simulate onResizeStop. In a real app, React may not have re-rendered yet,
        // so props.width/height would still be 50. The deltaX/deltaY from DraggableCore's
        // onStop is typically 0 or very small since the mouse hasn't moved since the last
        // drag event. Without the fix, this would incorrectly report size: {width: 50, height: 50}.
        const stopHandler = resizableRef.current.resizeHandler('onResizeStop', 'se');
        stopHandler(mockEvent, { node, deltaX: 0, deltaY: 0 });

        // With the fix, onResizeStop should report the same size as the last onResize
        expect(onResizeStop).toHaveBeenCalledWith(
          mockEvent,
          expect.objectContaining({
            size: { width: 70, height: 80 },
          })
        );
      });

      test('onResizeStop reports correct size for west handle with stale props', () => {
        const onResizeStop = jest.fn();
        const onResize = jest.fn();
        const resizableRef = React.createRef();
        const testMockClientRect = { left: 0, top: 0 };
        const testNode = document.createElement('div');
        testNode.getBoundingClientRect = () => ({ ...testMockClientRect });

        render(
          <Resizable {...customProps} onResize={onResize} onResizeStop={onResizeStop} ref={resizableRef}>
            {resizableBoxChildren}
          </Resizable>
        );

        // Simulate onResizeStart - this sets lastHandleRect to {left: 0, top: 0}
        const startHandler = resizableRef.current.resizeHandler('onResizeStart', 'w');
        startHandler(mockEvent, { node: testNode, deltaX: 0, deltaY: 0 });

        // Simulate dragging west (left)
        // deltaX = -15 from drag, plus position adjustment of -15 (handle moved from 0 to -15)
        // Total deltaX = -30, reversed for 'w' = +30, so width = 50 + 30 = 80
        const dragHandler = resizableRef.current.resizeHandler('onResize', 'w');
        testMockClientRect.left = -15;
        dragHandler(mockEvent, { node: testNode, deltaX: -15, deltaY: 0 });
        expect(onResize).toHaveBeenLastCalledWith(
          mockEvent,
          expect.objectContaining({
            size: { width: 80, height: 50 },
          })
        );

        // Continue dragging - element moves further left
        // position adjustment: -25 - (-15) = -10, deltaX becomes -10 + (-10) = -20
        // reversed for 'w' = +20, width = 50 + 20 = 70
        testMockClientRect.left = -25;
        dragHandler(mockEvent, { node: testNode, deltaX: -10, deltaY: 0 });
        expect(onResize).toHaveBeenLastCalledWith(
          mockEvent,
          expect.objectContaining({
            size: { width: 70, height: 50 },
          })
        );

        // onResizeStop with stale props - should use stored lastSize (70x50 from last onResize)
        const stopHandler = resizableRef.current.resizeHandler('onResizeStop', 'w');
        stopHandler(mockEvent, { node: testNode, deltaX: 0, deltaY: 0 });
        expect(onResizeStop).toHaveBeenCalledWith(
          mockEvent,
          expect.objectContaining({
            size: { width: 70, height: 50 },
          })
        );
      });
    });
  });

  // ============================================
  // ADDITIONAL TEST COVERAGE
  // ============================================

  describe('axis restrictions', () => {
    test('axis="x" only allows horizontal resizing', () => {
      const resizableRef = React.createRef();
      render(
        <Resizable {...props} axis="x" resizeHandles={['se']} ref={resizableRef}>
          {resizableBoxChildren}
        </Resizable>
      );

      const mockEvent = {};
      const node = document.createElement('div');
      node.getBoundingClientRect = () => ({ left: 0, top: 0 });

      const seHandler = resizableRef.current.resizeHandler('onResize', 'se');
      seHandler(mockEvent, { node, deltaX: 10, deltaY: 20 });

      expect(props.onResize).toHaveBeenLastCalledWith(
        mockEvent,
        expect.objectContaining({
          size: {
            width: 60, // Changed
            height: 50, // Unchanged - y-axis disabled
          },
        })
      );
    });

    test('axis="y" only allows vertical resizing', () => {
      const resizableRef = React.createRef();
      render(
        <Resizable {...props} axis="y" resizeHandles={['se']} ref={resizableRef}>
          {resizableBoxChildren}
        </Resizable>
      );

      const mockEvent = {};
      const node = document.createElement('div');
      node.getBoundingClientRect = () => ({ left: 0, top: 0 });

      const seHandler = resizableRef.current.resizeHandler('onResize', 'se');
      seHandler(mockEvent, { node, deltaX: 10, deltaY: 20 });

      expect(props.onResize).toHaveBeenLastCalledWith(
        mockEvent,
        expect.objectContaining({
          size: {
            width: 50, // Unchanged - x-axis disabled
            height: 70, // Changed
          },
        })
      );
    });

    test('axis="none" disables all resizing', () => {
      const resizableRef = React.createRef();
      render(
        <Resizable {...props} axis="none" resizeHandles={['se']} ref={resizableRef}>
          {resizableBoxChildren}
        </Resizable>
      );

      const mockEvent = {};
      const node = document.createElement('div');
      node.getBoundingClientRect = () => ({ left: 0, top: 0 });

      const seHandler = resizableRef.current.resizeHandler('onResize', 'se');
      seHandler(mockEvent, { node, deltaX: 10, deltaY: 20 });

      // onResize should not be called when axis is 'none'
      expect(props.onResize).not.toHaveBeenCalled();
    });
  });

  describe('constraints', () => {
    test('minConstraints prevents sizing below minimum', () => {
      const resizableRef = React.createRef();
      render(
        <Resizable
          {...props}
          minConstraints={[30, 30]}
          maxConstraints={[Infinity, Infinity]}
          resizeHandles={['se']}
          ref={resizableRef}
        >
          {resizableBoxChildren}
        </Resizable>
      );

      const mockEvent = {};
      const node = document.createElement('div');
      node.getBoundingClientRect = () => ({ left: 0, top: 0 });

      const seHandler = resizableRef.current.resizeHandler('onResize', 'se');
      // Try to resize to 10x10 (below min of 30x30)
      seHandler(mockEvent, { node, deltaX: -40, deltaY: -40 });

      expect(props.onResize).toHaveBeenLastCalledWith(
        mockEvent,
        expect.objectContaining({
          size: {
            width: 30, // Constrained to min
            height: 30, // Constrained to min
          },
        })
      );
    });

    test('maxConstraints prevents sizing above maximum', () => {
      const resizableRef = React.createRef();
      render(
        <Resizable
          {...props}
          minConstraints={[20, 20]}
          maxConstraints={[80, 80]}
          resizeHandles={['se']}
          ref={resizableRef}
        >
          {resizableBoxChildren}
        </Resizable>
      );

      const mockEvent = {};
      const node = document.createElement('div');
      node.getBoundingClientRect = () => ({ left: 0, top: 0 });

      const seHandler = resizableRef.current.resizeHandler('onResize', 'se');
      // Try to resize to 150x150 (above max of 80x80)
      seHandler(mockEvent, { node, deltaX: 100, deltaY: 100 });

      expect(props.onResize).toHaveBeenLastCalledWith(
        mockEvent,
        expect.objectContaining({
          size: {
            width: 80, // Constrained to max
            height: 80, // Constrained to max
          },
        })
      );
    });
  });

  describe('onResizeStart and onResizeStop callbacks', () => {
    test('onResizeStart is called with correct data', () => {
      const resizableRef = React.createRef();
      render(
        <Resizable {...props} resizeHandles={['se']} ref={resizableRef}>
          {resizableBoxChildren}
        </Resizable>
      );

      const mockEvent = {};
      const node = document.createElement('div');
      node.getBoundingClientRect = () => ({ left: 0, top: 0 });

      const startHandler = resizableRef.current.resizeHandler('onResizeStart', 'se');
      startHandler(mockEvent, { node, deltaX: 0, deltaY: 0 });

      expect(props.onResizeStart).toHaveBeenCalledWith(
        mockEvent,
        expect.objectContaining({
          size: { width: 50, height: 50 },
          handle: 'se',
        })
      );
    });

    test('onResizeStop is called with correct data', () => {
      const resizableRef = React.createRef();
      render(
        <Resizable {...props} resizeHandles={['se']} ref={resizableRef}>
          {resizableBoxChildren}
        </Resizable>
      );

      const mockEvent = {};
      const node = document.createElement('div');
      node.getBoundingClientRect = () => ({ left: 0, top: 0 });

      // Start resize
      const startHandler = resizableRef.current.resizeHandler('onResizeStart', 'se');
      startHandler(mockEvent, { node, deltaX: 0, deltaY: 0 });

      // Drag to resize - this stores the size for onResizeStop to use
      const dragHandler = resizableRef.current.resizeHandler('onResize', 'se');
      dragHandler(mockEvent, { node, deltaX: 10, deltaY: 10 });

      // Stop resize - uses the stored size from the last onResize
      const stopHandler = resizableRef.current.resizeHandler('onResizeStop', 'se');
      stopHandler(mockEvent, { node, deltaX: 0, deltaY: 0 });

      expect(props.onResizeStop).toHaveBeenCalledWith(
        mockEvent,
        expect.objectContaining({
          size: { width: 60, height: 60 },
          handle: 'se',
        })
      );
    });
  });

  describe('all resize handle directions', () => {
    const allHandles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

    test('renders all specified handles', () => {
      const {container} = render(
        <Resizable {...props} resizeHandles={allHandles}>
          {resizableBoxChildren}
        </Resizable>
      );

      allHandles.forEach(handle => {
        expect(container.querySelector(`.react-resizable-handle-${handle}`)).toBeInTheDocument();
      });

      expect(container.querySelectorAll('.react-resizable-handle')).toHaveLength(allHandles.length);
    });
  });

  describe('event.persist handling', () => {
    test('calls event.persist when available', () => {
      const resizableRef = React.createRef();
      render(
        <Resizable {...props} resizeHandles={['se']} ref={resizableRef}>
          {resizableBoxChildren}
        </Resizable>
      );

      const mockEvent = { persist: jest.fn() };
      const node = document.createElement('div');
      node.getBoundingClientRect = () => ({ left: 0, top: 0 });

      const startHandler = resizableRef.current.resizeHandler('onResizeStart', 'se');
      startHandler(mockEvent, { node, deltaX: 0, deltaY: 0 });

      expect(mockEvent.persist).toHaveBeenCalled();
    });

    test('works when event.persist is not available', () => {
      const resizableRef = React.createRef();
      render(
        <Resizable {...props} resizeHandles={['se']} ref={resizableRef}>
          {resizableBoxChildren}
        </Resizable>
      );

      // Event without persist method (like native DOM events)
      const mockEvent = {};
      const node = document.createElement('div');
      node.getBoundingClientRect = () => ({ left: 0, top: 0 });

      // Should not throw
      const startHandler = resizableRef.current.resizeHandler('onResizeStart', 'se');
      expect(() => startHandler(mockEvent, { node, deltaX: 0, deltaY: 0 })).not.toThrow();
    });
  });

  describe('component unmounting', () => {
    test('resets data on unmount', () => {
      const resizableRef = React.createRef();
      const {unmount} = render(
        <Resizable {...props} resizeHandles={['se']} ref={resizableRef}>
          {resizableBoxChildren}
        </Resizable>
      );

      const mockEvent = {};
      const node = document.createElement('div');
      node.getBoundingClientRect = () => ({ left: 0, top: 0 });

      // Simulate some dragging to set internal state
      const dragHandler = resizableRef.current.resizeHandler('onResize', 'se');
      dragHandler(mockEvent, { node, deltaX: 10, deltaY: 10 });

      // Verify internal state exists before unmount
      expect(resizableRef.current.lastHandleRect).not.toBeNull();

      // Unmount should reset data
      unmount();

      // Note: We can't directly verify internal state after unmount,
      // but the test ensures componentWillUnmount runs without error
    });
  });

  describe('no callback provided', () => {
    test('works without onResize callback', () => {
      const resizableRef = React.createRef();
      const propsWithoutCallback = { ...props };
      delete propsWithoutCallback.onResize;

      render(
        <Resizable {...propsWithoutCallback} resizeHandles={['se']} ref={resizableRef}>
          {resizableBoxChildren}
        </Resizable>
      );

      const mockEvent = {};
      const node = document.createElement('div');
      node.getBoundingClientRect = () => ({ left: 0, top: 0 });

      const dragHandler = resizableRef.current.resizeHandler('onResize', 'se');
      // Should not throw even without callback
      expect(() => dragHandler(mockEvent, { node, deltaX: 10, deltaY: 10 })).not.toThrow();
    });
  });
});
