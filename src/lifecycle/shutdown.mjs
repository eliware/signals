import { AsyncLocalStorage } from "node:async_hooks";
import { withEventLoopKeepAlive } from "./before-exit.mjs";

export const createShutdown = ({ hooks, log, processObj, exit, exitCode }) => {
  let shuttingDown = false;
  let active = true;
  let shutdownPromise;
  let hooksFinished = false;
  let exitRequested = false;
  let exitCalled = false;
  const hookContext = new AsyncLocalStorage();

  const exitProcess = () => {
    if (!exitRequested || !exit || typeof processObj.exit !== "function" || exitCalled) return;
    exitCalled = true;
    processObj.exit(exitCode);
  };
  const logSafely = (method, ...args) => {
    try {
      log[method](...args);
    } catch {
      // Keep cleanup active when the logger fails.
    }
  };

  const runHooks = async (receivedSignal) => {
    for (const hook of hooks) {
      try {
        await hookContext.run(true, () => hook(receivedSignal));
      } catch (err) {
        logSafely("error", "Error in shutdown cleanup function:", err);
      }
    }
  };
  const shutdown = (receivedSignal = "manual") => {
    if (!active) return Promise.resolve();
    if (shutdownPromise) {
      if (hookContext.getStore()) return Promise.resolve();
      logSafely("warn", `Received ${receivedSignal} during shutdown.`);
      if (hooksFinished) exitProcess();
      return shutdownPromise;
    }
    shuttingDown = true;
    logSafely("debug", `Received ${receivedSignal}. Shutting down gracefully...`);
    let resolveShutdown;
    let rejectShutdown;
    shutdownPromise = new Promise((resolve, reject) => {
      resolveShutdown = resolve;
      rejectShutdown = reject;
    });
    runHooks(receivedSignal)
      .then(() => {
        hooksFinished = true;
        exitProcess();
      })
      .then(resolveShutdown, rejectShutdown);
    return shutdownPromise;
  };
  const shutdownForSignal = (receivedSignal) => {
    exitRequested = true;
    return shutdown(receivedSignal);
  };
  const onBeforeExit = (code) => {
    if (!active) return undefined;
    if (shuttingDown) return shutdownPromise;
    shuttingDown = true;
    logSafely("debug", `Process exiting (code ${code}). Running shutdown hooks...`);
    let resolveShutdown;
    let rejectShutdown;
    shutdownPromise = new Promise((resolve, reject) => {
      resolveShutdown = resolve;
      rejectShutdown = reject;
    });
    withEventLoopKeepAlive(() => runHooks("beforeExit"))
      .then(() => {
        hooksFinished = true;
        exitProcess();
      })
      .then(resolveShutdown, rejectShutdown);
    return shutdownPromise;
  };

  return {
    shutdown,
    shutdownForSignal,
    onBeforeExit,
    deactivate: () => {
      active = false;
    },
    getShuttingDown: () => shuttingDown,
  };
};
