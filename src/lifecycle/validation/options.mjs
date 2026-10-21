export const validateOptions = ({ processObj, shutdownHook, signal }) => {
  if (!processObj || typeof processObj.on !== "function") {
    throw new TypeError("processObj.on must be a function");
  }
  if (shutdownHook !== undefined && typeof shutdownHook !== "function") {
    throw new TypeError("shutdownHook must be a function");
  }
  if (signal !== undefined && (!signal || typeof signal.addEventListener !== "function")) {
    throw new TypeError("signal must provide addEventListener");
  }
};
