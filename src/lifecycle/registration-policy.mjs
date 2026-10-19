export const applyRegistrationPolicy = ({
  options,
  registration,
  log,
  signals,
  exitCode,
  exit,
  signal,
  shutdownHook,
}) => {
  const conflicts =
    (Object.hasOwn(options, "log") && registration.log !== log) ||
    (Object.hasOwn(options, "signals") &&
      (registration.signals.length !== signals.length ||
        !registration.signals.every((name, index) => name === signals[index]))) ||
    (Object.hasOwn(options, "exitCode") && registration.exitCode !== exitCode) ||
    (Object.hasOwn(options, "exit") && registration.exit !== exit) ||
    (Object.hasOwn(options, "signal") && registration.signal !== signal);
  if (conflicts) throw new TypeError("Repeated registration must use the same lifecycle options");
  if (shutdownHook) {
    if (registration.api.getShuttingDown()) {
      throw new TypeError("Cannot add a cleanup function after shutdown starts");
    }
    registration.hooks.push(shutdownHook);
  }
  return registration.api;
};
