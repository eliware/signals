import { expect, test, jest } from '@jest/globals';
import { createShutdown } from '../../src/lifecycle/shutdown.mjs';

test('runs hooks in order and isolates failures', async () => {
  const calls = [];
  const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const shutdown = createShutdown({ hooks: [async () => { calls.push('one'); throw Error('x'); }, async () => calls.push('two')], log, processObj: { exit: jest.fn() }, exit: false, exitCode: 0 });
  await shutdown.shutdown('SIGTERM');
  await shutdown.shutdown('SIGINT');
  expect(calls).toEqual(['one', 'two']);
  expect(log.warn).toHaveBeenCalled();
});

test('runs hooks once on beforeExit', async () => {
  const hook = jest.fn();
  const lifecycle = createShutdown({ hooks: [hook], log: { debug: jest.fn(), warn: jest.fn(), error: jest.fn() }, processObj: {}, exit: false, exitCode: 0 });
  const first = lifecycle.onBeforeExit(0);
  const second = lifecycle.onBeforeExit(0);
  await first;
  expect(second).toBe(first);
  expect(hook).toHaveBeenCalledTimes(1);
});
