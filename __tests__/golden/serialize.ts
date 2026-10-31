// JSON stays valid, but values JSON normally loses (undefined, NaN, +/-Infinity,
// -0, array holes) keep their identity. Ordinary objects with a "$" key are
// wrapped in {$escaped}, so none collides with a sentinel.
export function stableValue(value: unknown): any {
  if (value === undefined) return {$undefined: true};
  if (typeof value === 'number' && !Number.isFinite(value)) return {$number: String(value)};
  if (Object.is(value, -0)) return {$number: '-0'};
  if (Array.isArray(value)) {
    return Array.from(value, (entry, i) => (i in value ? stableValue(entry) : {$hole: true}));
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    const encoded = Object.fromEntries(keys.map(key => [key, stableValue(value[key])]));
    // Sentinels are objects with a "$" key, so an ordinary object that has one is
    // wrapped. That keeps undefined and {$undefined: true} distinct.
    return keys.some(key => key.startsWith('$')) ? {$escaped: encoded} : encoded;
  }
  return value;
}

export function serialize(trace: {scenario: unknown; initial: unknown; steps: unknown[]; final: unknown}): string {
  const json = (value: unknown) => JSON.stringify(stableValue(value));
  return `{"scenario":${json(trace.scenario)},\n"initial":${json(trace.initial)},\n"steps":[\n` +
    trace.steps.map(json).join(',\n') + `\n],\n"final":${json(trace.final)}}\n`;
}
