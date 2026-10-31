import * as React from 'react';
import {createRoot} from 'react-dom/client';
import {Scene, sceneCSS} from '../fixture';
import {createRecorder, type Input} from '../recorder';
import {browserScenarios, resolved} from '../scenarios';
import {stableValue} from '../serialize';

// Keep React's event cadence aligned with the jsdom harness while Playwright
// supplies trusted mouse events through Chromium's input protocol.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const frames: Array<(time: number) => void> = [];
window.requestAnimationFrame = callback => { frames.push(callback); return frames.length; };

const stage = document.createElement('div');
stage.id = 'stage';
document.body.appendChild(stage);
const style = document.createElement('style');
document.head.appendChild(style);
const root = createRoot(stage);
let scenario: ReturnType<typeof resolved>;
let recorder: ReturnType<typeof createRecorder>;
let initial: unknown;
let release: () => void;
let pending: Promise<void>;
const userRef = React.createRef<HTMLElement>();
window.addEventListener('error', event => {
  recorder.error(event.error?.message ?? event.message);
  event.preventDefault();
});

function inputs(axis: string): Input[] {
  const points = scenario.points ?? [10, 20, 30].map(n =>
    [n * (axis.includes('w') ? -1 : 1), n * (axis.includes('n') ? -1 : 1)]);
  const input = (type: string, point: number[], target = 'document') =>
    ({type, target, clientX: point[0], clientY: point[1]});
  return [input('mousedown', [0, 0], `handle:${axis}`),
    ...points.map(point => input('mousemove', point)),
    input('mouseup', scenario.up ?? points[points.length - 1] ?? [0, 0])];
}

(window as any).goldenBrowser = {
  names: browserScenarios.map(s => s.name),
  async mount(name: string) {
    const selected = browserScenarios.find(s => s.name === name);
    if (!selected) throw new Error(`Unknown browser scenario: ${name}`);
    scenario = resolved(selected);
    if (scenario.pointer !== 'mouse' || scenario.cadence !== 'per-event') {
      throw new Error(`Browser runner requires per-event mouse input: ${name}`);
    }
    style.textContent = sceneCSS(scenario);
    recorder = createRecorder(scenario.handles, () => stage, () => ({}));
    recorder.begin({type: 'mount'});
    const scene = <Scene scenario={scenario} recorder={recorder} userRef={userRef} />;
    await React.act(async () => {
      root.render(scenario.strict ? <React.StrictMode>{scene}</React.StrictMode> : scene);
    });
    recorder.end();
    initial = recorder.dom();
    return (scenario.active ?? scenario.handles).map(axis => ({axis, inputs: inputs(axis)}));
  },
  origin(axis: string) {
    const handle = recorder.handles()[scenario.handles.indexOf(axis as any)];
    const rect = handle.getBoundingClientRect();
    if (!rect.width || !rect.height) throw new Error(`Handle ${axis} has no hit area`);
    return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
  },
  begin(input: Input) {
    recorder.begin(input);
    pending = Promise.resolve(React.act(async () => {
      await new Promise<void>(resolve => { release = resolve; });
    }));
  },
  async end() {
    release();
    await pending;
    recorder.end();
  },
  async finish() {
    recorder.begin({type: 'animation-frame'});
    await React.act(async () => { for (const callback of frames.splice(0)) callback(0); });
    if (scenario.kind === 'element' || scenario.userHandlers) {
      recorder.note('userRef', userRef.current ? 'attached' : 'null');
    }
    recorder.end();
    return stableValue({scenario, initial, steps: recorder.steps, final: recorder.dom()});
  },
};
