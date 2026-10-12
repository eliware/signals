# Usage

Install `@eliware/signals` with npm.
Use Node.js 26 or later and native ESM.
Import `registerSignals` from the package root.
Pass shutdown work with the `shutdownHook` option.
Use `exit: false` when the caller owns process exit.
Call `shutdown()` when the caller must wait for cleanup.
Call `removeHandlers()` when the registration is no longer needed.

See the [public API](../README.md#api) and [example](../examples/example.mjs).
