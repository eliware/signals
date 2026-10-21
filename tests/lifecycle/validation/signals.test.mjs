import { expect, test } from "@jest/globals";
import { normalizeSignals } from "../../../src/lifecycle/validation/signals.mjs";

test("clones default signals and removes duplicate names", () => {
  const defaults = ["SIGTERM"];
  const normalized = normalizeSignals(undefined, defaults);
  expect(normalized).toEqual(defaults);
  expect(normalized).not.toBe(defaults);
  expect(normalizeSignals(["SIGTERM", "SIGTERM"], [])).toEqual(["SIGTERM"]);
});

test("rejects values that are not signal name arrays", () => {
  expect(() => normalizeSignals("SIGTERM", [])).toThrow(TypeError);
  expect(() => normalizeSignals(["SIGTERM", 1], [])).toThrow(TypeError);
});
