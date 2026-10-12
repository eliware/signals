export const installHandlers = ({ processObj, signals, shutdown, onBeforeExit }) => {
  let active = true;
  const listeners = new Map();
  for (const name of signals) {
    const listener = () => {
      if (!active) return;
      return shutdown(name);
    };
    listeners.set(name, listener);
    processObj.on(name, listener);
  }
  const beforeExitListener = (code) => {
    if (!active) return;
    return onBeforeExit(code);
  };
  processObj.on("beforeExit", beforeExitListener);
  return {
    listeners,
    onBeforeExit: beforeExitListener,
    deactivate: () => {
      active = false;
    },
  };
};
