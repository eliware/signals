import logger from '@eliware/log';
import { defaultSignals } from './defaults.mjs';
import { validateLogger, normalizeSignals, validateOptions, validateLifecycleOptions } from './validation.mjs';
import { getRegistration, setRegistration } from './registration.mjs';
import { createShutdown } from './shutdown.mjs';
import { installHandlers } from './handlers.mjs';
import { createCleanup } from './cleanup.mjs';

export const registerSignals = (options = {}) => {
    if (options === null || typeof options !== 'object') {
        throw new TypeError('options must be an object');
    }
    const {
        processObj = process,
        log = logger,
        signals,
        shutdownHook,
        exitCode = 0,
        exit = true,
        signal
    } = options;
    validateOptions({ processObj, shutdownHook, signal });
    validateLifecycleOptions({ exit, exitCode });
    validateLogger(log);
    const selected = normalizeSignals(signals, defaultSignals);
    let registration = getRegistration(processObj);
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
    const lifecycle = createShutdown({ hooks, log, processObj, exit, exitCode });
    const handlers = installHandlers({ processObj, signals: selected, ...lifecycle });
    const cleanup = createCleanup({ processObj, signal, ...handlers });
    const api = { shutdown: lifecycle.shutdown, getShuttingDown: lifecycle.getShuttingDown, removeHandlers: cleanup.removeHandlers, get removed() { return cleanup.getRemoved(); } };
    registration = { hooks, api, log, exitCode, exit, signal, signals: selected };
    setRegistration(processObj, registration);
    cleanup.attachAbortHandler();
    log.debug('Registered Handlers', { signals: selected.join(', ') });
    return registration.api;
};

export default registerSignals;
