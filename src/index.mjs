import logger from "@eliware/log";
import { defaultSignals } from "./lifecycle/defaults.mjs";
import { validateLogger } from "./lifecycle/validation/logger.mjs";
import { normalizeSignals } from "./lifecycle/validation/signals.mjs";
import { validateOptions } from "./lifecycle/validation/options.mjs";
import { validateLifecycleOptions } from "./lifecycle/validation/lifecycle-options.mjs";
import { getRegistration, setRegistration } from "./lifecycle/registration.mjs";
import { applyRegistrationPolicy } from "./lifecycle/registration-policy.mjs";
import { createShutdown } from "./lifecycle/shutdown.mjs";
import { installHandlers } from "./lifecycle/handlers.mjs";
import { createCleanup } from "./lifecycle/cleanup.mjs";
import { createAbortRegistration } from "./lifecycle/abort/registration.mjs";

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
    ...handlers,
    deactivate: () => {
      handlers.deactivate();
      lifecycle.deactivate();
    },
  });
  const abortRegistration = createAbortRegistration({
    signal,
    removeHandlers: cleanup.removeHandlers,
  });
  const api = {
    shutdown: lifecycle.shutdown,
    getShuttingDown: lifecycle.getShuttingDown,
    removeHandlers: abortRegistration.removeHandlers,
    get removed() {
      return cleanup.getRemoved();
    },
  };
  registration = { hooks, api, log, exitCode, exit, signal, signals: selected };
  setRegistration(processObj, registration);
  abortRegistration.attach();
  log.debug("Registered Handlers", { signals: selected.join(", ") });
  return registration.api;
};

export default registerSignals;
