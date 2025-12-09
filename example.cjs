// Example usage for CommonJS
const log = require('@eliware/log');
const registerSignals = require('@eliware/signals');
const { shutdown, getShuttingDown } = registerSignals({ log });

// Extended usage with shutdown hooks
// Simulate a resource that needs cleanup (e.g., database connection)
const fakeDb = {
    close: async () => {
        return new Promise(resolve => setTimeout(() => {
            log.info('Fake DB connection closed');
            resolve();
        }, 100));
    }
};

// Initial registration of handlers
registerSignals({ log });

// Add shutdown hook for closing the fake DB connection
registerSignals({
    log,
    shutdownHook: async (signal) => {
        await fakeDb.close();
        log.info(`Cleanup complete on ${signal}`);
    }
});
