// @flow
import React from 'react';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import {DraggableCore} from "react-draggable";

import Resizable from '../lib/Resizable';

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
  const resizableBoxChildren =  <div style={{width: '50px', height: '50px'}}>{userChildren}</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('snapshot default props', () => {
    const tree = renderer.create(<Resizable {...props}>{resizableBoxChildren}</Resizable>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('with correct props', () => {
    const element = shallow(<Resizable {...props}>{resizableBoxChildren}</Resizable>);
    expect(element.find('.test-classname').find('.children'));
    expect(element.find(DraggableCore)).toHaveLength(2);
    const cursorSe = element.find('.react-resizable-handle-se');
    const cursorE = element.find('.react-resizable-handle-e');
    expect(cursorSe).toHaveLength(1);
    expect(cursorE).toHaveLength(1);
  });

  describe('and pass handle props', () => {
    test('as component', () => {
      const customProps = {
        ...props,
        resizeHandles: ['se'],
        handle: <span className={'custom-component'} />
      };
      const element = shallow(<Resizable {...customProps}>{resizableBoxChildren}</Resizable>);
      expect(element.find('.react-resizable-handle-se')).toHaveLength(0);
      expect(element.find('.custom-component')).toHaveLength(1);
    });
    test('as function', () => {
      const customProps = {
        ...props,
        resizeHandles: ['se'],
        handle: (h) => <span className={`custom-component-${h}`} />
      };
      const element = shallow(<Resizable {...customProps}>{resizableBoxChildren}</Resizable>);
      expect(element.find('.custom-component-se')).toHaveLength(1);
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
      const element = shallow(<Resizable {...allProps}><div className="foo" /></Resizable>);
      expect(Object.keys(element.find('.foo').props())).toEqual(['className', 'children']);
    });

    test('className is constructed properly', () => {
      const element = shallow(<Resizable {...allProps}><div className="foo" /></Resizable>);
      expect(element.find('.foo').props().className).toEqual(`foo ${allProps.className} react-resizable`);
    });
  });

  describe('onResize callback with modified position', () => {
    const customProps = {
      ...props,
      resizeHandles: ['nw', 'sw' ,'ne', 'se', 'n', 's', 'w', 'e'],
    };
    const mockClientRect = {
      left: 0,
      top: 0,
    };
    const node = document.createElement('div');
    // $FlowIgnore need to override to have control over dummy dom element
    node.getBoundingClientRect = () => ({ ...mockClientRect });
    const mockEvent = { };
    const element = shallow(<Resizable {...customProps}>{resizableBoxChildren}</Resizable>);
    const nwHandle = element.find('DraggableCore').first();

    test('Gradual resizing without movement between does not modify callback', () => {
      expect(props.onResize).not.toHaveBeenCalled();
      nwHandle.prop('onDrag')(mockEvent, { node, deltaX: 5, deltaY: 10 });
      expect(props.onResize).lastCalledWith(
        mockEvent,
        expect.objectContaining({
          size: {
            height: 40,
            width: 45,
          },
        })
      );
    });

    test('Movement between callbacks modifies response values', () => {
      expect(props.onResize).not.toHaveBeenCalled();

      mockClientRect.top = -10; // Object moves between callbacks
      nwHandle.prop('onDrag')(mockEvent, { node, deltaX: 5, deltaY: 10 });
      expect(props.onResize).lastCalledWith(
        mockEvent,
        expect.objectContaining({
          size: {
            height: 50, // No height change since deltaY is caused by clientRect moving vertically
            width: 45,
          },
        })
      );

      mockClientRect.left = 20; // Object moves between callbacks
      nwHandle.prop('onDrag')(mockEvent, { node, deltaX: 5, deltaY: 10 });
      expect(props.onResize).lastCalledWith(
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
      nwHandle.prop('onDrag')(mockEvent, { node, deltaX: 10, deltaY: 10 });
      expect(props.onResize).not.toHaveBeenCalled();

      mockClientRect.left -= 10; // Object moves between callbacks
      mockClientRect.top -= 10; // Object moves between callbacks
      const swHandle = element.find('DraggableCore').at(1);
      swHandle.prop('onDrag')(mockEvent, { node, deltaX: 10, deltaY: 10 });
      expect(props.onResize).lastCalledWith(
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
      const neHandle = element.find('DraggableCore').at(2);
      neHandle.prop('onDrag')(mockEvent, { node, deltaX: 10, deltaY: 10 });
      expect(props.onResize).lastCalledWith(
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
      const seHandle = element.find('DraggableCore').at(3);
      seHandle.prop('onDrag')(mockEvent, { node, deltaX: 10, deltaY: 10 });
      expect(props.onResize).lastCalledWith(
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
      const element = shallow(<Resizable {...customProps} transformScale={0.5}>{resizableBoxChildren}</Resizable>);
      const nwHandle = element.find('DraggableCore').first();
      expect(props.onResize).not.toHaveBeenCalled();
      nwHandle.prop('onDrag')(mockEvent, { node, deltaX: 5, deltaY: 10 });
      expect(props.onResize).lastCalledWith(
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
      nwHandle.prop('onDrag')(mockEvent, { node, deltaX: 5, deltaY: 10 });
      expect(props.onResize).lastCalledWith(
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
      const element = shallow(<Resizable {...customProps} transformScale={2}>{resizableBoxChildren}</Resizable>);
      const nwHandle = element.find('DraggableCore').first();
      expect(props.onResize).not.toHaveBeenCalled();
      nwHandle.prop('onDrag')(mockEvent, { node, deltaX: 5, deltaY: 10 });
      expect(props.onResize).lastCalledWith(
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
  });
});
