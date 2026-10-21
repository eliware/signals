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

The package starts cleanup for `SIGTERM`, `SIGINT`, and `SIGHUP`.
Run ordered cleanup functions during shutdown.
Set the exit code or prevent process exit.

## Requirements

Use Node.js 26 or later.
Use native ESM.

## Setup

Run this command in your project:

```sh
npm install @eliware/signals
```

## Usage

Import `registerSignals` from `@eliware/signals`.
Pass a cleanup function as `shutdownHook`.
Set `exit: false` when your application controls process exit.
Call `shutdown()` to run cleanup and wait for all cleanup functions to complete.
Call `removeHandlers()` when you no longer require the registration.

```js
import registerSignals from "@eliware/signals";

registerSignals({
  shutdownHook: async () => {
    process.stdout.write("Cleanup complete\n");
  },
});
```

This example requires Node.js 26 or later and native ESM.
Run it in a project that has this package installed.
Send `SIGTERM`, `SIGINT`, or `SIGHUP` to run the cleanup function.
The process exits with code `0` after the cleanup function completes.

Read the [release notes](RELEASE_NOTES.md) for user-visible changes.
Read the [user guides](docs/README.md) for full usage details.

## Development

Run `npm ci` to install the locked development dependencies.
Read [AGENTS.md](AGENTS.md) for repository validation commands and [the specification index](specs/README.md) for repository requirements.

## Testing

Run `npm test` to validate the package.

## Troubleshooting

Set `exit: false` when your application controls process exit.
Call and await `shutdown()` when your application must wait for cleanup.
Read the [troubleshooting guide](docs/troubleshooting.md) for more help.

## Security

Keep secrets and sensitive shutdown data out of logs.
Do not rely on asynchronous cleanup during Node.js `exit` events.

## API

Call `registerSignals(options?)` to receive a registration object.
Options include `processObj`, `log`, `signals`, `shutdownHook`, `exitCode`, `exit`, and `signal`.
Each cleanup function runs in registration order.
If a cleanup function fails, the package logs a fixed notice without error details and continues.
Read the [API reference](docs/api.md) and [type declarations](src/index.d.ts) for details.

## Packaging

Use numeric `MAJOR.MINOR.PATCH` versions and matching `v<version>` release tags.
The npm workflow validates the matching tag and package version before publication.
Run `npm run pack` to check package contents. Publish only after approved release steps.

## Examples

Read the [example index](examples/README.md) and run `node examples/example.mjs`.

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
