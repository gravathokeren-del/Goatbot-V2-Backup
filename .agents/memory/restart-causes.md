---
name: 24h restart causes
description: What caused the bot to restart every 24 hours and how each was fixed
---

## Root Causes of 24-hour Restart

**1. `intervalGetNewCookie: 1440` in config.json**  
After 1440 minutes (24h), `refreshCookie()` fires and calls `startBot(appState)`, which stops MQTT, resets all command Maps, reloads all scripts, and reconnects — a full bot restart.  
**Fix:** Set `intervalGetNewCookie: null` to disable. Only needed for email/password auth; cookie-based auth doesn't benefit.

**2. `process.exit()` on GBAN check network failure (login.js)**  
`axios.get(gban.json)` had no error handling. If GitHub was unreachable, the bot exited — restarts trigger on every `startBot()` call.  
**Fix:** Wrapped in `try/catch`, sets `dataGban = {}` and continues.

**3. `process.exit()` on notification fetch failure (login.js)**  
Same pattern — `axios.get(notification.txt)` failed → exit.  
**Fix:** Wrapped in `try/catch`, sets `notification = ""` and continues.

**4. `startBot()` `tooOldVersions.txt` fetch had no error handling**  
Any GitHub network timeout caused an unhandled rejection crash.  
**Fix:** Wrapped in `try/catch` with 10s timeout; logs warning and continues.

**5. `onReply`/`onReaction` reset to plain `new Map()` on re-login**  
On each `startBot()` call, these were reset to plain Maps — losing TTL protection and leaking memory.  
**Fix:** Extracted `TTLMap` to `func/TTLMap.js`; both `Goat.js` and `login.js` now import and use it.

**Why:** Network calls to GitHub (gban, notifications, version check) all had `process.exit()` as error handler — fine on a VPS with stable internet, fatal on Render's free tier which has unreliable outbound connections at startup.

**How to apply:** Any new network call in the login flow must be wrapped in `try/catch` that logs a warning and continues — never `process.exit()` on a non-critical fetch.
