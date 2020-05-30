import React from 'react';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import {DraggableCore} from "react-draggable";

import Resizable from '../lib/Resizable';

describe('render Resizable', () => {
  const props = {
    axis: 'both',
    className: 'test-classname',
    handleSize: [20, 20],
    height: 50,
    lockAspectRatio: false,
    maxConstraints: [Infinity, Infinity],
    minConstraints: [20, 20],
    onResize: jest.fn(),
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
});
