import { expect, test, jest } from '@jest/globals';
import { normalizeSignals, validateLogger, validateOptions, validateLifecycleOptions } from '../../src/lifecycle/validation.mjs';

const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };

test('normalizes default and duplicate signals', () => {
  const defaults = ['SIGTERM'];
  const normalized = normalizeSignals(undefined, defaults);
  expect(normalized).toEqual(defaults);
  expect(normalized).not.toBe(defaults);
  expect(normalizeSignals(['SIGTERM', 'SIGTERM'], [])).toEqual(['SIGTERM']);
});

test('validates logger and lifecycle options', () => {
  validateLogger(log);
  expect(() => validateLogger({})).toThrow(TypeError);
  expect(() => normalizeSignals('SIGTERM', [])).toThrow(TypeError);
  expect(() => normalizeSignals(['SIGTERM', 1], [])).toThrow(TypeError);
  expect(() => validateOptions({ processObj: {}, shutdownHook: undefined, signal: undefined })).toThrow(TypeError);
  expect(() => validateOptions({ processObj: { on() {} }, shutdownHook: true, signal: undefined })).toThrow(TypeError);
  expect(() => validateOptions({ processObj: { on() {} }, shutdownHook: undefined, signal: {} })).toThrow(TypeError);
  validateLifecycleOptions({ exit: true, exitCode: 0 });
  expect(() => validateLifecycleOptions({ exit: 'true', exitCode: 0 })).toThrow(TypeError);
  expect(() => validateLifecycleOptions({ exit: true, exitCode: Infinity })).toThrow(TypeError);
});
