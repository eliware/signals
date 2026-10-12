import { expect, test, jest } from "@jest/globals";
import { createShutdown } from "../../src/lifecycle/shutdown.mjs";
import registerSignals from "../../src/index.mjs";

const makeLog = (error = jest.fn()) => ({ debug: jest.fn(), warn: jest.fn(), error });
const makeLifecycle = (hooks, options = {}) =>
  createShutdown({ hooks, log: makeLog(), processObj: {}, exit: false, exitCode: 0, ...options });

test("runs hooks in order and isolates failures", async () => {
  const calls = [];
  const log = makeLog();
  const shutdown = createShutdown({
    hooks: [
      async () => {
        calls.push("one");
        throw Error("x");
      },
      async () => calls.push("two"),
    ],
    log,
    processObj: { exit: jest.fn() },
    exit: false,
    exitCode: 0,
  });
  await shutdown.shutdown("SIGTERM");
  await shutdown.shutdown("SIGINT");
  expect(calls).toEqual(["one", "two"]);
  expect(log.warn).toHaveBeenCalled();
});

test("does not exit after manual shutdown", async () => {
  const processObj = { on: jest.fn(), off: jest.fn(), exit: jest.fn() };
  const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const hook = jest.fn();
  const registration = registerSignals({ processObj, log, signals: [], shutdownHook: hook });
  await registration.shutdown();
  expect(hook).toHaveBeenCalledWith("manual");
  expect(processObj.exit).not.toHaveBeenCalled();
});

test("does not start shutdown after deactivation", async () => {
  const hook = jest.fn();
  const lifecycle = makeLifecycle([hook]);
  lifecycle.deactivate();
  await lifecycle.shutdown();
  expect(lifecycle.onBeforeExit(0)).toBeUndefined();
  expect(hook).not.toHaveBeenCalled();
});

test("runs hooks once on beforeExit", async () => {
  const hook = jest.fn();
  const lifecycle = makeLifecycle([hook]);
  const first = lifecycle.onBeforeExit(0);
  const second = lifecycle.onBeforeExit(0);
  await first;
  expect(second).toBe(first);
  expect(hook).toHaveBeenCalledTimes(1);
});

test("keeps the first shutdown promise when beforeExit overlaps", async () => {
  const processObj = { on: jest.fn(), off: jest.fn(), exit: jest.fn() };
  const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
  let finishHook;
  const hook = jest.fn(() => new Promise((resolve) => (finishHook = resolve)));
  const registration = registerSignals({ processObj, log, signals: [], shutdownHook: hook });
  const shutdown = registration.shutdown();
  const beforeExit = processObj.on.mock.calls.find(([event]) => event === "beforeExit")[1];
  const beforeExitShutdown = beforeExit(0);
  expect(beforeExitShutdown).toBe(shutdown);
  expect(hook).toHaveBeenCalledTimes(1);
  finishHook();
  await Promise.all([shutdown, beforeExitShutdown]);
});

test("keeps the event loop active until beforeExit hooks finish", async () => {
  let finishHook;
  const hook = () => new Promise((resolve) => (finishHook = resolve));
  const setTimer = jest.spyOn(globalThis, "setInterval").mockReturnValue(1);
  const clearTimer = jest.spyOn(globalThis, "clearInterval").mockImplementation(() => undefined);
  const lifecycle = makeLifecycle([hook]);
  try {
    const pending = lifecycle.onBeforeExit(0);
    expect(setTimer).toHaveBeenCalledWith(expect.any(Function), 2 ** 31 - 1);
    setTimer.mock.calls[0][0]();
    expect(clearTimer).not.toHaveBeenCalled();
    finishHook();
    await pending;
    expect(clearTimer).toHaveBeenCalledWith(1);
  } finally {
    setTimer.mockRestore();
    clearTimer.mockRestore();
  }
});

test("clears the event loop timer and runs later hooks when the logger fails", async () => {
  const calls = [];
  const setTimer = jest.spyOn(globalThis, "setInterval").mockReturnValue(1);
  const clearTimer = jest.spyOn(globalThis, "clearInterval").mockImplementation(() => undefined);
  const lifecycle = makeLifecycle(
    [
      () => {
        throw new Error("hook failed");
      },
      () => calls.push("next"),
    ],
    {
      log: makeLog(() => {
        throw new Error("logger failed");
      }),
    },
  );
  try {
    const pending = lifecycle.onBeforeExit(0);
    await pending;
    expect(calls).toEqual(["next"]);
    expect(clearTimer).toHaveBeenCalledWith(1);
  } finally {
    setTimer.mockRestore();
    clearTimer.mockRestore();
  }
});

test("exits after hooks when a signal arrives during beforeExit", async () => {
  const processObj = { on: jest.fn(), off: jest.fn(), exit: jest.fn() };
  const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
  let finishHook;
  const hook = jest.fn(() => new Promise((resolve) => (finishHook = resolve)));
  registerSignals({ processObj, log, signals: ["SIGTERM"], shutdownHook: hook });
  const beforeExit = processObj.on.mock.calls.find(([event]) => event === "beforeExit")[1];
  const onSignal = processObj.on.mock.calls.find(([event]) => event === "SIGTERM")[1];
  const pending = beforeExit(0);
  onSignal();
  expect(processObj.exit).not.toHaveBeenCalled();
  finishHook();
  await pending;
  expect(processObj.exit).toHaveBeenCalledWith(0);
});

test("exits when a signal arrives after beforeExit hooks finish", async () => {
  const processObj = { on: jest.fn(), off: jest.fn(), exit: jest.fn() };
  const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
  registerSignals({ processObj, log, signals: ["SIGTERM"] });
  const beforeExit = processObj.on.mock.calls.find(([event]) => event === "beforeExit")[1];
  const onSignal = processObj.on.mock.calls.find(([event]) => event === "SIGTERM")[1];
  await beforeExit(0);
  onSignal();
  expect(processObj.exit).toHaveBeenCalledWith(0);
});

test("allows a hook to await shutdown during beforeExit", async () => {
  const processObj = { on: jest.fn(), off: jest.fn(), exit: jest.fn() };
  const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
  let registration;
  const hook = jest.fn(async () => registration.shutdown());
  registration = registerSignals({ processObj, log, signals: [], shutdownHook: hook });
  const beforeExit = processObj.on.mock.calls.find(([event]) => event === "beforeExit")[1];
  await beforeExit(0);
  expect(hook).toHaveBeenCalledTimes(1);
  expect(registration.getShuttingDown()).toBe(true);
});

test("prevents concurrent public shutdown and uses its first exit code", async () => {
  const processObj = { on: jest.fn(), off: jest.fn(), exit: jest.fn() };
  const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const first = jest.fn(async () => {
    throw new Error("first");
  });
  const second = jest.fn(async () => undefined);
  const registration = registerSignals({
    processObj,
    log,
    signals: [],
    shutdownHook: first,
    exitCode: 7,
  });
  registerSignals({ processObj, log, signals: [], shutdownHook: second });
  const one = registration.shutdown("SIGTERM");
  const two = registration.shutdown("SIGINT");
  await Promise.all([one, two]);
  expect(second).toHaveBeenCalledWith("SIGTERM");
  expect(processObj.exit).toHaveBeenCalledWith(7);
  expect(log.warn).toHaveBeenCalledWith("Received SIGINT again, but already shutting down.");
});

test("does not rerun public hooks after beforeExit", async () => {
  const processObj = { on: jest.fn(), off: jest.fn(), exit: jest.fn() };
  const log = makeLog();
  const hook = jest.fn();
  const registration = registerSignals({ processObj, log, signals: [], shutdownHook: hook });
  const beforeExit = processObj.on.mock.calls.find(([event]) => event === "beforeExit")[1];
  await beforeExit(0);
  await registration.shutdown("manual");
  await beforeExit(0);
  expect(hook).toHaveBeenCalledTimes(1);
});
