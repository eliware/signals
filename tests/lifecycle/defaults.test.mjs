import { expect, test } from '@jest/globals';
import { defaultSignals } from '../../src/lifecycle/defaults.mjs';

test('exports the default signal set', () => {
  expect(defaultSignals).toEqual(['SIGTERM', 'SIGINT', 'SIGHUP']);
});
