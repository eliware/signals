import { expect, test, jest } from "@jest/globals";
import {
  normalizeSignals,
  validateLogger,
  validateOptions,
  validateLifecycleOptions,
} from "../../src/lifecycle/validation.mjs";
import registerSignals from "../../src/index.mjs";

const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };

test("normalizes default and duplicate signals", () => {
  const defaults = ["SIGTERM"];
  const normalized = normalizeSignals(undefined, defaults);
  expect(normalized).toEqual(defaults);
  expect(normalized).not.toBe(defaults);
  expect(normalizeSignals(["SIGTERM", "SIGTERM"], [])).toEqual(["SIGTERM"]);
});

test("validates logger and lifecycle options", () => {
  validateLogger(log);
  expect(() => validateLogger({})).toThrow(TypeError);
  expect(() => normalizeSignals("SIGTERM", [])).toThrow(TypeError);
  expect(() => normalizeSignals(["SIGTERM", 1], [])).toThrow(TypeError);
  expect(() =>
    validateOptions({ processObj: {}, shutdownHook: undefined, signal: undefined }),
  ).toThrow(TypeError);
  expect(() =>
    validateOptions({ processObj: { on() {} }, shutdownHook: true, signal: undefined }),
  ).toThrow(TypeError);
  expect(() =>
    validateOptions({ processObj: { on() {} }, shutdownHook: undefined, signal: {} }),
  ).toThrow(TypeError);
  validateLifecycleOptions({ exit: true, exitCode: 0 });
  expect(() => validateLifecycleOptions({ exit: "true", exitCode: 0 })).toThrow(TypeError);
  expect(() => validateLifecycleOptions({ exit: true, exitCode: Infinity })).toThrow(TypeError);
});

const makeProcess = () => ({ on: jest.fn(), off: jest.fn(), exit: jest.fn() });
const makeLog = () => ({ debug: jest.fn(), warn: jest.fn(), error: jest.fn() });

test("validates the public logger and lifecycle options", () => {
  expect(() => registerSignals({ processObj: makeProcess(), log: {} })).toThrow(TypeError);
  expect(() =>
    registerSignals({
      processObj: makeProcess(),
      log: { debug: jest.fn(), warn: jest.fn() },
    }),
  ).toThrow("Logger method error must be a function");
  expect(() => registerSignals(null)).toThrow("options must be an object");
  expect(() => registerSignals({ processObj: {}, log: makeLog() })).toThrow(
    "processObj.on must be a function",
  );
  expect(() =>
    registerSignals({ processObj: makeProcess(), log: makeLog(), shutdownHook: true }),
  ).toThrow("shutdownHook must be a function");
  expect(() => registerSignals({ processObj: makeProcess(), log: makeLog(), signal: {} })).toThrow(
    "signal must provide addEventListener",
  );
  expect(() =>
    registerSignals({ processObj: makeProcess(), log: makeLog(), exit: "false" }),
  ).toThrow("exit must be a boolean");
  expect(() =>
    registerSignals({ processObj: makeProcess(), log: makeLog(), exitCode: 1.5 }),
  ).toThrow("exitCode must be a finite integer");
});

test("validates public signals and removes duplicates", () => {
  expect(() => registerSignals({ processObj: makeProcess(), signals: "SIGTERM" })).toThrow(
    TypeError,
  );
  expect(() => registerSignals({ processObj: makeProcess(), signals: ["SIGTERM", 1] })).toThrow(
    TypeError,
  );
  const processObj = makeProcess();
  registerSignals({ processObj, log: makeLog(), signals: ["SIGTERM", "SIGTERM"] });
  expect(processObj.on).toHaveBeenCalledTimes(2);
});
