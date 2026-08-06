import logger from '@eliware/log';

const defaultSignals = ['SIGTERM', 'SIGINT', 'SIGHUP'];
const registrations = new WeakMap();

const normalizeSignals = (signals) => {
    if (signals === undefined) return defaultSignals;
    if (!Array.isArray(signals) || signals.some(signal => typeof signal !== 'string')) {
        throw new TypeError('signals must be an array of signal names');
    }
    return [...new Set(signals)];
};

export const registerSignals = ({
    processObj = process,
    log = logger,
    signals,
    shutdownHook,
    exitCode = 0,
    exit = true,
    signal
} = {}) => {
    const selected = normalizeSignals(signals);
    let registration = registrations.get(processObj);
    if (registration) {
        if (shutdownHook) registration.hooks.push(shutdownHook);
        return registration.api;
    }

    const hooks = shutdownHook ? [shutdownHook] : [];
    let shuttingDown = false;
    let shutdownPromise;
    let removed = false;
    const listeners = new Map();

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
    const onExit = (code) => {
        if (shuttingDown) return;
        shuttingDown = true;
        log.debug(`Process exiting (code ${code}). Running shutdown hooks...`);
        void runHooks('exit');
    };
    for (const name of selected) {
        const listener = () => { void shutdown(name); };
        listeners.set(name, listener);
        processObj.on(name, listener);
    }
    processObj.on('exit', onExit);
    processObj.on('beforeExit', onExit);

    const removeHandlers = () => {
        if (removed) return;
        removed = true;
        if (typeof processObj.off !== 'function') return;
        for (const [name, listener] of listeners) processObj.off(name, listener);
        processObj.off('exit', onExit);
        processObj.off('beforeExit', onExit);
        registrations.delete(processObj);
    };
    registration = { hooks, api: { shutdown, getShuttingDown: () => shuttingDown, removeHandlers, get removed() { return removed; } } };
    registrations.set(processObj, registration);
    if (signal) {
        if (signal.aborted) removeHandlers();
        else signal.addEventListener('abort', removeHandlers, { once: true });
    }
    log.debug('Registered Handlers', { signals: selected.join(', ') });
    return registration.api;
};

export default registerSignals;
