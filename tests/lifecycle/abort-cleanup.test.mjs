import { expect, test, jest } from "@jest/globals";
import { createAbortCleanup } from "../../src/lifecycle/abort-cleanup.mjs";
import registerSignals from "../../src/index.mjs";

test("attaches and removes an abort listener", () => {
  const signal = { aborted: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };
  const onAbort = jest.fn();
  const cleanup = createAbortCleanup({ signal, onAbort });
  cleanup.attach();
  cleanup.remove();
  expect(signal.addEventListener).toHaveBeenCalledWith("abort", onAbort, { once: true });
  expect(signal.removeEventListener).toHaveBeenCalledWith("abort", onAbort);
});

test("runs cleanup immediately for an already aborted signal", () => {
  const onAbort = jest.fn();
  const cleanup = createAbortCleanup({ signal: { aborted: true }, onAbort });
  cleanup.attach();
  expect(onAbort).toHaveBeenCalledTimes(1);
  cleanup.remove();
});

test("does nothing when no signal is set", () => {
  const onAbort = jest.fn();
  const cleanup = createAbortCleanup({ onAbort });
  expect(() => cleanup.attach()).not.toThrow();
  expect(() => cleanup.remove()).not.toThrow();
  expect(onAbort).not.toHaveBeenCalled();
});

test("supports signals without a listener removal method", () => {
  const signal = { aborted: false, addEventListener: jest.fn() };
  const cleanup = createAbortCleanup({ signal, onAbort: jest.fn() });
  cleanup.attach();
  expect(() => cleanup.remove()).not.toThrow();
});

test("supports abort cleanup through the public API", () => {
  const processObj = { on: jest.fn(), off: jest.fn(), exit: jest.fn() };
  const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const controller = new AbortController();
  const registration = registerSignals({ processObj, log, signals: [], signal: controller.signal });
  controller.abort();
  expect(registration.removed).toBe(true);
});
