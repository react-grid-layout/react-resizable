// @flow
import React from 'react';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';

import ResizableBox from '../lib/ResizableBox';
import Resizable from "../lib/Resizable";

describe('render ResizableBox', () => {
  const props = {
    axis: 'x',
    draggableOpts: {},
    handle: jest.fn(resizeHandle => <span className={`test-class-${resizeHandle}`} />),
    handleSize: [20, 20],
    height: 50,
    lockAspectRatio: false,
    maxConstraints: [30, 30],
    minConstraints: [10, 10],
    onResize: jest.fn(),
    onResizeStart: jest.fn(),
    onResizeStop: jest.fn(),
    resizeHandles: ['w'],
    transformScale: 1,
    width: 50,
  };
  const children = <span className="children" />;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('snapshot default props', () => {
    const tree = renderer.create(<ResizableBox {...props}>{children}</ResizableBox>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('with correct props', () => {
    const element = shallow(<ResizableBox {...props}>{children}</ResizableBox>);
    expect(element.state()).toEqual({
      height: 50,
      propsHeight: 50,
      propsWidth: 50,
      width: 50,
    });
    const resizable = element.find(Resizable);
    const fakeEvent = {persist: jest.fn()};
    const data = {node: children, size: {width: 30, height: 30}, handle: 'w'};
    resizable.simulate('resize', fakeEvent, data);
    expect(element.state()).toEqual({
      height: 30,
      propsHeight: 50,
      propsWidth: 50,
      width: 30,
    });
    expect(element.find('.children')).toHaveLength(1);
    expect(fakeEvent.persist).toHaveBeenCalledTimes(1);
    expect(props.onResize).toHaveBeenCalledWith(fakeEvent, data);

    resizable.simulate('resizeStart', fakeEvent, data);
    expect(props.onResizeStart).toHaveBeenCalledWith(fakeEvent, data);

    resizable.simulate('resizeStop', fakeEvent, data);
    expect(props.onResizeStop).toHaveBeenCalledWith(fakeEvent, data);
  });

  describe('<Resizable> props filtering', () => {
    // Ensure everything in propTypes is represented here. Otherwise the next two tests are not valid
    test('all intended props are in our props object', () => {
      expect(['children', 'className', ...Object.keys(props)].sort()).toEqual(Object.keys(Resizable.propTypes).sort());
    });

    test('none of these props leak down to the child', () => {
      const element = shallow(<ResizableBox {...props} />);
      expect(Object.keys(element.find('div').props())).toEqual(['style']);
    });

    test('className is constructed properly', () => {
      const element = shallow(<ResizableBox {...props} className='foo' />);
      expect(element.find('div').props().className).toEqual(`foo`);
    });
  });

  test('style prop', () => {
    const element = shallow(<ResizableBox {...props} style={{backgroundColor: 'red'}}>{children}</ResizableBox>);
    expect(element.find('div').at(0).prop('style')).toEqual({
      width: '50px',
      height: '50px',
      backgroundColor: 'red'
    });
  });

  test('style prop width and height ignored', () => {
    const element = shallow(<ResizableBox {...props} style={{width: 10, height: 10}}>{children}</ResizableBox>);
    expect(element.find('div').at(0).prop('style')).toEqual({
      width: '50px',
      height: '50px',
    });
  });
});
