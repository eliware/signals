# API reference

Import `registerSignals` from `@eliware/signals`. Call it with an options object.
The call returns one registration for each process object.

```js
import registerSignals from "@eliware/signals";

const registration = registerSignals({
  shutdownHook: async (label) => cleanUp(label),
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
The package also adds its `beforeExit` handler.
Pass a synchronous or asynchronous function as `shutdownHook`.
The cleanup function receives the event name or manual label as its only argument.
Pass `exit: false` to prevent the package from calling `processObj.exit`.

If the `AbortSignal` was aborted before setup, the package removes the registration.
If the `AbortSignal` aborts later, the package removes the registration then.
The package uses `processObj.off` to remove listeners when that method exists.
Without `off`, the package leaves listeners attached, but they do not start shutdown.

## Return value

| Member              | Type              | Purpose                                                  |
| ------------------- | ----------------- | -------------------------------------------------------- |
| `shutdown(label?)`  | Promise           | Run cleanup functions once. Resolve after they complete. |
| `getShuttingDown()` | Boolean           | Report if shutdown has started.                          |
| `removeHandlers()`  | Function          | Remove or disable this registration's handlers.          |
| `removed`           | Read-only Boolean | Report if this registration was removed.                 |

`shutdown()` uses `manual` as its default label. A manual label does not call `processObj.exit`.
After removal, new `shutdown()` calls resolve without running cleanup functions.
The first shutdown request gives each cleanup function the same label.
Later requests use the first request's promise.
Only a configured signal event triggers process exit after cleanup ends.

A string passed to `shutdown()` names a request only.
It does not simulate a signal event.

A cleanup function can call and await `shutdown()`. The nested call resolves at once.
The package logs a warning for repeated requests.
Errors from cleanup functions or logger methods do not stop later cleanup functions.
The package rejects invalid options with a `TypeError`.

Repeated calls with the same process object share one registration.
Keep each lifecycle option the same on repeated calls.
Add cleanup functions before shutdown starts.
The package rejects a cleanup function added after shutdown starts with a `TypeError`.
Remove the registration before you set different lifecycle options.

See the [TypeScript declarations](../src/index.d.ts) for complete types.
