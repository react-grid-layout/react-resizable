import * as React from 'react';
import Resizable from '../../lib/Resizable';
import ResizableBox from '../../lib/ResizableBox';
import {resolved, type Scenario} from './scenarios';
import type {createRecorder} from './recorder';

export type Recorder = ReturnType<typeof createRecorder>;

const ComponentHandle = React.forwardRef<HTMLSpanElement, any>(function ComponentHandle({handleAxis, ...rest}, ref) {
  return <span {...rest} ref={ref} className={`component-handle component-${handleAxis}`} data-axis={handleAxis} />;
});

export function Scene({scenario, recorder, userRef}: {scenario: Scenario; recorder: Recorder; userRef: React.RefObject<HTMLElement>}) {
  const s = resolved(scenario);
  const [size, setSize] = React.useState({width: s.width, height: s.height});
  const onResize = (e, data) => {
    recorder.callback('onResize')(e, data);
    if (s.mode !== 'frozen') {
      setSize(s.mode === 'clamp'
        ? {width: Math.min(data.size.width, 115), height: Math.min(data.size.height, 115)} : data.size);
    }
    return s.returnFalse ? false : undefined;
  };
  const record = (name: string) => (e, data) => {
    recorder.callback(name)(e, data);
    return s.returnFalse ? false : undefined;
  };
  const kinds = {
    default: undefined,
    element: <span className="element-handle" ref={userRef as React.RefObject<HTMLSpanElement>} />,
    fn: (axis, ref) => <span className={`function-handle function-${axis}`} ref={ref} />,
    'fn-no-ref': axis => <span className={`function-handle function-${axis}`} />,
    component: <ComponentHandle />,
  };
  const opts = {...s.opts};
  if (s.userHandlers) {
    for (const name of ['onStart', 'onDrag', 'onStop', 'onMouseDown']) {
      opts[name] = () => recorder.note(`draggableOpts.${name}`, 'called');
    }
    opts.nodeRef = userRef;
  }
  const props = {width: size.width, height: size.height, resizeHandles: s.handles,
    axis: s.axis, handle: kinds[s.kind], handleSize: s.handleSize, lockAspectRatio: s.lock,
    minConstraints: s.min, maxConstraints: s.max, transformScale: s.scale,
    draggableOpts: opts, onResizeStart: record('onResizeStart'), onResize,
    onResizeStop: record('onResizeStop'), className: 'outer', 'data-probe': 'passthrough'};
  const content = <span data-content="true">content</span>;
  if (s.component === 'ResizableBox') {
    // Keep the external props fixed: ResizableBox owns its own rendered size.
    return <ResizableBox {...props} width={s.width} height={s.height} style={{color: 'red'}}>{content}</ResizableBox>;
  }
  return <Resizable {...props}>
    <div className="child" title="original-child" style={{width: size.width, height: size.height, color: 'red'}}>{content}</div>
  </Resizable>;
}

// Both layout runners use a 300px stage and 10px handles. No library CSS is assumed.
export function sceneCSS(scenario: Scenario): string {
  const s = resolved(scenario);
  const position = s.anchor === 'bottomright' ? 'right:0;bottom:0' : 'left:100px;top:100px';
  return `html,body{margin:0} #stage{position:relative;left:400px;top:400px;width:300px;height:300px;transform-origin:0 0;transform:scale(${s.scale || 1})}
    .react-resizable{position:absolute;${position}} [data-content]{position:absolute;pointer-events:none}
    .react-resizable>:not([data-content]){position:absolute;width:10px;height:10px;touch-action:none}
    ` + s.handles.map((axis, i) => {
    const horizontal = axis.includes('w') ? 'left:0' : axis.includes('e') ? 'right:0' : 'left:calc(50% - 5px)';
    const vertical = axis.includes('n') ? 'top:0' : axis.includes('s') ? 'bottom:0' : 'top:calc(50% - 5px)';
    return `.react-resizable>:nth-child(${i + 2}){${horizontal};${vertical}}`;
  }).join('\n');
}
