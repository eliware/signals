import { expect, test, jest } from "@jest/globals";
import { validateLogger } from "../../../src/lifecycle/validation/logger.mjs";

test("accepts a logger with all required methods", () => {
  expect(() =>
    validateLogger({ debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
  ).not.toThrow();
});

test.each(["debug", "warn", "error"])("requires the %s logger method", (method) => {
  const log = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
  delete log[method];
  expect(() => validateLogger(log)).toThrow(`Logger method ${method} must be a function`);
});
