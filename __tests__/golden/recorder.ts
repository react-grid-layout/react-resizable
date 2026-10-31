import type {ResizeCallbackData, ResizeHandleAxis} from '../../lib/propTypes';

export type Input = {type: string; target?: string; clientX?: number; clientY?: number};
export type Step = {input: Input; calls: any[]; errors: string[]; dom?: any; rectReads?: any};

// Shared by jsdom and the browser. Reading the DOM here must never read layout.
export function createRecorder(axes: ResizeHandleAxis[], getContainer: () => HTMLElement, reads: () => any) {
  const ids = new WeakMap<HTMLElement, string>();
  const generations: Record<string, number> = {};
  const steps: Step[] = [];
  let current: Step;
  const handles = () => Array.from(getContainer().querySelector('.react-resizable')?.children ?? [])
    .filter((el: HTMLElement) => !el.hasAttribute('data-content')) as HTMLElement[];
  const identity = (node: HTMLElement, axis: string) => {
    if (!ids.has(node)) ids.set(node, `handle:${axis}#${generations[axis] = (generations[axis] ?? 0) + 1}`);
    return ids.get(node);
  };
  const dom = () => {
    const box = getContainer().querySelector<HTMLElement>('.react-resizable');
    const rendered = handles();
    return {
      box: box ? {tag: box.tagName.toLowerCase(), className: box.className,
        // Every inline style property, not just the size: a refactor that drops
        // a user's style must change the trace.
        style: Array.from(box.style).sort().map(prop => [prop, box.style.getPropertyValue(prop)]),
        attrs: Array.from(box.attributes).filter(a => a.name !== 'style' && a.name !== 'class')
          .map(a => [a.name, a.value]).sort(),
        childOrder: Array.from(box.children).map(el => el.hasAttribute('data-content') ? 'content' : `handle:${axes[rendered.indexOf(el as HTMLElement)]}`)} : null,
      handles: rendered.map((el, i) => ({axis: axes[i], tag: el.tagName.toLowerCase(),
        className: el.className, node: identity(el, axes[i])})),
      bodyUserSelect: document.body.classList.contains('react-draggable-transparent-selection'),
    };
  };
  const begin = (input: Input) => {
    current = {input, calls: [], errors: []};
    steps.push(current);
  };
  const end = () => { current.dom = dom(); current.rectReads = {...reads()}; };
  const callback = (name: string) => (e: any, data: ResizeCallbackData) => {
    const expected = handles()[axes.indexOf(data.handle)];
    current.calls.push({name, handle: data.handle, size: {...data.size},
      eventKind: e.nativeEvent ? 'synthetic' : 'native', eventType: e.type,
      node: identity(data.node, data.handle), nodeIsHandle: data.node === expected});
  };
  return {steps, begin, end, dom, callback, handles,
    error: (message: string) => current.errors.push(message),
    note: (name: string, value: unknown) => current.calls.push({name, value})};
}
