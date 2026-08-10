import logger from '@eliware/log';

const defaultSignals = ['SIGTERM', 'SIGINT', 'SIGHUP'];
const registrations = new WeakMap();

const validateLogger = (log) => {
    for (const method of ['debug', 'warn', 'error']) {
        if (typeof log?.[method] !== 'function') {
            throw new TypeError(`log.${method} must be a function`);
        }
    }
};

const normalizeSignals = (signals) => {
    if (signals === undefined) return defaultSignals;
    if (!Array.isArray(signals) || signals.some(signal => typeof signal !== 'string')) {
        throw new TypeError('signals must be an array of signal names');
    }
    return [...new Set(signals)];
};

export const registerSignals = (options = {}) => {
    const {
        processObj = process,
        log = logger,
        signals,
        shutdownHook,
        exitCode = 0,
        exit = true,
        signal
    } = options;
    validateLogger(log);
    const selected = normalizeSignals(signals);
    let registration = registrations.get(processObj);
    if (registration) {
        const conflicts = (Object.hasOwn(options, 'log') && registration.log !== log) ||
            (Object.hasOwn(options, 'signals') && (registration.signals.length !== selected.length ||
                !registration.signals.every((name, index) => name === selected[index]))) ||
            (Object.hasOwn(options, 'exitCode') && registration.exitCode !== exitCode) ||
            (Object.hasOwn(options, 'exit') && registration.exit !== exit) ||
            (Object.hasOwn(options, 'signal') && registration.signal !== signal);
        if (conflicts) throw new TypeError('Repeated registration must use the same lifecycle options');
        if (shutdownHook) registration.hooks.push(shutdownHook);
        return registration.api;
    }

    const hooks = shutdownHook ? [shutdownHook] : [];
    let shuttingDown = false;
    let shutdownPromise;
    let removed = false;
    const listeners = new Map();
    let abortHandler;

    const runHooks = async (receivedSignal) => {
        for (const hook of hooks) {
            try { await hook(receivedSignal); }
            catch (err) { log.error('Error during shutdown hook:', err); }
        }
    };
    const shutdown = async (receivedSignal = 'manual') => {
        if (shutdownPromise) {
            log.warn(`Received ${receivedSignal} again, but already shutting down.`);
            return shutdownPromise;
        }
        shuttingDown = true;
        log.debug(`Received ${receivedSignal}. Shutting down gracefully...`);
        shutdownPromise = runHooks(receivedSignal).then(() => {
            if (exit && typeof processObj.exit === 'function') processObj.exit(exitCode);
        });
        return shutdownPromise;
    };
    const onBeforeExit = (code) => {
        if (shuttingDown) return;
        shuttingDown = true;
        log.debug(`Process exiting (code ${code}). Running shutdown hooks...`);
        shutdownPromise = runHooks('beforeExit');
    };
    for (const name of selected) {
        const listener = () => { void shutdown(name); };
        listeners.set(name, listener);
        processObj.on(name, listener);
    }
    processObj.on('beforeExit', onBeforeExit);

    const removeHandlers = () => {
        if (removed) return;
        removed = true;
        if (typeof processObj.off === 'function') {
            for (const [name, listener] of listeners) processObj.off(name, listener);
            processObj.off('beforeExit', onBeforeExit);
        }
        if (signal && abortHandler && typeof signal.removeEventListener === 'function') {
            signal.removeEventListener('abort', abortHandler);
        }
        if (registrations.get(processObj)?.api === api) registrations.delete(processObj);
    };
    const api = { shutdown, getShuttingDown: () => shuttingDown, removeHandlers, get removed() { return removed; } };
    registration = { hooks, api, log, exitCode, exit, signal, signals: selected };
    registrations.set(processObj, registration);
    if (signal) {
        if (signal.aborted) removeHandlers();
        else {
            abortHandler = removeHandlers;
            signal.addEventListener('abort', abortHandler, { once: true });
        }
    }
    log.debug('Registered Handlers', { signals: selected.join(', ') });
    return registration.api;
};

export default registerSignals;
