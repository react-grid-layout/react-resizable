import React from 'react';
import {render} from '@testing-library/react';
import Resizable from '../lib/Resizable';

// Bounds can come from the available container space rather than the image ratio.
describe('locked aspect ratio with independent size constraints', () => {
  test.each([
    ['width maximum', [100, 50], [420, 400], [300, 150], [420, 210]],
    ['height maximum', [100, 50], [600, 210], [300, 150], [420, 210]],
    ['height minimum', [100, 130], [900, 450], [-200, -100], [260, 130]],
    ['width minimum', [260, 50], [900, 450], [-200, -100], [260, 130]],
  ])('%s preserves the ratio through overshoot, return and the next drag', (_label, min, max, delta, bound) => {
    const ref = React.createRef<Resizable>();
    let size = {width: 300, height: 150};
    const observe = (_event, data) => { size = data.size; };
    const element = () => <Resizable ref={ref} {...size} lockAspectRatio
      minConstraints={min} maxConstraints={max}
      onResizeStart={observe} onResize={observe} onResizeStop={observe}><div /></Resizable>;
    const {rerender} = render(element());
    const node = document.createElement('span');
    const send = (name, x, y) => {
      ref.current.resizeHandler(name, 'se')({} as React.SyntheticEvent, {node, deltaX: x, deltaY: y});
      rerender(element());
      expect(size.width).toBeCloseTo(2 * size.height);
      expect(size.width).toBeGreaterThanOrEqual(min[0]);
      expect(size.height).toBeGreaterThanOrEqual(min[1]);
      expect(size.width).toBeLessThanOrEqual(max[0]);
      expect(size.height).toBeLessThanOrEqual(max[1]);
    };
    send('onResizeStart', 0, 0);
    send('onResize', ...delta);
    expect(size).toEqual({width: bound[0], height: bound[1]});
    send('onResize', ...delta);
    send('onResize', 60 - 2 * delta[0], 30 - 2 * delta[1]);
    expect(size).toEqual({width: 360, height: 180});
    send('onResizeStop', 0, 0);
    send('onResizeStart', 0, 0);
    send('onResize', 20, 10);
    send('onResizeStop', 0, 0);
    expect(size).toEqual({width: 380, height: 190});
  });

  test('uses both bounds for a non-integer ratio', () => {
    const ref = React.createRef<Resizable>();
    render(<Resizable ref={ref} width={150} height={100} lockAspectRatio
      minConstraints={[120, 90]} maxConstraints={[450, 200]}><div /></Resizable>);
    expect(ref.current.runConstraints(600, 400)).toEqual([300, 200]);
    ref.current.resetData();
    expect(ref.current.runConstraints(30, 20)).toEqual([135, 90]);
  });

  test('keeps size bounds authoritative if they cannot satisfy the ratio', () => {
    const ref = React.createRef<Resizable>();
    render(<Resizable ref={ref} width={300} height={150} lockAspectRatio
      minConstraints={[100, 200]} maxConstraints={[300, 250]}><div /></Resizable>);
    expect(ref.current.runConstraints(600, 300)).toEqual([300, 250]);
  });
});
