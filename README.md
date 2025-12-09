# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/signals [![npm version](https://img.shields.io/npm/v/@eliware/signals.svg)](https://www.npmjs.com/package/@eliware/signals)[![license](https://img.shields.io/github/license/eliware/signals.svg)](LICENSE)[![build status](https://github.com/eliware/signals/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eliware/signals/actions)

> Graceful shutdown signal handler utility for Node.js (ESM and CommonJS)

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [ESM Example](#esm-example)
  - [CommonJS Example](#commonjs-example)
  - [Shutdown Hooks Example](#shutdown-hooks-example)
- [API](#api)
- [TypeScript](#typescript)
- [License](#license)

## Features

- Register handlers for process signals (e.g., `SIGTERM`, `SIGINT`, `SIGHUP`)
- Register async shutdown hooks to run on signal or process exit
- Customizable logger and process object
- Simple API for both ESM and CommonJS
- TypeScript type definitions included
- Well-tested with Jest

## Installation

```bash
npm install @eliware/signals
```

## Usage

### ESM Example

```js
import log from '@eliware/log';
import registerSignals from '@eliware/signals'; // Default export
// or: import { registerSignals } from '@eliware/signals';
const { shutdown, getShuttingDown } = registerSignals({ log });
```

### CommonJS Example

```js
const log = require('@eliware/log');
const registerSignals = require('@eliware/signals'); // Default export
// or: const { registerSignals } = require('@eliware/signals');
const { shutdown, getShuttingDown } = registerSignals({ log });
```

### Shutdown Hooks Example

You can call `registerSignals` multiple times to add async shutdown hooks. All hooks will be run (in order of registration) when a signal is received or the process exits (via `exit` or `beforeExit`).

```js
// Simulate a resource that needs cleanup (e.g., database connection)
const fakeDb = {
  close: async () => {
    return new Promise(resolve => setTimeout(() => {
      log.info('Fake DB connection closed');
      resolve();
    }, 100));
  }
};

// Register signal handlers
registerSignals({ log });

// Add shutdown hook for closing the fake DB connection
registerSignals({
  log,
  shutdownHook: async (signal) => {
    await fakeDb.close();
    log.info(`Cleanup complete on ${signal}`);
  }
});
```

> **Note:** Both the default export and named export `registerSignals` are available in both ESM and CommonJS.

## API

### registerSignals(options?)

Registers shutdown handlers for the specified signals and allows registering async shutdown hooks.

#### Options

- `processObj` (default: `process`): The process object to attach handlers to.
- `log` (default: `@eliware/log`): Logger for output. Should have `debug`, `info`, `warn`, and `error` methods.
- `signals` (default: `[ 'SIGTERM', 'SIGINT', 'SIGHUP' ]`): Array of signals to listen for.
- `shutdownHook` (optional): An async function to run during shutdown. You can call `registerSignals` multiple times to add multiple hooks.

#### Returns

An object with:

- `shutdown(signal: string): Promise<void>` — Manually trigger shutdown logic.
- `getShuttingDown(): boolean` — Returns whether shutdown is in progress.

> **Shutdown hooks will run on signal, `process.exit`, or `beforeExit`.**

## TypeScript

Type definitions are included:

```ts
import registerSignals, { RegisterSignalsOptions } from '@eliware/signals';

// Optionally provide options
const options: RegisterSignalsOptions = {
  processObj: process, // optional, defaults to process
  log: myLogger,       // optional, defaults to @eliware/log
  signals: ['SIGTERM', 'SIGINT', 'SIGHUP'], // optional, defaults as shown
  shutdownHook: async (signal) => { /* ... */ } // optional
};

const { shutdown, getShuttingDown } = registerSignals(options);

// Types:
// interface RegisterSignalsOptions {
//   processObj?: NodeJS.Process;
//   log?: typeof log;
//   signals?: string[];
//   shutdownHook?: (signal: string) => Promise<void>;
// }
//
// function registerSignals(options?: RegisterSignalsOptions): {
//   shutdown: (signal: string) => Promise<void>;
//   getShuttingDown: () => boolean;
// };
```

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## License

[MIT © 2025 Eli Sterling, eliware.org](LICENSE)

## Links

- [Home Page](https://eliware.org)
- [GitHub](https://github.com/eliware/signals)
- [npm](https://www.npmjs.com/package/@eliware/signals)
- [Discord](https://discord.gg/M6aTR9eTwN)
