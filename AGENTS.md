# AGENTS.md

## Project

This repository is `eliware/signals`.
It provides graceful shutdown handlers for Node.js libraries.
Use Node.js 26 or later and native ESM.

## Scope and boundaries

Use README.md for public purpose, API, supported use, and package contents.
Use specs/README.md for repository requirements.
Use RELEASE_NOTES.md for user-visible changes.
Do not treat validation as approval to publish.

## Layout

Keep library code under `src/`.
Keep tests under `tests/`, documentation under `docs/`, and examples under `examples/`.
Mirror every source `.mjs` file with one same-path `.test.mjs` file under `tests/`.
Keep public declarations beside the public entrypoint under `src/`.
Index every document in its folder README.md.

## Development

Give each source and test module one focused purpose.
Inject process and logger objects when tests need to control them.
Keep shutdown hooks ordered and safe after hook errors.
Keep public API changes consistent with README.md and type declarations.

## Validation

Use Node.js 26 or later and native ESM.
Run `npm test` for aggregate validation.
Run `npm run lint` for lint checks.
Run `npm run audit` for dependency checks.
Run `npm run format` to format files.
Run `npm run format:check` to check file format.
Run `npm run typecheck` for declaration checks.
Run `npm run pack` for package checks.

## Security

Keep secrets, credentials, private data, and runtime state out of Git.
Do not log secrets or sensitive shutdown data.
Keep cleanup hooks bounded.

## Changes

Keep documentation current and direct.
Describe user-visible changes in RELEASE_NOTES.md.
Follow Eliware Operations approval steps before external actions.

## Library

Document public APIs, supported use, compatibility, and package contents in README.md.
Keep source and tests under their documented paths.
Use `@eliware/log` for logging.

## npm publication

The public package is `@eliware/signals`.
The `package.json` version sets the package version.
Include source, docs, examples, and specs in the package.
Run package validation before publication review.
Follow Eliware Operations approval steps before publication.
