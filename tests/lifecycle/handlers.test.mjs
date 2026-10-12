import { expect, test, jest } from "@jest/globals";
import { installHandlers } from "../../src/lifecycle/handlers.mjs";
import registerSignals from "../../src/index.mjs";

test("installs signal and beforeExit handlers", () => {
  const processObj = { on: jest.fn() };
  const shutdown = jest.fn();
  const onBeforeExit = jest.fn();
  const result = installHandlers({ processObj, signals: ["SIGTERM"], shutdown, onBeforeExit });
  expect(result.listeners.size).toBe(1);
  expect(processObj.on).toHaveBeenCalledTimes(2);
});

test("does not run stale handlers after cleanup without off", () => {
  const installed = new Map();
  const processObj = {
    on: jest.fn((event, listener) => {
      const listeners = installed.get(event) ?? [];
      listeners.push(listener);
      installed.set(event, listeners);
    }),
  };
  const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const oldHook = jest.fn();
  const newHook = jest.fn();
  const first = registerSignals({
    processObj,
    log,
    signals: ["SIGTERM"],
    exit: false,
    shutdownHook: oldHook,
  });
  first.removeHandlers();
  registerSignals({
    processObj,
    log,
    signals: ["SIGTERM"],
    exit: false,
    shutdownHook: newHook,
  });

  for (const listener of installed.get("SIGTERM")) listener();
  for (const listener of installed.get("beforeExit")) listener(0);

  expect(oldHook).not.toHaveBeenCalled();
  expect(newHook).toHaveBeenCalledTimes(1);
});
