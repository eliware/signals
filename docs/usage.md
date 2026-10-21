# Usage

Use `@eliware/signals` when Node.js receives a signal or emits `beforeExit`.
The package requires Node.js 26 or later and native ESM.

## Install

Run this command in your project:

```sh
npm install @eliware/signals
```

Import `registerSignals` from the package root. Pass a cleanup function as `shutdownHook`.

```js
import log from "@eliware/log";
import registerSignals from "@eliware/signals";

const registration = registerSignals({
  log,
  shutdownHook: async (label) => {
    await closeDatabase();
    log.debug(`Cleanup complete after ${label}`);
  },
});
```

The package handles `SIGTERM`, `SIGINT`, and `SIGHUP` by default.
It runs cleanup functions for the first shutdown request.
The default exit code is `0`.
The package calls `process.exit(0)` after signal cleanup when that method exists.

## Keep control of process exit

Set `exit` to `false` when your app controls process exit.
Call `shutdown()` to run cleanup and wait for each cleanup function to complete.
Pass a label to `shutdown()` to name a manual request. A label does not trigger process exit.
Call `removeHandlers()` after cleanup when you no longer require the registration.

```js
const registration = registerSignals({
  exit: false,
  shutdownHook: async () => closeDatabase(),
});

await registration.shutdown("manual");
registration.removeHandlers();
```

## Add a cleanup function

Call `registerSignals()` again with the same process object and a `shutdownHook` to add a cleanup function.
The package runs cleanup functions in registration order.
If you set a lifecycle option again, use the same value.
The package rejects conflicting values with a `TypeError`.

See the [API reference](api.md) for all options.
See [shutdown behavior](lifecycle.md) for signal and cleanup details.
See the [example](../examples/example.mjs) for a complete app.
