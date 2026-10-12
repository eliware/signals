# AGENTS.md

## Project

Provide graceful shutdown handlers for Node.js libraries.

## Scope and boundaries

Use Node.js 26 or later and native ESM.
Keep this repository focused on `@eliware/signals`.

## Layout

Keep library code under `src/`.

## Development

Use `@eliware/log` for logging.

## Validation

Run `npm test`.
Run `npm run lint`.
Run `npm run audit`.
Run `npm run format`.
Run `npm run format:check`.
Run `npm run typecheck`.
Run `npm run pack`.

## Security

Keep secrets and sensitive shutdown data out of logs.

## Changes

Describe user-visible changes in `RELEASE_NOTES.md`.

## Library

Document public APIs, supported use, compatibility, installation, and package contents.
Keep this information in `README.md` and `docs/`.

## npm publication

Do not treat validation as approval to publish.
