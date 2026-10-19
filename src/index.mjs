import logger from "@eliware/log";
import { defaultSignals } from "./lifecycle/defaults.mjs";
import {
  validateLogger,
  normalizeSignals,
  validateOptions,
  validateLifecycleOptions,
} from "./lifecycle/validation.mjs";
import { getRegistration, setRegistration } from "./lifecycle/registration.mjs";
import { applyRegistrationPolicy } from "./lifecycle/registration-policy.mjs";
import { createShutdown } from "./lifecycle/shutdown.mjs";
import { installHandlers } from "./lifecycle/handlers.mjs";
import { createCleanup } from "./lifecycle/cleanup.mjs";

export const registerSignals = (options = {}) => {
  if (options === null || typeof options !== "object") {
    throw new TypeError("options must be an object");
  }
  const {
    processObj = process,
    log = logger,
    signals,
    shutdownHook,
    exitCode = 0,
    exit = true,
    signal,
  } = options;
  validateOptions({ processObj, shutdownHook, signal });
  validateLifecycleOptions({ exit, exitCode });
  validateLogger(log);
  const selected = normalizeSignals(signals, defaultSignals);
  let registration = getRegistration(processObj);
  if (registration) {
    return applyRegistrationPolicy({
      options,
      registration,
      log,
      signals: selected,
      exitCode,
      exit,
      signal,
      shutdownHook,
    });
  }

  const hooks = shutdownHook ? [shutdownHook] : [];
  const lifecycle = createShutdown({ hooks, log, processObj, exit, exitCode });
  const handlers = installHandlers({
    processObj,
    signals: selected,
    shutdown: lifecycle.shutdownForSignal,
    onBeforeExit: lifecycle.onBeforeExit,
  });
  const cleanup = createCleanup({
    processObj,
    signal,
    ...handlers,
    deactivate: () => {
      handlers.deactivate();
      lifecycle.deactivate();
    },
  });
  const api = {
    shutdown: lifecycle.shutdown,
    getShuttingDown: lifecycle.getShuttingDown,
    removeHandlers: cleanup.removeHandlers,
    get removed() {
      return cleanup.getRemoved();
    },
  };
  registration = { hooks, api, log, exitCode, exit, signal, signals: selected };
  setRegistration(processObj, registration);
  cleanup.attachAbortHandler();
  log.debug("Registered Handlers", { signals: selected.join(", ") });
  return registration.api;
};

export default registerSignals;
