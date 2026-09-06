export const createShutdown = ({ hooks, log, processObj, exit, exitCode }) => {
    let shuttingDown = false;
    let shutdownPromise;

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
        if (shuttingDown) return shutdownPromise;
        shuttingDown = true;
        log.debug(`Process exiting (code ${code}). Running shutdown hooks...`);
        shutdownPromise = runHooks('beforeExit');
        return shutdownPromise;
    };

    return { shutdown, onBeforeExit, getShuttingDown: () => shuttingDown };
};
