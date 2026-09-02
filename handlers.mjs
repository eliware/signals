export const installHandlers = ({ processObj, signals, shutdown, onBeforeExit }) => {
    const listeners = new Map();
    for (const name of signals) {
        const listener = () => { void shutdown(name); };
        listeners.set(name, listener);
        processObj.on(name, listener);
    }
    processObj.on('beforeExit', onBeforeExit);
    return { listeners, onBeforeExit };
};
