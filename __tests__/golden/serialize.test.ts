import {serialize} from './serialize';

const trace = (step: unknown) => serialize({scenario: 'x', initial: null, steps: [step], final: null});

it('never encodes an ordinary object the same as a sentinel', () => {
  const pairs: Array<[unknown, unknown]> = [
    [undefined, {$undefined: true}],
    [Infinity, {$number: 'Infinity'}],
    [-0, {$number: '-0'}],
    [new Array(1), [{$hole: true}]],
    [new Array(1), [null]],
    [{$undefined: true}, {$escaped: {$undefined: true}}]
  ];
  for (const [sentinel, lookalike] of pairs) {
    expect(trace(sentinel)).not.toBe(trace(lookalike));
  }
});
