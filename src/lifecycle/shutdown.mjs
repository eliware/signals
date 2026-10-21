import { withEventLoopKeepAlive } from "./before-exit.mjs";
import { createHookRunner } from "./hooks.mjs";
import { createExitPolicy } from "./exit-policy.mjs";

export const createShutdown = ({ hooks, log, processObj, exit, exitCode }) => {
  let shuttingDown = false;
  let active = true;
  let shutdownPromise;
  let hooksFinished = false;
  const exitPolicy = createExitPolicy({ processObj, exit, exitCode });
  const logSafely = (method, ...args) => {
    try {
      log[method](...args);
    } catch {
      // Keep cleanup active when the logger fails.
    }
  };

  const hookRunner = createHookRunner({
    hooks,
    onError: () => logSafely("error", "A shutdown cleanup function failed."),
  });
  const runHooks = hookRunner.run;
  const shutdown = (receivedSignal = "manual") => {
    if (!active) return Promise.resolve();
    if (shutdownPromise) {
      if (hookRunner.isRunning()) return Promise.resolve();
      logSafely("warn", `Received ${receivedSignal} during shutdown.`);
      if (hooksFinished) exitPolicy.afterHooks();
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
        exitPolicy.afterHooks();
      })
      .then(resolveShutdown, rejectShutdown);
    return shutdownPromise;
  };
  const shutdownForSignal = (receivedSignal) => {
    exitPolicy.request();
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
        exitPolicy.afterHooks();
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
