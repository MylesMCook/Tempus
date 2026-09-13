# Monthly reminder journey

Monthly reminders remain an open product-matrix gate. Implement the interpretation, clarification, preview and file together; accepting monthly syntax with a weekly export is a failure.

## User task and acceptance cases

- `Remind me to pay rent every month on the first at noon`: retain pay rent and the original date span; show the next three monthly starts in the selected timezone; export a monthly rule that keeps noon through offset changes when preflight permits it.
- `Call Sam every month on the 31st at noon`: ask what happens in months without that date. Offer skipping that month or using its last valid date. Do not silently apply the calculator's clamping policy to a schedule.
- `Call Sam every month on the 30th at 9am for half an hour starting 2026-01-01 until 2026-05-31 except 2026-03-30`: preserve the chosen short-month policy, duration, bounds and exclusion through the complete file. Ask before resolving February; do not move the March exclusion to another day.
- A monthly occurrence at a repeated or missing local clock uses the existing occurrence-specific question. A short-month choice and a clock choice are separate decisions; each survives the other and both invalidate after input, timezone or reference edits.
- An unbounded monthly schedule that encounters an unresolved future clock remains an unfinished task. It must not export a weekly substitute, an invented end date or only its preview.

These are authored development acceptance cases, not independent evaluation data. Check the exact dates before writing expected timestamps.

## Implementation boundary

1. Make the rule a discriminated weekly/monthly type. Keep shared clock, duration, bounds and exclusion fields. Monthly rules carry a day of month and an explicit short-month policy where necessary; weekday fields must not masquerade as monthly semantics.
2. Separate candidate-date enumeration from existing occurrence resolution. Reuse point/interval calculation, occurrence clock decisions, complete-output limits and source preservation. Protect the weekly and multi-week regressions during extraction.
3. Show a monthly repeat label and the selected short-month policy in preview and copied output. Bind the new policy question to the existing original-input/context identity; do not store it as a fabricated clock instant.
4. Generate complete bounded output using the existing explicit-event serializer. For ongoing rules, verify monthly RFC recurrence encoding and generalize clock/interval preflight to the same date-selection policy. Do not reuse a weekday-only preflight for monthly rules.
5. Keep strict calculator/API v2 behavior unchanged. `January 31 plus one month` continues to clamp; that does not settle the meaning of a monthly reminder on the 31st.

## Verification and release gates

- Resolve both short-month choices across leap/non-leap February, 30-day months, year boundaries and a reference after the first requested date. Preserve the written day as the anchor; a February clamp must not turn March into the 28th.
- Validate bounded files with both existing readers. Validate ongoing monthly occurrence expansion separately, including exclusions and offset transitions. File checks are not calendar-client imports.
- Exercise keyboard correction, readable policy, complete download, restart and edit invalidation at narrow and desktop widths. Keep ambiguous results out of export.
- Validate the resulting packed SDK in the recorded Node/browser/Worker environments. Preserve historical weekly/performance reports and report regressions plainly.
- Actual client imports still require authorization. Independent evaluation and physical-device checks remain open even if the development cases pass.

Monthly implementation is partial; the acceptance cases above are unchanged. The existing ongoing elapsed-duration decision remains pending; this work does not enable that experimental export path.

## Implementation progress

Per-occurrence point, interval and clock-choice resolution now lives in one helper, separate from weekly date enumeration. This preparation adds no monthly syntax or export support. SDK compilation and the six targeted suites pass (92 checks, including 17 source-to-file journeys). The retained packed candidate predates this extraction.

Monthly parsing now supports numeric month days and first/second/third, explicit clocks/ranges/durations, boundaries and exclusions. Days 29–31 ask for a short-month choice; the selection and occurrence clock answers survive each other and invalidate after edits. Bounded files contain the complete set. Ongoing point rules pass preflight using monthly date selection; skip policy and day-31 last-day encoding have scoped file evidence.

Still unfinished: ongoing monthly intervals and ongoing last-day clamping for days 29/30. The initial BYMONTHDAY/BYSETPOS encoding failed ical.js expansion (March 28 and 29 appeared instead of March 31). Day 31 now uses BYMONTHDAY=-1; unsupported day-29/30 clamping is explicitly blocked rather than exporting the failing encoding. No acceptance gate was relaxed.

Ten new source tests cover policy/clock recovery, stale/conflicting answers, missing clocks, leap February, retained day anchors, finite exclusions and unresolved future clocks. A Chrome 153 keyboard journey at 320 px downloads four monthly intervals and invalidates the export after editing. Both readers validate that file; the Python reader separately expands ongoing skip/last-day-31 files through December 2028. These are file and desktop-emulation checks, not client imports or physical-device evidence.

The subsequent interval milestone implements monthly start-date selection in offset-crossing checks and shifts end-clock checks back to the original monthly date. Ordinary half-hour and overnight monthly schedules can now export. A later repeated next-day endpoint and a 14-day interval crossing DST remain blocked. Two readers agree on 4,799 half-hour occurrences from 2026 through 2425 with one exact exclusion. The previous blanket monthly-interval block is superseded by these checks; the clock-change policy gate is unchanged.

Current packed archive `953106eb…` includes this work: 54 matching installed files, four Node examples on versions 22/26, declaration checks, three browser engines, local Worker and eight independently read runtime files. Performance reports for the earlier archive are not current-candidate measurements.

The [five-candidate compatibility probe](../comparison/calendar/README.md#monthly-clamping-compatibility) confirms the remaining day-29/30 problem: Python passes the BYSETPOS clamp, ical.js emits extra dates, and the standards-defined RSCALE/SKIP alternative fails both readers. The control (last day of every month) passes both. This narrows the blocker to interoperable ongoing encoding; the monthly parser and bounded file are not the source of that mismatch. Target-client import evidence remains unavailable and unauthorized. No encoding or client-support assumption was added to the app.

## Two-series export candidate

A [new diagnostic](../comparison/calendar/README.md#two-series-monthly-clamping-candidate) passes both readers for four noon/30-minute files: days 29/30, UTC/Chicago, 4,798 occurrences per file across 2026–2425 with exclusions. It uses separate February and non-February series. The prior single-series reader failures remain failures.

This may provide faithful occurrence dates, but does not preserve single-series editing/deletion. Actual imports, arbitrary start dates/clocks, app review/download behavior and packed SDK support for this representation remain unverified. The explicit opt-in versus retaining the current block is a pending product decision. No implementation or calendar action was enabled by the diagnostic.

The [retained monthly diagnostic snapshot](../comparison/evidence/monthly-compatibility/README.md) now makes both sets of results available in the repository, including failed files and exact reproduction commands. All nine calendar files match the earlier artifacts byte for byte. This closes a portability gap for these diagnostics only; product decisions and client/device checks remain open.
