# Timezone correction against the built app

The existing complete timezone-correction journey passes against current built assets on loopback port 5175. Its runner now accepts `TEMPUS_APP_URL` and rejects non-loopback hosts; the default development URL remains unchanged. App and SDK code did not change in this milestone.

Chrome 153 at 320/1280 pixels resolves a date-list reminder in Chicago, opens export review and sets a custom title. Changing to UTC removes export access and clears clarification. After answering again, the review uses the original event title and the downloaded files contain September 30, October 2 and October 4, 2026 at 12:00 UTC, rather than the old Chicago 17:00 UTC instants. Invalid-zone editing and a later reference refresh each remove export access again. Original input remains intact.

The locked separate reader accepts both files and verifies title, exact starts and absence of invented durations. This is corrected download evidence, not a calendar import. Interaction uses direct focus and Enter; it does not establish sequential-Tab, screen-reader or physical-phone behavior. Scoped runner lint passes.

Source inspection found that timezone edits clear selections before updating settings; the home calculation depends on both timezone and reference. Persisted settings validate timezone names against pinned data and fall back for invalid stored values. The app does not restore a prior phrase or resolved event from storage. No stale-result flaw was confirmed in this path. This is a narrow lifecycle review, not the accumulated security review or proof of every setting transition.

Reproduce from the repository root with a current build and `node examples/app/serve-built.mjs` running:

```sh
TEMPUS_APP_URL=http://127.0.0.1:5175 node examples/app/verify-context-reset.mjs /absolute/playwright-core/index.mjs /absolute/NEW-report-directory
uv run --locked examples/app/read-reminder.py /absolute/NEW-report-directory
```

The task-local server was stopped after checking. No cloud change, publication or calendar write occurred. Raw files, reader results, source hashes and the exact runner are retained here. TypeScript source copies use `.txt` so they are not compiled. The SDK remains e70f6d12; independent evaluation, devices, ongoing-export policy and actual import gates remain open.
