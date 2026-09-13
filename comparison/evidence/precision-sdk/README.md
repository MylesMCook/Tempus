# Correction precision in the packed SDK

Archive `7d1907c6674485eee8d1df072f5d4b6138a949e88a1f71999377a29f67d8255a`, September 13, 2026. All 56 installed files match the private archive. Five examples each pass Node 22.12.0 and 26.8.1. Installed browser/calendar/Worker TypeScript declarations pass.

The reusable `examples/sdk/state.mjs` now checks a timed-to-date-only correction and an all-day alternative: exact choice labels, original input/event span, successful civil-date file output, and stale-answer rejection after editing. This supplements the main-app desktop/file-reader checks in [correction precision](../correction-precision/README.md).

The archive comparison against 1dbb7a0b identifies exactly one changed file: `dist/interpret-date.js`. Its inspected diff only adds date-only/all-day description branches. All other 55 files, including declarations, dependencies, timezone data and serializer code, are byte-identical. This comparison is not execution evidence for browsers or Workers. Their prior runtime reports remain historical; direct packed checks of the new labels there remain open. No deployment, calendar import, physical-device, independent-evaluation or performance claim follows.

Reproduce the Node checks using `examples/sdk/verify-package.mjs` with a fresh scratch destination and supported Node runtime. The runner records the example source hashes and archive identity. Both retained reports are successful runs of the same archive.
