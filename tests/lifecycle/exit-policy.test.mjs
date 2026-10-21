import { expect, test, jest } from "@jest/globals";
import { createExitPolicy } from "../../src/lifecycle/exit-policy.mjs";

test("does not exit when no request was made", () => {
  const processObj = { exit: jest.fn() };
  const policy = createExitPolicy({ processObj, exit: true, exitCode: 7 });
  policy.afterHooks();
  expect(processObj.exit).not.toHaveBeenCalled();
});

test("does not exit when exit is disabled", () => {
  const processObj = { exit: jest.fn() };
  const policy = createExitPolicy({ processObj, exit: false, exitCode: 7 });
  policy.request();
  policy.afterHooks();
  expect(processObj.exit).not.toHaveBeenCalled();
});

test("supports process objects without an exit method", () => {
  const policy = createExitPolicy({ processObj: {}, exit: true, exitCode: 7 });
  policy.request();
  expect(() => policy.afterHooks()).not.toThrow();
});

test("exits once with the configured code after a request", () => {
  const processObj = { exit: jest.fn() };
  const policy = createExitPolicy({ processObj, exit: true, exitCode: 7 });
  policy.request();
  policy.afterHooks();
  policy.afterHooks();
  expect(processObj.exit).toHaveBeenCalledTimes(1);
  expect(processObj.exit).toHaveBeenCalledWith(7);
});
