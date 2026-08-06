// Example usage for ESM
import log from '@eliware/log';
import registerSignals from '@eliware/signals';
registerSignals({ log });

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