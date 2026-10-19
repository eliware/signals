import { expect, jest, test } from "@jest/globals";
import { applyRegistrationPolicy } from "../../src/lifecycle/registration-policy.mjs";

const makeRegistration = () => ({
  log: {},
  signals: ["SIGTERM"],
  exitCode: 0,
  exit: true,
  signal: undefined,
  hooks: [],
  api: { getShuttingDown: jest.fn(() => false) },
});

test.each([
  ["log", {}],
  ["signals", ["SIGINT"]],
  ["exitCode", 1],
  ["exit", false],
  ["signal", "abort"],
])("rejects an explicit conflicting %s option", (key, value) => {
  const registration = makeRegistration();
  expect(() =>
    applyRegistrationPolicy({
      options: { [key]: value },
      registration,
      log: key === "log" ? value : registration.log,
      signals: key === "signals" ? value : registration.signals,
      exitCode: key === "exitCode" ? value : registration.exitCode,
      exit: key === "exit" ? value : registration.exit,
      signal: key === "signal" ? value : registration.signal,
    }),
  ).toThrow("Repeated registration must use the same lifecycle options");
});

test("adds a hook and returns the existing API when options match", () => {
  const registration = makeRegistration();
  const hook = jest.fn();
  const api = applyRegistrationPolicy({
    options: {},
    registration,
    log: registration.log,
    signals: registration.signals,
    exitCode: registration.exitCode,
    exit: registration.exit,
    signal: registration.signal,
    shutdownHook: hook,
  });
  expect(registration.hooks).toEqual([hook]);
  expect(api).toBe(registration.api);
});

test("rejects a hook after shutdown starts", () => {
  const registration = makeRegistration();
  registration.api.getShuttingDown.mockReturnValue(true);
  expect(() =>
    applyRegistrationPolicy({
      options: {},
      registration,
      log: registration.log,
      signals: registration.signals,
      exitCode: registration.exitCode,
      exit: registration.exit,
      signal: registration.signal,
      shutdownHook() {},
    }),
  ).toThrow("Cannot add a cleanup function after shutdown starts");
});
