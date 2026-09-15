import { expect, test, jest } from '@jest/globals';
import { createCleanup } from '../../src/lifecycle/cleanup.mjs';

test('cleans up listeners and abort handling idempotently', () => {
  const processObj = { off: jest.fn() };
  const signal = { aborted: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };
  const cleanup = createCleanup({ processObj, signal, listeners: new Map([['SIGTERM', jest.fn()]]), onBeforeExit: jest.fn() });
  cleanup.attachAbortHandler();
  cleanup.removeHandlers();
  cleanup.removeHandlers();
  expect(cleanup.getRemoved()).toBe(true);
  expect(processObj.off).toHaveBeenCalledTimes(2);
});
