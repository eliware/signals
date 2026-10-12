import { AsyncLocalStorage } from "node:async_hooks";

export const createShutdown = ({ hooks, log, processObj, exit, exitCode }) => {
  let shuttingDown = false;
  let active = true;
  let shutdownPromise;
  const hookContext = new AsyncLocalStorage();

  const runHooks = async (receivedSignal) => {
    for (const hook of hooks) {
      try {
        await hookContext.run(true, () => hook(receivedSignal));
      } catch (err) {
        log.error("Error during shutdown hook:", err);
      }
    }
  };
  const shutdown = (receivedSignal = "manual") => {
    if (!active) return Promise.resolve();
    if (shutdownPromise) {
      if (hookContext.getStore()) return Promise.resolve();
      log.warn(`Received ${receivedSignal} again, but already shutting down.`);
      return shutdownPromise;
    }
    shuttingDown = true;
    log.debug(`Received ${receivedSignal}. Shutting down gracefully...`);
    let resolveShutdown;
    let rejectShutdown;
    shutdownPromise = new Promise((resolve, reject) => {
      resolveShutdown = resolve;
      rejectShutdown = reject;
    });
    runHooks(receivedSignal)
      .then(() => {
        if (receivedSignal !== "manual" && exit && typeof processObj.exit === "function") {
          processObj.exit(exitCode);
        }
      })
      .then(resolveShutdown, rejectShutdown);
    return shutdownPromise;
  };
  const onBeforeExit = (code) => {
    if (!active) return undefined;
    if (shuttingDown) return shutdownPromise;
    shuttingDown = true;
    log.debug(`Process exiting (code ${code}). Running shutdown hooks...`);
    let resolveShutdown;
    let rejectShutdown;
    shutdownPromise = new Promise((resolve, reject) => {
      resolveShutdown = resolve;
      rejectShutdown = reject;
    });
    const keepAlive = setInterval(() => {}, 2 ** 31 - 1);
    runHooks("beforeExit")
      .finally(() => clearInterval(keepAlive))
      .then(resolveShutdown, rejectShutdown);
    return shutdownPromise;
  };

  return {
    shutdown,
    onBeforeExit,
    deactivate: () => {
      active = false;
    },
    getShuttingDown: () => shuttingDown,
  };
};
