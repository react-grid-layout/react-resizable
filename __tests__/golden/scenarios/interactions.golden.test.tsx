import {matrix, regressions, browserScenarios} from '../scenarios';
import {runScenario} from '../harness';
import {expectGolden} from '../expectGolden';

describe('golden interaction boundary', () => {
  test.each([...matrix, ...regressions, ...browserScenarios])('$name', async scenario => { // oxlint-disable-line jest/expect-expect
    expectGolden(scenario.name, await runScenario(scenario));
  });
});
