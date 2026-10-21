export const createAbortCleanup = ({ signal, onAbort }) => {
  let abortHandler;

  const attach = () => {
    if (!signal) return;
    if (signal.aborted) onAbort();
    else {
      abortHandler = onAbort;
      signal.addEventListener("abort", abortHandler, { once: true });
    }
  };
  const remove = () => {
    if (signal && abortHandler && typeof signal.removeEventListener === "function") {
      signal.removeEventListener("abort", abortHandler);
    }
  };

  return { attach, remove };
};
