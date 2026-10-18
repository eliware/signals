# Release Notes

## 13.0.0 — 2026-10-17

### Changed

- Set the package version to 13.0.0.
- Update repository guidance and workflows for Convention v13.

### Fixed

- Reject a new shutdown function after shutdown starts.
- Keep manual request labels from calling `processObj.exit`.

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
