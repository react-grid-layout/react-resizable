import * as React from 'react';
import {render, act} from '@testing-library/react';
import {createRecorder, type Input} from './recorder';
import {Scene} from './fixture';
import {resolved, type Scenario} from './scenarios';

export function installLayout(scenario: Scenario) {
  const s = resolved(scenario);
  const proto = HTMLElement.prototype;
  const originalRect = Object.getOwnPropertyDescriptor(proto, 'getBoundingClientRect');
  const originalOffsetParent = Object.getOwnPropertyDescriptor(proto, 'offsetParent');
  const fallback = proto.getBoundingClientRect;
  const reads = {box: 0, handle: 0, other: 0};
  Object.defineProperty(proto, 'getBoundingClientRect', {configurable: true, writable: true, value: function () {
    const box = this.closest('.react-resizable') as HTMLElement;
    if (!box) { reads.other++; return fallback.call(this); }
    const isBox = this === box;
    reads[isBox ? 'box' : 'handle']++;
    const w = parseFloat(box.style.width) || 0, h = parseFloat(box.style.height) || 0;
    let left = s.anchor === 'bottomright' ? 300 - w : 100;
    let top = s.anchor === 'bottomright' ? 300 - h : 100;
    if (!isBox) {
      const children = Array.from(box.children).filter(el => !el.hasAttribute('data-content'));
      const axis = s.handles[children.indexOf(this)];
      left += axis.includes('w') ? 0 : axis.includes('e') ? w - 10 : (w - 10) / 2;
      top += axis.includes('n') ? 0 : axis.includes('s') ? h - 10 : (h - 10) / 2;
    }
    const scale = s.scale || 1;
    left *= scale; top *= scale;
    const width = (isBox ? w : 10) * scale, height = (isBox ? h : 10) * scale;
    return {left, top, width, height, right: left + width, bottom: top + height, x: left, y: top,
      toJSON() { return {left, top, width, height}; }};
  }});
  Object.defineProperty(proto, 'offsetParent', {configurable: true, get() {
    return this.parentElement?.closest('.react-resizable') ?? document.body;
  }});
  return {reads, restore() {
    if (originalRect) Object.defineProperty(proto, 'getBoundingClientRect', originalRect);
    else delete proto.getBoundingClientRect;
    if (originalOffsetParent) Object.defineProperty(proto, 'offsetParent', originalOffsetParent);
    else Reflect.deleteProperty(proto, 'offsetParent');
  }};
}

export function gestureInputs(scenario: Scenario, axis: string): Input[] {
  const s = resolved(scenario);
  // Relative screen coordinates. Signs grow all handles on the default path.
  const points = s.points ?? [[10 * (axis.includes('w') ? -1 : 1), 10 * (axis.includes('n') ? -1 : 1)],
    [20 * (axis.includes('w') ? -1 : 1), 20 * (axis.includes('n') ? -1 : 1)],
    [30 * (axis.includes('w') ? -1 : 1), 30 * (axis.includes('n') ? -1 : 1)]];
  const names = s.pointer === 'touch' ? ['touchstart', 'touchmove', 'touchend'] : ['mousedown', 'mousemove', 'mouseup'];
  const input = (type: string, point: number[], target = 'document') => ({type, clientX: point[0], clientY: point[1], target});
  return [input(names[0], [0, 0], `handle:${axis}`),
    ...points.map(p => input(names[1], p)), input(names[2], s.up ?? points[points.length - 1] ?? [0, 0])];
}

// Raw DOM dispatch keeps cadence B inside one outer act. RTL fireEvent wraps its own act.
function dispatch(input: Input, handle: HTMLElement) {
  const target = input.target === 'document' ? document : handle;
  const options = {bubbles: true, cancelable: true, clientX: input.clientX, clientY: input.clientY, button: 0};
  if (input.type.startsWith('mouse')) {
    target.dispatchEvent(new window.MouseEvent(input.type, options));
    return;
  }
  const touch = {identifier: 7, target: handle, clientX: input.clientX, clientY: input.clientY};
  const touches = input.type === 'touchend' ? [] : [touch];
  const event = new window.Event(input.type, options);
  Object.defineProperties(event, {touches: {value: touches}, targetTouches: {value: touches}, changedTouches: {value: [touch]}});
  target.dispatchEvent(event);
}

export async function runScenario(scenario: Scenario) {
  const s = resolved(scenario);
  const layout = installLayout(s);
  const container = document.createElement('div');
  document.body.appendChild(container);
  const recorder = createRecorder(s.handles, () => container, () => layout.reads);
  const userRef = React.createRef<HTMLElement>();
  let mounted = true;
  let view: ReturnType<typeof render>;
  // Drain scheduled selection cleanup at an explicit checkpoint, not wall-clock time.
  const originalRAF = window.requestAnimationFrame;
  const frames: Array<(time: number) => void> = [];
  window.requestAnimationFrame = callback => { frames.push(callback); return frames.length; };
  const onError = (event: any) => { recorder.error(event.error?.message ?? event.message); event.preventDefault(); };
  window.addEventListener('error', onError);
  try {
    recorder.begin({type: 'mount'});
    const scene = React.createElement(Scene, {scenario: s, recorder, userRef});
    view = render(s.strict ? React.createElement(React.StrictMode, null, scene) : scene, {container});
    recorder.end();
    const initial = recorder.dom();
    const event = (input: Input, handle: HTMLElement) => {
      recorder.begin(input);
      if (input.type === 'unmount') { view.unmount(); mounted = false; }
      else dispatch(input, handle);
      recorder.end();
    };
    const gesture = (axis: string) => {
      const handle = recorder.handles()[s.handles.indexOf(axis as any)];
      const inputs = gestureInputs(s, axis);
      if (s.unmount) inputs.splice(2, 0, {type: 'unmount'});
      for (const input of inputs) {
        if (s.cadence === 'per-event') {
          act(() => event(input, handle));
          // Include state committed by this event's act in the same step.
          recorder.end();
        } else event(input, handle);
      }
    };
    for (const axis of s.active ?? s.handles) {
      // Real frames run between separate gestures: drain the previous gesture's
      // scheduled cleanup, unrecorded, matching the browser runner's settle().
      act(() => { for (const callback of frames.splice(0)) callback(0); });
      if (s.cadence === 'batched') {
        act(() => { gesture(axis); recorder.begin({type: 'flush'}); });
        recorder.end();
      } else if (s.cadence === 'native-burst') {
        // Deliberately outside act until the whole native tick has completed (bug 5.4).
        const globals = globalThis as any;
        const previous = globals.IS_REACT_ACT_ENVIRONMENT;
        globals.IS_REACT_ACT_ENVIRONMENT = false;
        try {
          gesture(axis);
          recorder.begin({type: 'flush'});
          await act(async () => {});
          recorder.end();
        } finally { globals.IS_REACT_ACT_ENVIRONMENT = previous; }
      } else gesture(axis);
      if (s.unmount) break;
    }
    recorder.begin({type: 'animation-frame'});
    act(() => { for (const callback of frames.splice(0)) callback(0); });
    if (s.kind === 'element' || s.userHandlers) recorder.note('userRef', userRef.current ? 'attached' : 'null');
    recorder.end();
    return {scenario: s, initial, steps: recorder.steps, final: recorder.dom()};
  } finally {
    if (mounted && view) act(() => view.unmount());
    for (const callback of frames) callback(0);
    window.requestAnimationFrame = originalRAF;
    window.removeEventListener('error', onError);
    container.remove();
    layout.restore();
  }
}
