import registerSignalsDefault, { registerSignals as registerSignalsNamed } from '../index.mjs';
import { jest, test, expect, beforeEach, describe } from '@jest/globals';

const makeProcess = () => ({ on: jest.fn(), off: jest.fn(), exit: jest.fn() });
const makeLog = () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() });
const handler = (processObj, event) => processObj.on.mock.calls.find(([name]) => name === event)[1];

describe('registerSignals', () => {
  let mockProcess;
  let mocklog;

  beforeEach(() => {
    mockProcess = makeProcess();
    mocklog = makeLog();
  });

  test('uses defaults when options are omitted', () => {
    const { getShuttingDown } = registerSignalsNamed();
    expect(getShuttingDown()).toBe(false);
  });

  test('supports named and default exports', () => {
    expect(registerSignalsNamed).toBe(registerSignalsDefault);
    registerSignalsNamed({ processObj: mockProcess, log: mocklog });
    expect(mockProcess.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
    expect(mockProcess.on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(mockProcess.on).toHaveBeenCalledWith('SIGHUP', expect.any(Function));
  });

  test('accepts custom signals and only registers handlers once per process', () => {
    registerSignalsNamed({ processObj: mockProcess, log: mocklog, signals: ['USR1'] });
    registerSignalsNamed({ processObj: mockProcess, log: mocklog, signals: ['USR2'] });
    expect(mockProcess.on).toHaveBeenCalledWith('USR1', expect.any(Function));
    expect(mockProcess.on).not.toHaveBeenCalledWith('USR2', expect.any(Function));
    expect(mocklog.debug).toHaveBeenCalledWith('Registered Handlers', { signals: 'USR1' });
  });

  test('runs hooks, exits, and reports repeated shutdown', async () => {
    const hook = jest.fn(async signal => signal);
    const { shutdown, getShuttingDown } = registerSignalsNamed({ processObj: mockProcess, log: mocklog, signals: [], shutdownHook: hook });
    expect(getShuttingDown()).toBe(false);
    await shutdown('SIGTERM');
    await shutdown('SIGTERM');
    expect(getShuttingDown()).toBe(true);
    expect(hook).toHaveBeenCalledWith('SIGTERM');
    expect(mocklog.debug).toHaveBeenCalledWith('Received SIGTERM. Shutting down gracefully...');
    expect(mocklog.warn).toHaveBeenCalledWith('Received SIGTERM again, but already shutting down.');
    expect(mockProcess.exit).toHaveBeenCalledWith(0);
  });

  test('signal handler invokes shutdown', async () => {
    registerSignalsNamed({ processObj: mockProcess, log: mocklog, signals: ['SIGINT'] });
    await handler(mockProcess, 'SIGINT')();
    expect(mockProcess.exit).toHaveBeenCalledWith(0);
  });

  test('runs every registered hook in order', async () => {
    const calls = [];
    const first = jest.fn(async () => calls.push('first'));
    const second = jest.fn(async () => calls.push('second'));
    const { shutdown } = registerSignalsNamed({ processObj: mockProcess, log: mocklog, signals: [], shutdownHook: first });
    registerSignalsNamed({ processObj: mockProcess, log: mocklog, signals: [], shutdownHook: second });
    await shutdown('SIGHUP');
    expect(calls).toEqual(['first', 'second']);
  });

  test('logs hook errors and still exits', async () => {
    const error = new Error('failure');
    const hook = jest.fn(async () => { throw error; });
    const { shutdown } = registerSignalsNamed({ processObj: mockProcess, log: mocklog, signals: [], shutdownHook: hook });
    await shutdown('SIGTERM');
    expect(mocklog.error).toHaveBeenCalledWith('Error during shutdown hook:', error);
    expect(mockProcess.exit).toHaveBeenCalledWith(0);
  });

  test('runs hooks on exit and beforeExit only once', async () => {
    const hook = jest.fn(async signal => signal);
    registerSignalsNamed({ processObj: mockProcess, log: mocklog, signals: [], shutdownHook: hook });
    await handler(mockProcess, 'beforeExit')(3);
    await handler(mockProcess, 'exit')(0);
    expect(hook).toHaveBeenCalledWith('exit');
    expect(hook).toHaveBeenCalledTimes(1);
    expect(mocklog.debug).toHaveBeenCalledWith('Process exiting (code 3). Running shutdown hooks...');
  });

  test('exit handler logs hook errors', async () => {
    const error = new Error('exit failure');
    registerSignalsNamed({ processObj: mockProcess, log: mocklog, signals: [], shutdownHook: async () => { throw error; } });
    await handler(mockProcess, 'exit')(1);
    expect(mocklog.error).toHaveBeenCalledWith('Error during shutdown hook:', error);
  });
});


test('validates signals and deduplicates custom names', () => {
  expect(() => registerSignalsNamed({ processObj: makeProcess(), signals: 'SIGTERM' })).toThrow(TypeError);
  expect(() => registerSignalsNamed({ processObj: makeProcess(), signals: ['SIGTERM', 1] })).toThrow(TypeError);
  const processObj = makeProcess();
  registerSignalsNamed({ processObj, log: makeLog(), signals: ['SIGTERM', 'SIGTERM'] });
  expect(processObj.on).toHaveBeenCalledTimes(3);
});

test('supports cleanup, abort, non-exiting shutdown, and custom exit code', async () => {
  const processObj = makeProcess();
  const log = makeLog();
  const registration = registerSignalsNamed({ processObj, log, signals: ['USR1'], exit: false });
  await registration.shutdown();
  expect(processObj.exit).not.toHaveBeenCalled();
  registration.removeHandlers();
  registration.removeHandlers();
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalled();
  const controller = new AbortController();
  const aborted = registerSignalsNamed({ processObj: makeProcess(), log, signals: [], signal: controller.signal });
  controller.abort();
  expect(aborted.removed).toBe(true);
  const already = new AbortController();
  already.abort();
  expect(registerSignalsNamed({ processObj: makeProcess(), log, signals: [], signal: already.signal }).removed).toBe(true);
});

test('continues hooks, prevents concurrent shutdown, and honors exit code', async () => {
  const processObj = makeProcess();
  const log = makeLog();
  const first = jest.fn(async () => { throw new Error('first'); });
  const second = jest.fn(async () => undefined);
  const registration = registerSignalsNamed({ processObj, log, signals: [], shutdownHook: first, exitCode: 7 });
  registerSignalsNamed({ processObj, log, signals: [], shutdownHook: second });
  const one = registration.shutdown('SIGTERM');
  const two = registration.shutdown('SIGINT');
  await Promise.all([one, two]);
  expect(second).toHaveBeenCalledWith('SIGTERM');
  expect(processObj.exit).toHaveBeenCalledWith(7);
  expect(log.warn).toHaveBeenCalledWith('Received SIGINT again, but already shutting down.');
});

test('supports process-like objects without exit or off', async () => {
  const processObj = { on: jest.fn() };
  const registration = registerSignalsNamed({ processObj, log: makeLog(), signals: [] });
  await registration.shutdown('manual');
  registration.removeHandlers();
  expect(registration.removed).toBe(true);
});
