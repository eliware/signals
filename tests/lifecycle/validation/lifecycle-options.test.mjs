import { expect, test } from "@jest/globals";
import { validateLifecycleOptions } from "../../../src/lifecycle/validation/lifecycle-options.mjs";

test("accepts valid exit options", () => {
  expect(() => validateLifecycleOptions({ exit: true, exitCode: 0 })).not.toThrow();
});

test("requires a boolean exit option", () => {
  expect(() => validateLifecycleOptions({ exit: "true", exitCode: 0 })).toThrow(
    "exit must be a boolean",
  );
});

test.each([1.5, Infinity, NaN])("requires a finite integer exit code", (exitCode) => {
  expect(() => validateLifecycleOptions({ exit: true, exitCode })).toThrow(
    "exitCode must be a finite integer",
  );
});
