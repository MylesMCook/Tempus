# Packed correction-precision browser and Worker checks

Archive `7d1907c6674485eee8d1df072f5d4b6138a949e88a1f71999377a29f67d8255a`, September 13, 2026. This directly executes the archive already verified in [Node 22/26](../precision-sdk/README.md).

Six browser/viewport runs pass: Chrome 153.0.8010.36, Firefox 148.0.2 and WebKit 26.4, each at 320/1280 px. Each run completes four correction/download paths: date-only replacement, all-day alternative, weekly recurrence with a repeated-clock choice, and mixed-month year/time selection. Both precision paths check exact visible labels, keyboard selection, input preservation, complete file download and stale-export prevention after changing the event text. Existing restart, blocked/invalid and layout checks remain. All 24 actual downloads pass locked Python readback.

WebKit uses explicit Option-Tab; the historical ordinary-Tab failure remains open. Desktop engines and viewport sizing do not establish Safari.app, physical-device or screen-reader behavior. The browser report records zero errors and unexpected requests in these runs.

Local Wrangler 4.131.1/workerd passes the same precision-label, file and edit checks, plus existing weekly/monthly/list paths and all seven file failure codes. Its installed diagnostic TypeScript check passes. The two precision files and three prior categories all pass locked Python readback, for five Worker files. Date-only points contain civil DTSTART with no DTEND or DURATION; all-day intervals have the correct exclusive civil end. Titles remain Call Sam.

Reproduce with `examples/sdk/verify-browser.mjs` and `verification-worker.ts` against a fresh installed archive, then `read-browser-files.py` and `read-worker-files.py` with their locked dependencies. Copy the example/config into the installation before starting loopback-only servers. The retained provenance records runner hashes. Both task-local servers were stopped afterward; the main app was left running.

These are authored integration checks and file validation, not actual calendar-client imports, independent accuracy evidence or comparative performance. Ongoing recurrence compatibility failures remain open. No calendars were written and nothing was published or deployed.
