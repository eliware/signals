# Usage

Use `@eliware/signals` when Node.js receives a signal or emits `beforeExit`.
The package requires Node.js 26 or later and native ESM.

## Install

Run this command in your project:

```sh
npm install @eliware/signals
```

Import `registerSignals` from the package root. Pass a `shutdownHook` function to run cleanup work.

```js
import log from "@eliware/log";
import registerSignals from "@eliware/signals";

const registration = registerSignals({
  log,
  shutdownHook: async (signal) => {
    await closeDatabase();
    log.debug(`Cleanup complete after ${signal}`);
  },
});
```

The package handles `SIGTERM`, `SIGINT`, and `SIGHUP` by default.
It runs hooks for the first shutdown request.
The default exit code is `0`.
The package calls `process.exit(0)` after signal cleanup when that method exists.

## Keep control of process exit

Set `exit` to `false` when your application controls process exit.
Call `shutdown()` to run cleanup and wait for every hook.
Pass a label to `shutdown()` to name a manual request. A label does not trigger process exit.
Call `removeHandlers()` after cleanup when you no longer need the registration.

```js
const registration = registerSignals({
  exit: false,
  shutdownHook: async () => closeDatabase(),
});

await registration.shutdown("manual");
registration.removeHandlers();
```

## Add another hook

Call `registerSignals()` again with the same process object to add another hook.
The package runs hooks in the order of registration.
Keep each lifecycle option the same when you set it again.
The package rejects a conflicting value with a `TypeError`.

See the [API reference](api.md) for all options.
See [shutdown behavior](lifecycle.md) for signal and cleanup details.
See the [example](../examples/example.mjs) for a complete program.
