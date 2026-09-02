export const validateLogger = (log) => {
    for (const method of ['debug', 'warn', 'error']) {
        if (typeof log?.[method] !== 'function') {
            throw new TypeError(`log.${method} must be a function`);
        }
    }
};

export const normalizeSignals = (signals, defaultSignals) => {
    if (signals === undefined) return [...defaultSignals];
    if (!Array.isArray(signals) || signals.some(signal => typeof signal !== 'string')) {
        throw new TypeError('signals must be an array of signal names');
    }
    return [...new Set(signals)];
};

export const validateOptions = ({ processObj, shutdownHook, signal }) => {
    if (!processObj || typeof processObj.on !== 'function') {
        throw new TypeError('processObj.on must be a function');
    }
    if (shutdownHook !== undefined && typeof shutdownHook !== 'function') {
        throw new TypeError('shutdownHook must be a function');
    }
    if (signal !== undefined && (!signal || typeof signal.addEventListener !== 'function')) {
        throw new TypeError('signal must provide addEventListener');
    }
};

export const validateLifecycleOptions = ({ exit, exitCode }) => {
    if (typeof exit !== 'boolean') throw new TypeError('exit must be a boolean');
    if (!Number.isInteger(exitCode) || !Number.isFinite(exitCode)) {
        throw new TypeError('exitCode must be a finite integer');
    }
};
