# Release Notes

## 1.1.6 — 2026-08-07

- Standardized package layout, validation scripts, TypeScript checking, CI, and package contents.
- Updated `@eliware/log` to 1.1.11.
- Expanded operational, troubleshooting, development, and security documentation.

## 1.1.5 — August 7, 2026

- Updated `@eliware/log` to `^1.1.10`.

## 1.1.3 — 2026-08-06

- Modernized graceful-shutdown lifecycle handling.
- Added idempotent registration per process-like object.
- Added repeat-safe `removeHandlers()` cleanup.
- Added `AbortSignal`-based cleanup.
- Added signal validation and duplicate signal removal.
- Added concurrent shutdown protection so hooks run once.
- Isolated shutdown-hook failures so later hooks still execute.
- Added configurable `exitCode` and non-exiting mode for embedded applications and tests.
- Updated TypeScript declarations, README documentation, and example usage.
- Expanded tests to 100% coverage and standardized lint/coverage tooling.
- Standardized Node.js 26 CI and repository housekeeping.

## 1.1.2 — 2026-07-01

- Refreshed package metadata, dependencies, and lockfile.

## 1.1.1 — 2025-12-09

- Refreshed package metadata, dependencies, and lockfile.

## 1.1.4 — 2026-08-06

- Added `AGENTS.md` with development conventions, lifecycle guidance, validation commands, API compatibility requirements, and release workflow rules.
