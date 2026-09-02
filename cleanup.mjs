import { deleteRegistration } from './registration.mjs';

export const createCleanup = ({ processObj, signal, listeners, onBeforeExit }) => {
    let removed = false;
    let abortHandler;

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
        deleteRegistration(processObj);
    };
    const attachAbortHandler = () => {
        if (!signal) return;
        if (signal.aborted) removeHandlers();
        else {
            abortHandler = removeHandlers;
            signal.addEventListener('abort', abortHandler, { once: true });
        }
    };

    return { removeHandlers, attachAbortHandler, getRemoved: () => removed };
};
