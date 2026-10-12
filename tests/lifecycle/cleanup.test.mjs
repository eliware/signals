import { expect, test, jest } from "@jest/globals";
import { createCleanup } from "../../src/lifecycle/cleanup.mjs";
import registerSignals from "../../src/index.mjs";

test("cleans up listeners and abort handling idempotently", () => {
  const processObj = { off: jest.fn() };
  const signal = { aborted: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };
  const deactivate = jest.fn();
  const cleanup = createCleanup({
    processObj,
    signal,
    listeners: new Map([["SIGTERM", jest.fn()]]),
    onBeforeExit: jest.fn(),
    deactivate,
  });
  cleanup.attachAbortHandler();
  cleanup.removeHandlers();
  cleanup.removeHandlers();
  expect(cleanup.getRemoved()).toBe(true);
  expect(deactivate).toHaveBeenCalledTimes(1);
  expect(processObj.off).toHaveBeenCalledTimes(2);
});

const makeProcess = () => ({ on: jest.fn(), off: jest.fn(), exit: jest.fn() });
const makeLog = () => ({ debug: jest.fn(), warn: jest.fn(), error: jest.fn() });

test("supports cleanup, abort, and shutdown without process exit", async () => {
  const processObj = makeProcess();
  const log = makeLog();
  const registration = registerSignals({ processObj, log, signals: ["USR1"], exit: false });
  await registration.shutdown();
  expect(processObj.exit).not.toHaveBeenCalled();
  registration.removeHandlers();
  registration.removeHandlers();
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalled();

  const controller = new AbortController();
  const aborted = registerSignals({
    processObj: makeProcess(),
    log,
    signals: [],
    signal: controller.signal,
  });
  controller.abort();
  expect(aborted.removed).toBe(true);

  const already = new AbortController();
  already.abort();
  expect(
    registerSignals({ processObj: makeProcess(), log, signals: [], signal: already.signal })
      .removed,
  ).toBe(true);
});

test("removes registrations only for the current API", () => {
  const processObj = makeProcess();
  const first = registerSignals({ processObj, log: makeLog(), signals: [] });
  first.removeHandlers();
  const second = registerSignals({ processObj, log: makeLog(), signals: [] });
  expect(() => first.removeHandlers()).not.toThrow();
  expect(second.removed).toBe(false);
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
