export const normalizeSignals = (signals, defaultSignals) => {
  if (signals === undefined) return [...defaultSignals];
  if (!Array.isArray(signals) || signals.some((signal) => typeof signal !== "string")) {
    throw new TypeError("signals must be an array of signal names");
  }
  return [...new Set(signals)];
};
