# Release Notes

## Unreleased

### Fixed

- Prevent stale signal listeners from running shutdown hooks after cleanup.

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
- This package version is an unpublished candidate pending publication.

### Fixed

- Prevent removed signal handlers from starting shutdown hooks.
- Keep manual shutdown from exiting the process.
- Await asynchronous hooks during `beforeExit` and avoid shutdown promise deadlocks.
- Run hooks when the logger fails. Exit after hooks when a signal arrives during or after `beforeExit`.

## 2.0.0 — 2026-08-25

### Changed

- Move tests and lint checks to the shared `@eliware/test` harness.
- Require Node.js 26 or later and add Ubuntu and Windows CI checks.
- Add a tag-based npm publication workflow.

### Breaking changes

- Require the documented ESM API and Node.js 26 or later.

## 1.1.7 — 2026-08-10

### Fixed

- Fix the runnable example import path and disable process exit in the example.
- Validate injected logger methods and align TypeScript process and logger types.

## 1.1.6 — 2026-08-07

### Changed

- Standardize package layout, validation, TypeScript checks, CI, and package contents.
- Expand operational, troubleshooting, development, and security guidance.

## 1.1.5 — 2026-08-07

### Changed

- Upgrade `@eliware/log` to version 1.1.10.

## 1.1.4 — 2026-08-06

### Added

- Add repository guidance for development, lifecycle behavior, validation, API compatibility, and releases.

## 1.1.3 — 2026-08-06

### Added

- Add repeat-safe registration, listener cleanup, abort cleanup, signal validation, and shutdown hooks.
- Add concurrent shutdown protection, hook error isolation, exit codes, and a non-exiting mode.

### Changed

- Update declarations, documentation, examples, coverage checks, and Node.js CI.

## 1.1.2 — 2026-07-01

### Changed

- Refresh package metadata, dependencies, and lockfile.

## 1.1.1 — 2025-12-09

### Changed

- Refresh package metadata and dependencies.
