# API reference

Import `registerSignals` from `@eliware/signals`. Call it with an options object.
The call returns one registration object for each active process object.

```js
import registerSignals from "@eliware/signals";

const registration = registerSignals({
  shutdownHook: async (signal) => cleanUp(signal),
});
```

## Options

| Option         | Type                | Default                       | Purpose                                  |
| -------------- | ------------------- | ----------------------------- | ---------------------------------------- |
| `processObj`   | Process-like object | Node.js `process`             | Set the event source.                    |
| `log`          | Logger object       | `@eliware/log`                | Set the logger for status and errors.    |
| `signals`      | String array        | `SIGTERM`, `SIGINT`, `SIGHUP` | Set the signals that start shutdown.     |
| `shutdownHook` | Function            | None                          | Add cleanup work.                        |
| `exitCode`     | Finite integer      | `0`                           | Set the code for process exit.           |
| `exit`         | Boolean             | `true`                        | Allow process exit after signal cleanup. |
| `signal`       | `AbortSignal`       | None                          | Remove handlers when this signal aborts. |

The logger must provide `debug`, `warn`, and `error` methods.
The process object must provide `on`. It can also provide `off` and `exit`.
Each signal name must be a string. The package removes duplicate names and keeps their first order.
Pass an empty `signals` array to disable signal handlers.
The package still adds its `beforeExit` handler.
Pass a synchronous or asynchronous function as `shutdownHook`.
The hook receives the signal name as its only argument.
Pass `exit: false` to stop the package from calling `processObj.exit`.

## Return value

| Member              | Type              | Purpose                                         |
| ------------------- | ----------------- | ----------------------------------------------- |
| `shutdown(signal?)` | Promise           | Run hooks once and resolve after they finish.   |
| `getShuttingDown()` | Boolean           | Report whether shutdown has started.            |
| `removeHandlers()`  | Function          | Remove or disable this registration's handlers. |
| `removed`           | Read-only Boolean | Report whether this registration was removed.   |

`shutdown()` uses `manual` as its default signal name and does not call `processObj.exit`.
After removal, new `shutdown()` calls resolve without starting hooks.
The first shutdown request sets the signal name for all hooks.
Later or concurrent requests use the first request's promise.
A signal request still triggers process exit after hooks finish.
A shutdown hook can call and await `shutdown()`. That nested call resolves at once.
The package logs a warning for duplicate requests.
Each hook error is logged. Hook or logger errors do not stop later hooks.
The package rejects invalid options with a `TypeError`.

See the [TypeScript declarations](../src/index.d.ts) for complete types.
