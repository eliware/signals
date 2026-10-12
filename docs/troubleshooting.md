# Troubleshooting

Use these steps to fix common setup and runtime problems.

## The package does not install

Check that your project uses Node.js 26 or later.
Run `npm install @eliware/signals` in your project directory.
Use native ESM to import the package.

## A signal does not start shutdown

Check that the signal name appears in the `signals` option.
Check that `processObj` has an `on` method.
Check that the process has not started shutdown already.
Check that the registration has not been removed or aborted.

## The process does not exit

Check that `exit` is not `false`.
Check that `processObj.exit` exists.
The package calls `exit` only after signal cleanup.
A default `shutdown()` call uses `manual` and does not call `exit`.

## A hook does not finish

Check that the hook returns its promise.
Await each asynchronous cleanup action inside the hook.
Call `shutdown()` and await its promise to wait for hooks.
Node.js does not wait for promises from the `beforeExit` event.

## A hook does not run after removal

Call `registerSignals()` again after you remove the old registration.
Use the same lifecycle option values while a registration stays active.
Pass a different logger, signal list, exit code, exit value, or abort signal only after removal.

## An option causes a `TypeError`

Set `processObj` to an object with an `on` method.
Set `log` to an object with `debug`, `warn`, and `error` methods.
Set `signals` to an array of strings.
Set `exit` to a boolean.
Set `exitCode` to a finite integer.
See the [API reference](api.md) for all option types.

## Review example behavior

Read the [usage guide](usage.md) and [shutdown guide](lifecycle.md).
Run the [example](../examples/example.mjs) with Node.js 26 or later.
