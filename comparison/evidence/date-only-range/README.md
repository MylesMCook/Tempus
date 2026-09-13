# Date-only range journeys

`Time off from 2026-09-13 to 2026-09-18` now asks to confirm the event title, then asks whether the last date is included. “End before 2026-09-18 begins” produces September 13 through exclusive September 18. “Include all of 2026-09-18” produces an exclusive September 19 end. The result stays all-day; no appointment clock is inferred. Numeric-date choices precede the boundary question. Conflicting boundary answers reopen it; edits invalidate the choices.

Both choices pass in desktop Chrome 153 at widths 320 and 1280 through title confirmation, boundary selection, visible result, actual file download and edit invalidation. Input/title stay intact and no horizontal overflow is observed. The runner uses direct focus and Enter, not full Tab traversal. These widths are not physical-phone evidence.

The initial 320px run timed out on Download and the following case inherited stale state; desktop cases passed. The runner now waits until Download is enabled and clears input between tasks. The retry passes all four cases. Both reports and their files remain here; no application code changed between those browser runs.

Locked Python icalendar 7.3.0 and recurring-ical-events 3.8.2 validate all four downloaded files: DATE-valued start/end, exact exclusive end, title, one event, no duration/rule and no extra events across a ten-year query. This is file validation, not calendar-client import.

All 810 shared tests pass. The new six tests cover both boundary policies, numeric-date and conflicting-answer recovery, dependent choice invalidation, DST civil boundaries, mixed-time/arithmetic rejection and the year limit. Existing timed range tests pass. The first new test run omitted the existing title-confirmation step; fixtures now explicitly exercise it. An initial build caught a possibly-undefined test selection; it was corrected. Production build and scoped lint pass. The client retains its size warning at 909.81 kB minified / 267.57 kB gzip. The subsequent targeted plus comparison run passes 19 tests.

Reproduce against the task-local app at loopback 5174 with `node examples/app/verify-date-only-range.mjs PLAYWRIGHT-ENTRY NEW-output-directory`, then `uv run --locked examples/app/read-date-only-range.py NEW-output-directory`. Source and runner hashes are in the browser reports; reader dependencies have a script lockfile.

Mixed date/time endpoints still require the user to write the missing clock; selectable recovery remains open. The current archive 7fa6dd57 and its comparison replay predate this source change. Packed verification, broader conflict recovery, physical devices, actual imports and independent evaluation remain open. No push, publication, deployment, cloud mutation or calendar write occurred.
