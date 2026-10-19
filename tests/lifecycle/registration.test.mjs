import { expect, test } from "@jest/globals";
import {
  getRegistration,
  setRegistration,
  deleteRegistration,
} from "../../src/lifecycle/registration.mjs";
import registerSignals from "../../src/index.mjs";

test("stores registrations by process-like object", () => {
  const processObj = {};
  const registration = {};
  setRegistration(processObj, registration);
  expect(getRegistration(processObj)).toBe(registration);
  expect(deleteRegistration(processObj)).toBe(true);
  expect(getRegistration(processObj)).toBeUndefined();
});

test("rejects a shutdown hook after shutdown starts", async () => {
  const processObj = { on() {}, off() {}, exit() {} };
  const log = { debug() {}, warn() {}, error() {} };
  const registration = registerSignals({ processObj, log, signals: [] });
  await registration.shutdown();
  expect(() => registerSignals({ processObj, log, signals: [], shutdownHook() {} })).toThrow(
    "Cannot add a cleanup function after shutdown starts",
  );
});
