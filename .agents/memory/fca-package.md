---
name: FCA Package Names
description: Correct npm package name for NeoKEX's Facebook Chat API — used everywhere login, stats, and anti-suspension are referenced
---

The canonical package is `@lazyneoaz/metachat` (NeoKEX's updated GitHub username is `lazyneoaz`).

**Stale names to never use:**
- `@neoaz07/nkxfca` — old username, old package name
- `@lazyneoaz/nkxfca` — old package name under new username
- `fca-neokex` — entirely different abandoned fork
- `nkx-fca` — shorthand that maps to none of the above

**Why:** NeoKEX renamed their GitHub from `neoaz07` → `lazyneoaz` and renamed the package to `metachat`. Multiple files in the codebase had stale references that caused import failures and wrong version display on the dashboard stats page.

**How to apply:** Any time you see `require(...)` or `package.json` reference to an FCA library, verify it is `@lazyneoaz/metachat`. Internal sub-paths like `src/utils/antiSuspension` exist in that package and are valid.
