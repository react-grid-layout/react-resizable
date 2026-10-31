// JSON stays valid, but values JSON normally loses retain their identity.
export function stableValue(value: unknown): any {
  if (value === undefined) return {$undefined: true};
  if (typeof value === 'number' && !Number.isFinite(value)) return {$number: String(value)};
  if (Object.is(value, -0)) return {$number: '-0'};
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]));
  }
  return value;
}

export function serialize(trace: {scenario: unknown; initial: unknown; steps: unknown[]; final: unknown}): string {
  const json = (value: unknown) => JSON.stringify(stableValue(value));
  return `{"scenario":${json(trace.scenario)},\n"initial":${json(trace.initial)},\n"steps":[\n` +
    trace.steps.map(json).join(',\n') + `\n],\n"final":${json(trace.final)}}\n`;
}
