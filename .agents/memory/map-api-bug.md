---
name: Map vs Array API — createThreadDataError
description: createThreadDataError is a Map (not an Array); wrong method caused silent broken-thread retry loops and memory leaks
---

`global.temp.createThreadDataError` is declared as `new Map()` in `Goat.js`.

**Rule:** Use `.has(key)` / `.set(key, val)` / `.delete(key)` / `.get(key)` — never `.includes()`, `.push()`, or `.find()`.

**Why:** `handlerEvents.js` had `.includes(threadID)` which is an Array method. On a Map it is `undefined`, so the expression always returned falsy — meaning broken threads were retried endlessly instead of being skipped, wasting CPU and contributing to memory pressure.

**How to apply:** Any time you interact with `createThreadDataError`, confirm you are using Map API. The error-check guard in `handlerEvents.js` is `.has()`, and in `handlerCheckData.js` errors are stored with `.set(threadID, Date.now())`.
