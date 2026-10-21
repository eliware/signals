import { expect, test } from "@jest/globals";
import { validateOptions } from "../../../src/lifecycle/validation/options.mjs";

test("accepts valid process and hook options", () => {
  expect(() =>
    validateOptions({ processObj: { on() {} }, shutdownHook() {}, signal: undefined }),
  ).not.toThrow();
});

test("requires a process event method", () => {
  expect(() =>
    validateOptions({ processObj: {}, shutdownHook: undefined, signal: undefined }),
  ).toThrow("processObj.on must be a function");
});

test("requires a function shutdown hook", () => {
  expect(() =>
    validateOptions({ processObj: { on() {} }, shutdownHook: true, signal: undefined }),
  ).toThrow("shutdownHook must be a function");
});

test("requires a valid abort signal", () => {
  expect(() => validateOptions({ processObj: { on() {} }, signal: {} })).toThrow(
    "signal must provide addEventListener",
  );
});
