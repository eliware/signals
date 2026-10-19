import { expect, jest, test } from "@jest/globals";
import { withEventLoopKeepAlive } from "../../src/lifecycle/before-exit.mjs";

test("keeps the event loop active until the operation completes", async () => {
  let finishOperation;
  const setTimer = jest.spyOn(globalThis, "setInterval").mockReturnValue(1);
  const clearTimer = jest.spyOn(globalThis, "clearInterval").mockImplementation(() => undefined);
  try {
    const operation = withEventLoopKeepAlive(
      () => new Promise((resolve) => (finishOperation = resolve)),
    );
    expect(setTimer).toHaveBeenCalledWith(expect.any(Function), 2 ** 31 - 1);
    expect(clearTimer).not.toHaveBeenCalled();
    finishOperation();
    await operation;
    expect(clearTimer).toHaveBeenCalledWith(1);
  } finally {
    setTimer.mockRestore();
    clearTimer.mockRestore();
  }
});

test("clears the keep-alive timer when the operation fails", async () => {
  const setTimer = jest.spyOn(globalThis, "setInterval").mockReturnValue(1);
  const clearTimer = jest.spyOn(globalThis, "clearInterval").mockImplementation(() => undefined);
  try {
    await expect(withEventLoopKeepAlive(() => Promise.reject(new Error("failed")))).rejects.toThrow(
      "failed",
    );
    expect(clearTimer).toHaveBeenCalledWith(1);
  } finally {
    setTimer.mockRestore();
    clearTimer.mockRestore();
  }
});
