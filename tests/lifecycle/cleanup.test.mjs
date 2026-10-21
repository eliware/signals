import { expect, test, jest } from "@jest/globals";
import registerSignals from "../../src/index.mjs";

test("cleans up process listeners idempotently", () => {
  const processObj = { on: jest.fn(), off: jest.fn(), exit: jest.fn() };
  const registration = registerSignals({ processObj, log: makeLog(), signals: ["SIGTERM"] });
  registration.removeHandlers();
  registration.removeHandlers();
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalledTimes(2);
});

const makeProcess = () => ({ on: jest.fn(), off: jest.fn(), exit: jest.fn() });
const makeLog = () => ({ debug: jest.fn(), warn: jest.fn(), error: jest.fn() });

test("supports cleanup and shutdown without process exit", async () => {
  const processObj = makeProcess();
  const log = makeLog();
  const registration = registerSignals({ processObj, log, signals: ["USR1"], exit: false });
  await registration.shutdown();
  expect(processObj.exit).not.toHaveBeenCalled();
  registration.removeHandlers();
  registration.removeHandlers();
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalled();
});

test("removes registrations only for the current API", () => {
  const processObj = makeProcess();
  const first = registerSignals({ processObj, log: makeLog(), signals: [] });
  first.removeHandlers();
  const second = registerSignals({ processObj, log: makeLog(), signals: [] });
  expect(() => first.removeHandlers()).not.toThrow();
  expect(second.removed).toBe(false);
});

test("does not run hooks through a removed API", async () => {
  const processObj = makeProcess();
  const hook = jest.fn();
  const registration = registerSignals({
    processObj,
    log: makeLog(),
    signals: [],
    shutdownHook: hook,
  });
  registration.removeHandlers();
  await registration.shutdown();
  expect(hook).not.toHaveBeenCalled();
});

test("allows re-registration after cleanup without off", () => {
  const processObj = { on: jest.fn() };
  const first = registerSignals({ processObj, log: makeLog(), signals: [] });
  expect(() => first.removeHandlers()).not.toThrow();
  const second = registerSignals({ processObj, log: makeLog(), signals: [] });
  expect(second).not.toBe(first);
});

test("supports process objects without exit or off", async () => {
  const processObj = { on: jest.fn() };
  const registration = registerSignals({ processObj, log: makeLog(), signals: [] });
  await registration.shutdown("SIGTERM");
  registration.removeHandlers();
  expect(registration.removed).toBe(true);
});
