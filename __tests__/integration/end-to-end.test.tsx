/**
 * End-to-end integration tests.
 *
 * These tests differ from the unit tests in two ways:
 *
 *   1. They drive the components through real DOM events (mousedown on a
 *      handle, then mousemove/mouseup on document) so the event flow runs
 *      through `react-draggable`'s `<DraggableCore>` into `<Resizable>`'s
 *      internal `resizeHandler`. The unit tests bypass DraggableCore by
 *      invoking `resizeHandler` directly via a ref.
 *
 *   2. The "build-artifact" suite imports from the package's CJS root
 *      (the same shape a consumer would `require()`) instead of from the
 *      TS source. That suite is gated on `build/` existing; CI runs
 *      `yarn build` before `yarn test` so the gate is open there. Locally,
 *      developers without a build will see the suite skip with a clear
 *      reason.
 */
import * as React from 'react';
import {render, fireEvent, act} from '@testing-library/react';
import * as fs from 'node:fs';
import * as path from 'node:path';

import ResizableFromSource from '../../lib/Resizable';
import ResizableBoxFromSource from '../../lib/ResizableBox';
import type {ResizeCallbackData, ResizeHandleAxis} from '../../lib/propTypes';

const BUILD_DIR = path.resolve(__dirname, '..', '..', 'build');
const HAS_BUILD = fs.existsSync(path.join(BUILD_DIR, 'Resizable.js'));

// Helper: simulate a complete drag gesture on a handle element.
// Mirrors what react-draggable's DraggableCore listens for — mousedown
// on the handle, then mousemove/mouseup on the owning document.
function drag(handle: Element, dx: number, dy: number, opts: {steps?: number} = {}) {
  const steps = opts.steps ?? 1;
  fireEvent.mouseDown(handle, {clientX: 0, clientY: 0});
  for (let i = 1; i <= steps; i++) {
    fireEvent.mouseMove(document, {
      clientX: (dx * i) / steps,
      clientY: (dy * i) / steps,
    });
  }
  fireEvent.mouseUp(document, {clientX: dx, clientY: dy});
}

function getHandle(container: HTMLElement, axis: ResizeHandleAxis): Element {
  const el = container.querySelector(`.react-resizable-handle-${axis}`);
  if (!el) throw new Error(`No handle for axis ${axis} in container`);
  return el;
}

// Shared suite that runs against an arbitrary {Resizable, ResizableBox} pair.
// We invoke it twice: once against the TS source, once against the built CJS.
function suite(
  label: string,
  Resizable: typeof ResizableFromSource,
  ResizableBox: typeof ResizableBoxFromSource,
) {
  describe(`integration: ${label}`, () => {

    describe('ResizableBox — real drag updates rendered size', () => {
      test('SE handle grows width and height by delta', () => {
        const {container} = render(
          <ResizableBox width={100} height={80} resizeHandles={['se']}>
            <div className="content" />
          </ResizableBox>,
        );

        const box = container.firstChild as HTMLElement;
        expect(box).toHaveStyle({width: '100px', height: '80px'});

        act(() => {
          drag(getHandle(container, 'se'), 25, 35);
        });

        expect(box).toHaveStyle({width: '125px', height: '115px'});
      });

      test('W handle shrinks width, leaves height alone', () => {
        const {container} = render(
          <ResizableBox width={200} height={120} resizeHandles={['w']}>
            <div className="content" />
          </ResizableBox>,
        );
        const box = container.firstChild as HTMLElement;
        act(() => drag(getHandle(container, 'w'), 40, 0));
        // Dragging W rightward (positive deltaX) shrinks width by 40.
        expect(box).toHaveStyle({width: '160px', height: '120px'});
      });

      test('N handle shrinks height, leaves width alone', () => {
        const {container} = render(
          <ResizableBox width={200} height={120} resizeHandles={['n']}>
            <div className="content" />
          </ResizableBox>,
        );
        const box = container.firstChild as HTMLElement;
        act(() => drag(getHandle(container, 'n'), 0, 30));
        expect(box).toHaveStyle({width: '200px', height: '90px'});
      });
    });

    describe('Resizable — controlled-mode callback flow', () => {
      test('onResize fires with computed size; onResizeStart and onResizeStop bracket the drag', () => {
        const onResize = jest.fn();
        const onResizeStart = jest.fn();
        const onResizeStop = jest.fn();

        const {container} = render(
          <Resizable
            width={100}
            height={100}
            resizeHandles={['se']}
            onResize={onResize}
            onResizeStart={onResizeStart}
            onResizeStop={onResizeStop}
          >
            <div style={{width: 100, height: 100}}>
              <span>content</span>
            </div>
          </Resizable>,
        );

        act(() => drag(getHandle(container, 'se'), 20, 30));

        expect(onResizeStart).toHaveBeenCalledTimes(1);
        expect(onResizeStop).toHaveBeenCalledTimes(1);
        expect(onResize).toHaveBeenCalled();
        const lastCall = (onResize.mock.calls.at(-1) as [unknown, ResizeCallbackData]);
        expect(lastCall[1].size).toEqual({width: 120, height: 130});
        expect(lastCall[1].handle).toBe('se');

        const stopCall = (onResizeStop.mock.calls.at(-1) as [unknown, ResizeCallbackData]);
        expect(stopCall[1].size).toEqual({width: 120, height: 130});
      });

      test('onResize is suppressed when net delta is zero', () => {
        const onResize = jest.fn();
        const {container} = render(
          <Resizable
            width={100}
            height={100}
            resizeHandles={['se']}
            onResize={onResize}
          >
            <div style={{width: 100, height: 100}} />
          </Resizable>,
        );

        // Drag out then back to origin.
        act(() => {
          const handle = getHandle(container, 'se');
          fireEvent.mouseDown(handle, {clientX: 0, clientY: 0});
          fireEvent.mouseMove(document, {clientX: 10, clientY: 10});
          fireEvent.mouseMove(document, {clientX: 0, clientY: 0});
          fireEvent.mouseUp(document, {clientX: 0, clientY: 0});
        });

        // First move (delta 10,10) should fire onResize. Second move returns
        // to origin — net delta from previous lastSize is non-zero (it's
        // -10,-10), so onResize *does* fire again to report the shrink. The
        // contract is "skip when dimensions haven't changed from the
        // accumulated base" (see PR #255), not "skip when net=0 from start".
        expect(onResize).toHaveBeenCalledTimes(2);
        const [, secondData] = onResize.mock.calls[1] as [unknown, ResizeCallbackData];
        expect(secondData.size).toEqual({width: 100, height: 100});
      });
    });

    describe('constraints enforced under real drag', () => {
      test('minConstraints clamp shrinking', () => {
        const {container} = render(
          <ResizableBox
            width={100}
            height={100}
            minConstraints={[60, 60]}
            resizeHandles={['se']}
          >
            <div />
          </ResizableBox>,
        );
        const box = container.firstChild as HTMLElement;
        // Drag SE handle far up-and-left to try to collapse below the min.
        act(() => drag(getHandle(container, 'se'), -200, -200));
        expect(box).toHaveStyle({width: '60px', height: '60px'});
      });

      test('maxConstraints clamp growing', () => {
        const {container} = render(
          <ResizableBox
            width={100}
            height={100}
            maxConstraints={[150, 150]}
            resizeHandles={['se']}
          >
            <div />
          </ResizableBox>,
        );
        const box = container.firstChild as HTMLElement;
        act(() => drag(getHandle(container, 'se'), 500, 500));
        expect(box).toHaveStyle({width: '150px', height: '150px'});
      });
    });

    describe('lockAspectRatio', () => {
      test('preserves aspect ratio when dragging SE', () => {
        const onResize = jest.fn();
        render(
          <Resizable
            width={200}
            height={100}
            resizeHandles={['se']}
            lockAspectRatio
            onResize={onResize}
          >
            <div style={{width: 200, height: 100}} />
          </Resizable>,
        );
        // The aspect ratio is 2:1; for any (w, h) reported, w === 2*h.
        const container = (onResize.mock.calls.length === 0
          ? document.body
          : document.body) as HTMLElement;
        act(() => drag(
          container.querySelector('.react-resizable-handle-se')!,
          40,
          0,
        ));

        expect(onResize).toHaveBeenCalled();
        for (const [, data] of onResize.mock.calls as [unknown, ResizeCallbackData][]) {
          expect(data.size.width / data.size.height).toBeCloseTo(2, 5);
        }
      });
    });

    describe('axis restriction', () => {
      test('axis="x" with se handle ignores Y delta', () => {
        const {container} = render(
          <ResizableBox
            width={100}
            height={100}
            axis="x"
            resizeHandles={['se']}
          >
            <div />
          </ResizableBox>,
        );
        const box = container.firstChild as HTMLElement;
        act(() => drag(getHandle(container, 'se'), 20, 50));
        expect(box).toHaveStyle({width: '120px', height: '100px'});
      });

      test('axis="y" with se handle ignores X delta', () => {
        const {container} = render(
          <ResizableBox
            width={100}
            height={100}
            axis="y"
            resizeHandles={['se']}
          >
            <div />
          </ResizableBox>,
        );
        const box = container.firstChild as HTMLElement;
        act(() => drag(getHandle(container, 'se'), 50, 20));
        expect(box).toHaveStyle({width: '100px', height: '120px'});
      });

      test('axis="none" disables both', () => {
        const {container} = render(
          <ResizableBox
            width={100}
            height={100}
            axis="none"
            resizeHandles={['se']}
          >
            <div />
          </ResizableBox>,
        );
        const box = container.firstChild as HTMLElement;
        act(() => drag(getHandle(container, 'se'), 50, 50));
        expect(box).toHaveStyle({width: '100px', height: '100px'});
      });
    });

    describe('transformScale', () => {
      test('scaled parent: deltas are divided by transformScale', () => {
        const onResize = jest.fn();
        const {container} = render(
          <Resizable
            width={100}
            height={100}
            resizeHandles={['se']}
            transformScale={2}
            onResize={onResize}
          >
            <div style={{width: 100, height: 100}} />
          </Resizable>,
        );
        act(() => drag(getHandle(container, 'se'), 40, 40));
        const last = onResize.mock.calls.at(-1) as [unknown, ResizeCallbackData];
        // 40 / 2 = 20 px of effective resize in either axis.
        expect(last[1].size).toEqual({width: 120, height: 120});
      });
    });

    describe('multiple handles render and respond independently', () => {
      test('all 8 handles present, each dispatches with correct axis', () => {
        const axes: ResizeHandleAxis[] = ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'];
        const onResizeStart = jest.fn();
        const {container} = render(
          <Resizable
            width={100}
            height={100}
            resizeHandles={axes}
            onResizeStart={onResizeStart}
          >
            <div style={{width: 100, height: 100}} />
          </Resizable>,
        );

        const seen: string[] = [];
        for (const axis of axes) {
          const el = container.querySelector(`.react-resizable-handle-${axis}`);
          expect(el).not.toBeNull();
          act(() => drag(el!, 1, 1));
          const last = onResizeStart.mock.calls.at(-1) as [unknown, ResizeCallbackData] | undefined;
          if (last) seen.push(last[1].handle);
        }
        expect(seen).toEqual(axes);
      });
    });

    describe('custom handle function receives axis and ref', () => {
      test('renders one element per requested axis', () => {
        const handleFn = jest.fn((axis: ResizeHandleAxis, ref: React.RefObject<HTMLElement>) => (
          <span className={`custom custom-${axis}`} data-testid={`custom-${axis}`} ref={ref as React.RefObject<HTMLSpanElement>} />
        ));
        const {getByTestId} = render(
          <Resizable
            width={100}
            height={100}
            resizeHandles={['n', 'e']}
            handle={handleFn}
          >
            <div style={{width: 100, height: 100}} />
          </Resizable>,
        );
        expect(getByTestId('custom-n')).toBeInTheDocument();
        expect(getByTestId('custom-e')).toBeInTheDocument();
        expect(handleFn).toHaveBeenCalledWith('n', expect.anything());
        expect(handleFn).toHaveBeenCalledWith('e', expect.anything());
      });
    });

    describe('mid-drag prop changes do not cause drift (regression: #255)', () => {
      test('parent failing to re-render between events does not lose deltas', () => {
        const onResize = jest.fn();

        // Controlled-mode component that intentionally ignores onResize.
        function Frozen() {
          // width/height never update — simulates a parent that can't
          // re-render between consecutive DraggableCore events.
          return (
            <Resizable width={100} height={100} resizeHandles={['se']} onResize={onResize}>
              <div style={{width: 100, height: 100}} />
            </Resizable>
          );
        }

        const {container} = render(<Frozen />);
        act(() => {
          const handle = getHandle(container, 'se');
          fireEvent.mouseDown(handle, {clientX: 0, clientY: 0});
          fireEvent.mouseMove(document, {clientX: 10, clientY: 10});
          fireEvent.mouseMove(document, {clientX: 20, clientY: 20});
          fireEvent.mouseMove(document, {clientX: 30, clientY: 30});
          fireEvent.mouseUp(document, {clientX: 30, clientY: 30});
        });

        const sizes = onResize.mock.calls.map(([, d]) => (d as ResizeCallbackData).size);
        // Each successive callback should be strictly larger than the
        // previous one — that's the contract that #255 restored.
        expect(sizes.length).toBeGreaterThanOrEqual(3);
        for (let i = 1; i < sizes.length; i++) {
          expect(sizes[i].width).toBeGreaterThan(sizes[i - 1].width);
          expect(sizes[i].height).toBeGreaterThan(sizes[i - 1].height);
        }
        // Final reported size from the cumulative 30px drag.
        expect(sizes.at(-1)).toEqual({width: 130, height: 130});
      });
    });
  });
}

// Always-run suite against the TS source.
suite('source (lib/)', ResizableFromSource, ResizableBoxFromSource);

// Build-artifact suite, only when `yarn build` output is present. Note:
// `describe.skip` still evaluates the body, so we must guard the require()
// itself, not just gate the describe.
if (HAS_BUILD) {
  // require() is intentional: we want to exercise the CJS root entry point
  // the same way a downstream consumer would.
  const pkg = require('../../');
  const {Resizable: BuiltResizable, ResizableBox: BuiltResizableBox} = pkg;

  describe('integration: built artifact (build/)', () => {
    test('package root exposes Resizable and ResizableBox', () => {
      expect(typeof BuiltResizable).toBe('function');
      expect(typeof BuiltResizableBox).toBe('function');
      expect(BuiltResizable.name).toBe('Resizable');
      expect(BuiltResizableBox.name).toBe('ResizableBox');
    });

    test('legacy direct-call guard throws', () => {
      expect(() => pkg()).toThrow(/Don't instantiate Resizable directly/);
    });

    suite(
      'built artifact',
      BuiltResizable as typeof ResizableFromSource,
      BuiltResizableBox as typeof ResizableBoxFromSource,
    );
  });
} else {
  console.warn(
    '[integration] Skipping build-artifact suite — run `yarn build` first to enable it.',
  );
}
