# Counted schedule journeys

Current source completes two authored main-app tasks at desktop Chrome widths 320 and 1280: a five-Monday schedule beyond the three-row preview, and a three-occurrence day-31 schedule after choosing the last day of shorter months. Both retain input and title, show the requested total, download a finite file and invalidate export state after an edit. Four actual downloads pass exact date/count readback with Python icalendar 7.3.0 and recurring-ical-events 3.8.2. This validates files, not calendar-client imports.

The first attempt in `../count-journeys/` downloaded the weekly file and timed out during monthly download. Its runner could focus/press Enter before the download button became enabled. The retry explicitly waits for that state and passes. The original report remains failed. A separate new regression test initially failed because its choice lookup assumed milliseconds in an ISO choice ID; the corrected lookup passes and checks that a selected past fold instant cannot silently consume a different future week.

All 782 shared tests pass. Task-owned lint, application TypeScript and production build pass. Client bundle remains above the existing 500 kB warning threshold (904.88 kB minified / 266.43 kB gzip). These are development checks, not independent language evaluation or competitive superiority.

Reproduce with `node examples/app/verify-count.mjs PLAYWRIGHT-ENTRY NEW-output-directory` against the existing loopback development app on port 5174, then `uv run examples/app/read-count.py NEW-output-directory`. The reader locks four scenario/viewport identities, verifies downloaded hashes, rejects RRULE/duration/end fields for these point cases and checks every expanded start over ten years. File dates are finite explicit recurrence dates.

No new SDK archive was built or runtime-validated. Archive `47a218ba` remains historical to this source change. Count-slot clarification for exclusions and past starts remains open, as do actual imports, physical devices and independent evaluation. See [the count contract](../../../docs/occurrence-counts.md). No push, publication, deployment or calendar write occurred.
