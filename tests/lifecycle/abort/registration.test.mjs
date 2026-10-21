import { expect, test, jest } from "@jest/globals";
import { createAbortRegistration } from "../../../src/lifecycle/abort/registration.mjs";
import registerSignals from "../../../src/index.mjs";

test("attaches abort cleanup and removes process handlers", () => {
  const listener = jest.fn();
  const signal = {
    aborted: false,
    addEventListener: jest.fn((_type, callback) => listener.mockImplementation(callback)),
    removeEventListener: jest.fn(),
  };
  const removeHandlers = jest.fn();
  const registration = createAbortRegistration({ signal, removeHandlers });
  registration.attach();
  registration.removeHandlers();
  expect(signal.addEventListener).toHaveBeenCalledWith("abort", expect.any(Function), {
    once: true,
  });
  expect(signal.removeEventListener).toHaveBeenCalledWith("abort", expect.any(Function));
  expect(removeHandlers).toHaveBeenCalledTimes(1);
});

test("removes public registrations when the signal aborts", () => {
  const processObj = { on: jest.fn(), off: jest.fn(), exit: jest.fn() };
  const controller = new AbortController();
  const registration = registerSignals({
    processObj,
    signals: ["SIGTERM"],
    signal: controller.signal,
  });
  controller.abort();
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalledTimes(2);
});

test("removes public registrations for an already aborted signal", () => {
  const processObj = { on: jest.fn(), off: jest.fn(), exit: jest.fn() };
  const controller = new AbortController();
  controller.abort();
  const registration = registerSignals({
    processObj,
    signals: ["SIGTERM"],
    signal: controller.signal,
  });
  expect(registration.removed).toBe(true);
  expect(processObj.off).toHaveBeenCalledTimes(2);
});
