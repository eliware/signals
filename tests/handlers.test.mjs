import { expect, test, jest } from '@jest/globals';
import { installHandlers } from '../handlers.mjs';

test('installs signal and beforeExit handlers', () => {
  const processObj = { on: jest.fn() };
  const shutdown = jest.fn();
  const onBeforeExit = jest.fn();
  const result = installHandlers({ processObj, signals: ['SIGTERM'], shutdown, onBeforeExit });
  expect(result.listeners.size).toBe(1);
  expect(processObj.on).toHaveBeenCalledTimes(2);
});
