import { AsyncLocalStorage } from "node:async_hooks";

export const createHookRunner = ({ hooks, onError }) => {
  const hookContext = new AsyncLocalStorage();

  const run = async (receivedSignal) => {
    for (const hook of hooks) {
      try {
        await hookContext.run(true, () => hook(receivedSignal));
      } catch (error) {
        onError(error);
      }
    }
  };

  return { run, isRunning: () => Boolean(hookContext.getStore()) };
};
