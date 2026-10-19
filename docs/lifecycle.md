# Shutdown behavior

The package listens for configured signals and the Node.js `beforeExit` event.
It runs each cleanup function in order when shutdown starts.

## Signal requests

The default signals are `SIGTERM`, `SIGINT`, and `SIGHUP`.
Set `signals` to a string array to select signal names.
Set `signals` to an empty array to disable signal listeners.
The package removes duplicate names and keeps their first order.

The first signal request starts shutdown.
The package runs each cleanup function one time.
It calls `processObj.exit(exitCode)` when `exit` is `true` and that method exists.
Later signal requests also cause process exit after cleanup ends.
Set `exit: false` to keep process exit under your control.
Set `exitCode` to a finite integer to set the process exit code.

A label passed to `shutdown()` names a manual request.
A manual label does not cause process exit.
Only a configured signal event causes process exit.
The label stays manual when its text matches a configured signal name.

## Cleanup order and errors

The package runs cleanup functions in registration order.
The package waits for each function to complete before it runs each remaining function.
If a function fails, the package logs the error. It then runs each remaining function.
Keep each cleanup task short so shutdown can end promptly.

The first shutdown request sets the label and promise for all cleanup functions.
A later request causes a warning during shutdown.
Call `shutdown()` to start manual shutdown and wait for all cleanup functions.

## `beforeExit` event

The package runs cleanup functions for `beforeExit` if shutdown has not started.
Node.js does not wait for promises that an event listener returns.
The package keeps the event loop active until cleanup ends.
Keep cleanup tasks short so the process can exit promptly.
Do not use the Node.js `exit` event for asynchronous cleanup.

## Remove handlers

Call `removeHandlers()` to remove a registration.
New `shutdown()` calls then resolve without running cleanup functions.
Abort the configured `AbortSignal` to remove its handlers.

If the signal was aborted before setup, the package removes the registration.
The package detaches listeners when `processObj.off` exists.
Without `off`, removed listeners stay attached but cannot start shutdown.
Remove a registration before you add a different registration to the same process object.

## Repeated calls

Each process object can have one active registration.
Call `registerSignals()` again to add cleanup functions before shutdown starts.
Keep lifecycle option values the same each time you call the function.
Remove the active registration before you set different lifecycle values.

See the [API reference](api.md) for option details.
