export const validateLogger = (log) => {
  for (const method of ["debug", "warn", "error"]) {
    if (typeof log?.[method] !== "function") {
      throw new TypeError(`Logger method ${method} must be a function`);
    }
  }
};
