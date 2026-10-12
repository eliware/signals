# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/signals [![npm](https://img.shields.io/npm/v/@eliware/signals)](https://www.npmjs.com/package/@eliware/signals) [![License](https://img.shields.io/github/license/eliware/signals)](https://github.com/eliware/signals/blob/main/LICENSE) [![CI](https://github.com/eliware/signals/actions/workflows/ci.yaml/badge.svg)](https://github.com/eliware/signals/actions/workflows/ci.yaml)

Graceful shutdown signal handler utility for Node.js

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [API](#api)
- [Packaging](#packaging)
- [Examples](#examples)
- [Support](#support)
- [Links](#links)
- [License](#license)

## Features

Register handlers for `SIGTERM`, `SIGINT`, and `SIGHUP`.
Add ordered async hooks for signal, manual, and `beforeExit` shutdown.
Use an injected process object and logger in tests or embedded applications.
Use an `AbortSignal` to remove listeners.
Prevent repeated and concurrent shutdown work.
Continue later hooks when a hook fails.
Choose an exit code or disable process exit.

## Requirements

Use Node.js 26 or later.
Use native ESM.

## Setup

Install the package:

```sh
npm install @eliware/signals
```

Import the default or named `registerSignals` export from `@eliware/signals`.

## Usage

```js
import log from "@eliware/log";
import registerSignals from "@eliware/signals";

const registration = registerSignals({
  log,
  exit: false,
  shutdownHook: async (signal) => {
    log.debug(`Cleanup complete after ${signal}`);
  },
});

await registration.shutdown("manual");
registration.removeHandlers();
```

Call `registerSignals` again to add hooks to the same process lifecycle.
Use the same lifecycle options for each registration.
Call `shutdown()` when the caller must wait for cleanup.
Call `removeHandlers()` when the registration is no longer needed.
Shutdown hooks do not run from Node.js `exit` events.
See [release notes](RELEASE_NOTES.md) for user-visible changes.

## Development

Install locked development dependencies with `npm ci`.
Run `npm test` before you commit changes.
Run `npm run lint`, `npm run format:check`, `npm run audit`, or `npm run typecheck` for focused checks.
Run `npm run format` to format maintained files.

## Testing

`npm test` runs the shared validation checks, typecheck, Jest tests, and coverage.
The Jest configuration requires 100 percent statements, branches, functions, and lines.
Test files mirror source modules under `tests/`.

## Troubleshooting

Use `exit: false` when the caller owns process exit.
Use `shutdown()` when the caller must await hook completion.
Use `removeHandlers()` or abort the configured signal to remove listeners.
Read [troubleshooting guidance](docs/troubleshooting.md) for more detail.

## Security

Keep secrets and sensitive shutdown data out of logs.
Keep cleanup hooks bounded.
Do not depend on async work after Node.js enters the `exit` event.
Validation and publication are separate actions.
Follow Eliware Operations approval steps before publication.

## API

`registerSignals(options?)` returns a registration object.

Options include `processObj`, `log`, `signals`, `shutdownHook`, `exitCode`, `exit`, and `signal`.
The logger must provide `debug`, `warn`, and `error` methods.
The process object must provide `on`; it can also provide `off` and `exit`.
Without `off`, cleanup cannot detach listeners, but removed listeners cannot run shutdown hooks.
Repeated registrations for one process object must use the same lifecycle options.

The registration object provides `shutdown(signal?)`, `getShuttingDown()`, `removeHandlers()`, and `removed`.
Signal names are deduplicated while preserving order.
Each hook runs in registration order.
A hook error is logged and does not stop later hooks.
See [type declarations](src/index.d.ts) for complete option and return types.

## Packaging

The package uses native ESM and supports Node.js 26 or later.
Its public entrypoint is `src/index.mjs`.
Its TypeScript declarations are `src/index.d.ts`.
The package includes source, documentation, examples, and specifications.
The npm package uses public access and provenance.
No repository command grants approval to publish.
Use Eliware Operations approval steps before publication.

See [documentation](docs/README.md), [specifications](specs/README.md), and [release notes](RELEASE_NOTES.md).

## Examples

See the [example index](examples/README.md).
The [example](examples/example.mjs) requires Node.js 26 or later and installed package dependencies.
Run it with `node examples/example.mjs`.
It registers signal handlers, calls shutdown, and removes listeners without exiting the process.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## Links

- [Home Page](https://eliware.org)
- [GitHub Org](https://github.com/eliware)
- [GitHub Repo](https://github.com/eliware/signals)
- [Bug Reports](https://github.com/eliware/signals/issues)
- [npm](https://www.npmjs.com/package/@eliware/signals)
- [Discord](https://discord.gg/M6aTR9eTwN)

## License

[MIT © Eliware](LICENSE)
