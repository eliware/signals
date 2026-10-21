# Troubleshooting

Use these steps for setup and runtime problems.

## The package does not install

Check that your project uses Node.js 26 or later.
Run `npm install @eliware/signals` in your project directory.
Use native ESM to import the package.

## A signal does not start shutdown

Check that the signal name appears in the `signals` option.
Check that `processObj` has an `on` method.
Check that shutdown has not started.
Check that the registration is active and its signal was not aborted.

## The process does not exit

Check that `exit` is `true`.
Check that `processObj.exit` exists.
The package calls `exit` after cleanup for a configured signal.
A label passed to `shutdown()` does not call `exit`.

## A cleanup function does not complete

Check that the function returns its promise.
Await each asynchronous cleanup action inside the function.
Call `shutdown()` and await its promise for all cleanup functions to complete.
Node.js does not wait for promises from the `beforeExit` event.

## A cleanup function does not run after removal

Call `registerSignals()` after you remove the registration.
Use the same lifecycle option values while a registration stays active.
Set a different logger, signal list, exit code, exit value, or abort signal after removal.

## An option causes a `TypeError`

Set `processObj` to an object with an `on` method.
Set `log` to an object with `debug`, `warn`, and `error` methods.
Set `signals` to an array of strings.
Set `signal` to an `AbortSignal` instance.

Set `exit` to a Boolean value.
Set `exitCode` to a finite integer.
See the [API reference](api.md) for all option types.

## Example

Read the [usage guide](usage.md) and [shutdown guide](lifecycle.md).
Run the [example](../examples/example.mjs) with Node.js 26 or later.
