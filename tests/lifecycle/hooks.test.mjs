import { expect, test, jest } from "@jest/globals";
import { createHookRunner } from "../../src/lifecycle/hooks.mjs";
import registerSignals from "../../src/index.mjs";

test("runs hooks in order and continues after failures", async () => {
  const calls = [];
  const errors = [];
  const runner = createHookRunner({
    hooks: [
      async () => {
        calls.push("one");
        throw Error("hook failed");
      },
      async () => calls.push("two"),
    ],
    onError: (error) => errors.push(error),
  });
  await runner.run("SIGTERM");
  expect(calls).toEqual(["one", "two"]);
  expect(errors).toHaveLength(1);
  expect(errors[0].message).toBe("hook failed");
  expect(runner.isRunning()).toBe(false);
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
