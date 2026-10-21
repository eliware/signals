# Release Notes

## 14.0.0 — 2026-10-21

### Added

- Add focused modules and tests for registration policy, `beforeExit` timer handling, shutdown callbacks, and abort cleanup.

### Changed

- Upgrade `@eliware/log` and `@eliware/test` to version 14. Refresh the lockfile.
- Align package metadata, specifications, and validation with Convention 14.
- Clarify manual shutdown labels, repeated registrations, and abort handling in the API documentation.
- Rewrite user documentation and add package version, contents, and release details.
- Update CI and npm workflows to use checkout v7 and setup-node v7.
- Fetch full Git history in validation and use the standard npm workflow name.
- Align the Knit deployment command with the shared workflow.
- Separate shutdown state and exit policy from ordered callback execution. Keep error handling and nested shutdown context in a focused module.
- Separate process listener removal from abort listener management.

### Fixed

- Name invalid logger methods in validation error messages.
- Log a fixed shutdown failure notice without cleanup error messages, stacks, or custom fields.

## 12.0.0 — 2026-10-12

### Added

- Split lifecycle code into focused modules with matching tests.
- Add API, usage, lifecycle, and troubleshooting guides.
- Add continuous integration and tag-based npm publication workflows.
- Add the Knit deployment workflow and standard documentation indexes.

### Changed

- Align package metadata, validation, formatting, and repository files with v12 conventions.
- Upgrade `@eliware/log` and `@eliware/test` to version 12. Refresh the lockfile.
- Update the README, examples, TypeScript declarations, and package contents.

### Fixed

- Prevent removed signal handlers from starting shutdown hooks.
- Keep manual shutdown from exiting the process.
- Wait for asynchronous shutdown functions during `beforeExit` and prevent shutdown promise deadlocks.
- Continue after logger errors. Exit after cleanup when a signal arrives during or after `beforeExit`.

## 2.0.0 — 2026-08-25

### Changed

- Move tests and lint checks to the shared `@eliware/test` harness.
- Require Node.js 26 or later and add Ubuntu and Windows CI checks.
- Add a tag-based npm publication workflow.

### Breaking changes

- Require the documented ESM API and Node.js 26 or later.
