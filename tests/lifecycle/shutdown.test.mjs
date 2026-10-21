import { expect, test, jest } from "@jest/globals";
import { createShutdown } from "../../src/lifecycle/shutdown.mjs";
import registerSignals from "../../src/index.mjs";
const makeLog = (error = jest.fn(), overrides = {}) => ({
  debug: jest.fn(),
  warn: jest.fn(),
  error,
  ...overrides,
});
const makeLifecycle = (hooks, options = {}) =>
  createShutdown({ hooks, log: makeLog(), processObj: {}, exit: false, exitCode: 0, ...options });
const makeProcess = () =>
  Object.fromEntries(["on", "off", "exit"].map((name) => [name, jest.fn()]));
const makeContext = () => ({ processObj: makeProcess(), log: makeLog() });
const failLog = () => {
  throw Error("logger failed");
};
const makeRegistration = (signals, shutdownHook, options = {}) => {
  const context = makeContext();
  return {
    ...context,
    registration: registerSignals({ ...context, signals, shutdownHook, ...options }),
  };
};
test.each(["shutdown", "beforeExit"])(
  "runs %s hooks when the debug logger fails",
  async (method) => {
    const hook = jest.fn();
    const lifecycle = makeLifecycle([hook], {
      log: makeLog(jest.fn(), { debug: failLog }),
    });
    await (method === "shutdown" ? lifecycle.shutdown() : lifecycle.onBeforeExit(0));
    expect(hook).toHaveBeenCalledWith(method === "shutdown" ? "manual" : "beforeExit");
  },
);
test("logs no cleanup error details and continues with later hooks", async () => {
  const privateValue = "private-token-value";
  const error = new Error(`cleanup failed: ${privateValue}`);
  error.privateField = privateValue;
  const log = makeLog();
  const laterHook = jest.fn();
  const lifecycle = makeLifecycle(
    [
      () => {
        throw error;
      },
      laterHook,
    ],
    { log },
  );

  await lifecycle.shutdown();

  expect(log.error).toHaveBeenCalledWith("A shutdown cleanup function failed.");
  expect(JSON.stringify(log.error.mock.calls)).not.toContain(privateValue);
  expect(JSON.stringify(log.error.mock.calls)).not.toContain(error.message);
  expect(JSON.stringify(log.error.mock.calls)).not.toContain(error.stack);
  expect(laterHook).toHaveBeenCalledWith("manual");
});
test("does not exit after manual shutdown", async () => {
  const hook = jest.fn();
  const { processObj, registration } = makeRegistration([], hook);
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
  let finishHook;
  const hook = jest.fn(() => new Promise((resolve) => (finishHook = resolve)));
  const { processObj, registration } = makeRegistration([], hook);
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
  let finishHook;
  const hook = jest.fn(() => new Promise((resolve) => (finishHook = resolve)));
  const { processObj } = makeRegistration(["SIGTERM"], hook);
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
  const { processObj } = makeRegistration(["SIGTERM"]);
  const beforeExit = processObj.on.mock.calls.find(([event]) => event === "beforeExit")[1];
  const onSignal = processObj.on.mock.calls.find(([event]) => event === "SIGTERM")[1];
  await beforeExit(0);
  onSignal();
  expect(processObj.exit).toHaveBeenCalledWith(0);
});
test("prevents concurrent public shutdown and uses its first label", async () => {
  const { processObj, log } = makeContext();
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
  expect(processObj.exit).not.toHaveBeenCalled();
  expect(log.warn).toHaveBeenCalledWith("Received SIGINT during shutdown.");
});
test("does not rerun public hooks after beforeExit", async () => {
  const hook = jest.fn();
  const { processObj, registration } = makeRegistration([], hook);
  const beforeExit = processObj.on.mock.calls.find(([event]) => event === "beforeExit")[1];
  await beforeExit(0);
  await registration.shutdown("manual");
  await beforeExit(0);
  expect(hook).toHaveBeenCalledTimes(1);
});
