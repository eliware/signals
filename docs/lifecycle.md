# Shutdown behavior

The package listens for the configured signals and the Node.js `beforeExit` event.
It runs each registered hook in order when shutdown starts.

## Signal requests

The default signals are `SIGTERM`, `SIGINT`, and `SIGHUP`.
Set `signals` to a string array to choose other signal names.
Set `signals` to an empty array to disable signal listeners.
The package removes duplicate names and keeps their first order.

The first signal request starts shutdown.
The package runs each hook once.
It calls `processObj.exit(exitCode)` when `exit` is `true` and the method exists.
Set `exit: false` to keep process exit under your control.
Set `exitCode` to a finite integer to choose the process exit code.

## Hook order and errors

The package runs hooks in the order that calls add them.
The package waits for each hook before it runs the next hook.
If a hook fails, the package logs the error and runs the next hook.
Keep cleanup work bounded so shutdown can finish promptly.

Only the first shutdown request controls the signal name and promise.
The package logs a warning when another request arrives during shutdown.
Call `shutdown()` to start manual shutdown and wait for all hooks.

## `beforeExit` event

The package runs hooks for `beforeExit` when shutdown has not started.
Node.js does not wait for promises that an event listener returns.
Schedule required asynchronous work before the event loop becomes empty.
Do not use the Node.js `exit` event for asynchronous cleanup.

## Remove handlers

Call `removeHandlers()` to remove a registration.
Abort the configured `AbortSignal` to remove its handlers.
An already-aborted signal removes the registration during setup.
The package detaches listeners when `processObj.off` exists.
Without `off`, removed listeners stay attached but cannot start shutdown.
Remove a registration before you add a new one to the same process object.

## Repeated calls

Each process object can have one active registration.
Call `registerSignals()` again to add hooks to that registration.
Keep lifecycle option values the same when you set them again.
Remove the active registration before you set different lifecycle values.

See the [API reference](api.md) for option details.
