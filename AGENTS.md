# AGENTS.md

## Project

`@eliware/signals` is an ESM-only Node.js utility for graceful process shutdown and signal handling.

## Development

- Use Node.js 26.
- Preserve the named and default `registerSignals` exports.
- Keep registration idempotent per process-like object.
- Preserve existing listeners and support injectable process objects and loggers.
- Keep shutdown hooks ordered and isolated: a failing hook must not prevent later hooks from running.
- Preserve concurrent-shutdown protection so hooks run at most once.
- Keep `removeHandlers()` safe to call repeatedly.
- Preserve support for custom signals, `AbortSignal`, configurable exit codes, and non-exiting mode.
- Do not modify Galera, database, or application shutdown behavior outside this package.

## Validation

Run before committing:

```bash
npm test
npm run lint
npm run test:gaps
```

Maintain 100% test coverage without Istanbul ignore directives. Add or update tests for every behavior change.

## Documentation and API

- Update `index.d.ts` whenever the public API changes.
- Update `README.md` and `example.mjs` for user-facing behavior.
- Keep examples safe to run; avoid unintentionally terminating the developer's shell.
- Document limitations around asynchronous work during Node's `exit` event.
- Do not bump versions, create release notes, tag, or publish unless explicitly requested.

## Git and Dependencies

- Keep `.agentx*`, coverage output, and temporary test artifacts ignored.
- Avoid unnecessary dependency changes.
- Do not push changes unless explicitly requested.
