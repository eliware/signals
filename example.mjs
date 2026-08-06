import log from '@eliware/log';
import registerSignals from './index.mjs';

const controller = new AbortController();
const { shutdown, getShuttingDown, removeHandlers } = registerSignals({
  log,
  signals: ['SIGTERM', 'SIGINT'],
  signal: controller.signal,
  exitCode: 0,
});

console.log(`Shutdown handlers ready: ${getShuttingDown()}`);

// Application code can trigger the same graceful cleanup path explicitly.
await shutdown('manual');
console.log(`Shutdown started: ${getShuttingDown()}`);

// Cleanup is idempotent; AbortSignal cleanup is also supported.
removeHandlers();
controller.abort();
