export const validateLifecycleOptions = ({ exit, exitCode }) => {
  if (typeof exit !== "boolean") throw new TypeError("exit must be a boolean");
  if (!Number.isInteger(exitCode) || !Number.isFinite(exitCode)) {
    throw new TypeError("exitCode must be a finite integer");
  }
};
