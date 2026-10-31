import type {Axis, ResizeHandleAxis} from '../../lib/propTypes';

export const axes: ResizeHandleAxis[] = ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'];
export type Scenario = {
  name: string;
  component?: 'Resizable' | 'ResizableBox';
  handles?: ResizeHandleAxis[];
  active?: ResizeHandleAxis[];
  axis?: Axis;
  mode?: 'follow' | 'frozen' | 'clamp';
  cadence?: 'per-event' | 'batched' | 'native-burst';
  anchor?: 'topleft' | 'bottomright';
  pointer?: 'mouse' | 'touch';
  width?: number;
  height?: number;
  min?: [number, number] | null;
  max?: [number, number] | null;
  lock?: boolean;
  scale?: number;
  kind?: 'default' | 'element' | 'fn' | 'fn-no-ref' | 'component';
  handleSize?: [number, number];
  opts?: Record<string, any>;
  userHandlers?: boolean;
  returnFalse?: boolean;
  points?: [number, number][];
  up?: [number, number];
  strict?: boolean;
  unmount?: boolean;
  knownBug?: string;
};

export function resolved(s: Scenario) {
  return {component: 'Resizable', handles: ['se'], axis: 'both', mode: 'follow',
    cadence: 'per-event', anchor: 'topleft', pointer: 'mouse', width: 100, height: 100,
    min: [20, 20], max: [Infinity, Infinity], lock: false, scale: 1,
    kind: 'default', handleSize: [20, 20], opts: {}, ...s} as Required<Scenario>;
}

// Four paths expose accumulation, a repeated coordinate, and a return from overshoot.
export const paths: [number, number][][] = [
  [[10, 10], [20, 20], [30, 30]],
  [[10, 5], [10, 5], [0, 0]],
  [[-100, -100], [-60, -60], [-20, -20], [10, 10]],
  [[80, 60], [40, 30], [10, 10], [-10, -10]],
];

const components = ['Resizable', 'ResizableBox'] as const;
export const matrix: Scenario[] = [];
for (const component of components) {
  // Full handle × axis × anchor × cadence coverage owns the layout correction.
  for (const handle of axes) {
    for (const axis of ['both', 'x', 'y', 'none'] as const) {
      for (const anchor of ['topleft', 'bottomright'] as const) {
        for (const cadence of ['per-event', 'batched'] as const) {
          matrix.push({name: `${component}-${handle}-${axis}-${anchor}-${cadence}`,
            component, handles: [handle], axis, anchor, cadence});
        }
      }
    }
  }
  for (const axis of ['both', 'x', 'y', 'none'] as const) {
    for (const anchor of ['topleft', 'bottomright'] as const) {
      for (const cadence of ['per-event', 'batched'] as const) {
        matrix.push({name: `${component}-all-handles-${axis}-${anchor}-${cadence}`, component,
          handles: axes, axis, anchor, cadence});
      }
    }
  }
  // Deterministic combinations exercise custom handles, scales, constraints, and paths.
  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      const constraint = (a + b) % 4;
      matrix.push({name: `${component}-options-${a}-${b}`, component,
        handles: [axes[(a * 4 + b) % 8]],
        kind: (['default', 'element', 'fn', 'component'] as const)[a],
        scale: [0.5, 1, 2, 1][b], lock: (a + b) % 2 === 0,
        min: constraint === 0 ? null : [80, 70],
        max: constraint < 2 ? null : [120, 115],
        points: paths[(a + 2 * b) % 4], anchor: a % 2 ? 'bottomright' : 'topleft',
        pointer: b % 2 ? 'mouse' : 'touch', mode: (['follow', 'frozen', 'clamp', 'follow'] as const)[b]});
    }
  }
  for (const lock of [false, true]) {
    const cases: Array<Pick<Scenario, 'name' | 'min' | 'max' | 'points'>> = [
      {name: 'unbounded', min: null, max: null, points: paths[0]},
      {name: 'min-not-binding', min: [20, 20], max: null, points: paths[0]},
      {name: 'min-binding-return', min: [80, 70], max: null, points: paths[2]},
      {name: 'max-not-binding', min: null, max: [1000, 1000], points: paths[0]},
      {name: 'max-binding-return', min: null, max: [120, 115], points: paths[3]},
      {name: 'tight-min-max', min: [90, 90], max: [110, 110], points: paths[2]},
    ];
    for (const entry of cases) {
      matrix.push({...entry, name: `${component}-constraints-${entry.name}-lock-${lock}`, component, lock});
    }
  }
}

export const regressions: Scenario[] = [
  {name: 'known-aspect-max-drift', width: 100, height: 50, lock: true, max: [120, 1000], points: [[50, 0], [100, 0], [100, 60]], knownBug: '5.1: binding max distorts the ratio and subsequent projections drift'},
  {name: 'known-aspect-max-drift-batched', width: 100, height: 50, lock: true, max: [120, 1000], cadence: 'batched', points: [[50, 0], [100, 0], [100, 60]], knownBug: '5.1: binding max distorts the ratio even when props remain stale'},
  {name: 'known-lock-axis-x', width: 100, height: 50, lock: true, axis: 'x', points: [[20, 0]], knownBug: '5.2: aspect projection changes height with axis x'},
  {name: 'known-box-missing-width', component: 'ResizableBox', axis: 'y', width: undefined, knownBug: '5.3a: optional width produces NaN in resize callbacks'},
  {name: 'known-lock-zero-height', height: 0, lock: true, min: [0, 0], knownBug: '5.3b: infinite aspect ratio produces NaN sizes'},
  {name: 'known-scale-zero', scale: 0, knownBug: '5.3c: zero transformScale produces nonfinite sizes'},
  {name: 'known-box-resize-after-stop', component: 'ResizableBox', cadence: 'native-burst', knownBug: '5.4: pending user onResize callbacks commit after onResizeStop'},
  {name: 'known-mouseup-delta', points: [[10, 10]], up: [30, 30], knownBug: '5.5: mouseup delta is dropped and stop reports the last move'},
  {name: 'known-draggable-handlers-overwritten', userHandlers: true, knownBug: '5.6: onStart onDrag onStop and nodeRef in draggableOpts are overwritten'},
  {name: 'known-function-without-ref', kind: 'fn-no-ref', knownBug: '5.7: function handle without forwarding the ref throws on mousedown'},
  {name: 'known-start-constrained', width: 10, height: 10, points: [[5, 5], [15, 15]], knownBug: '5.8: start reports constrained dimensions before the DOM has that size'},
  {name: 'known-axis-none', axis: 'none', knownBug: '5.9: axis none suppresses start and stop but activates user-select styles'},
  {name: 'known-incompatible-axis', axis: 'x', handles: ['n'], knownBug: '5.9: an incompatible handle suppresses start and stop'},
  {name: 'known-element-ref-overwritten', kind: 'element', knownBug: '5.11: the supplied element ref never receives the handle'},
  {name: 'handle-size-small', handleSize: [5, 5]},
  {name: 'handle-size-large', handleSize: [50, 50]},
  {name: 'grid-relative-deltas', opts: {grid: [10, 10]}, points: [[2, 2], [6, 6], [14, 14], [26, 26]]},
  {name: 'draggable-disabled', opts: {disabled: true}},
  {name: 'draggable-cancel', opts: {cancel: '.react-resizable-handle'}},
  {name: 'draggable-handle-selector', opts: {handle: '.does-not-match'}},
  {name: 'draggable-no-user-select', opts: {enableUserSelectHack: false}},
  {name: 'draggable-double-scale', scale: 2, opts: {scale: 2}},
  {name: 'controlled-frozen', mode: 'frozen'},
  {name: 'controlled-clamp', mode: 'clamp', points: [[40, 40], [80, 80], [50, 50]]},
  {name: 'cadence-B-stale-props-255', cadence: 'batched', points: [[10, 10], [20, 20], [20, 20], [30, 30]]},
  {name: 'box-cadence-B-stale-props-255', component: 'ResizableBox', cadence: 'batched'},
  {name: 'callback-false-is-ignored', returnFalse: true},
  {name: 'touch-nw-moving-layout', pointer: 'touch', handles: ['nw'], anchor: 'bottomright'},
  {name: 'unmount-mouse', unmount: true},
  {name: 'unmount-touch', unmount: true, pointer: 'touch', handles: ['nw'], anchor: 'bottomright'},
  {name: 'strict-resizable', strict: true, handles: axes, anchor: 'bottomright'},
  {name: 'strict-box', strict: true, component: 'ResizableBox', handles: axes, anchor: 'bottomright'},
];

// Real-browser parity includes both components, every handle/anchor, then edge cases.
export const browserScenarios: Scenario[] = [
  ...components.flatMap(component => axes.flatMap(handle => (['topleft', 'bottomright'] as const)
    .map(anchor => ({name: `browser-${component}-${handle}-${anchor}`, component, handles: [handle], anchor})))),
  ...regressions.filter(s => ['known-lock-axis-x', 'known-mouseup-delta', 'grid-relative-deltas', 'controlled-frozen', 'strict-box'].includes(s.name))
    .map(s => ({...s, name: `browser-${s.name}`})),
  // Integer CSS sizes allow exact style comparisons across CSSOM implementations.
  {name: 'browser-lock-max-binding', width: 100, height: 50, lock: true,
    max: [120, 1000], points: [[50, 0]], knownBug: '5.1: independent max clamping distorts the aspect ratio'},
  ...[0.5, 2].flatMap(scale => ['se', 'nw'].map(handle => ({name: `browser-scale-${scale}-${handle}`,
    scale, handles: [handle as ResizeHandleAxis], anchor: 'bottomright' as const}))),
];
