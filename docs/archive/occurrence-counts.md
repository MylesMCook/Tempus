# Count-bounded schedules

Current source supports explicit counts of 1–1,000, written as digits or the words one through ten, before optional start/end boundaries. Weekly/daily/monthly schedules retain their duration and calendar policies. Complete export expands the requested count rather than exporting only the preview. The total is visible in the app and copied preview.

Counts with exclusions now ask whether excluded dates consume count slots or are replaced. The first three resulting local dates appear in each choice; larger previews are marked. Only exclusions matching the cadence consume slots. A fully excluded count stays empty. Written past starts now ask whether the count includes past starts or only upcoming starts. Both choices preserve the original cadence anchor. Insufficient end boundaries and capacity overruns fail explicitly. A short-month policy or occurrence-specific DST choice remains required where applicable. Packed archive `47a218ba` predates this implementation; current-source evidence must not be presented as verification of a new SDK archive.

## Acceptance cases for implementation

These are authored development requirements, not independent evaluation cases. Use reference `2026-09-12T16:00:00Z` and `America/Chicago` unless a case specifies otherwise. Preserve the full input and event text through every choice.

| Task                                                                       | Required behavior                                                                                                                                                      |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Call Sam every Monday at noon for 3 occurrences`                          | Three starts: September 14, 21 and 28 at noon Chicago; complete file contains exactly those starts. A preview limit of one must not shorten the file.                  |
| Same request with `for 30 minutes` before the count                        | Three intervals, each with its own exact end. Duration and count must remain separate fields.                                                                          |
| Same request, excluding September 21                                       | Ask whether the excluded date uses one of the three slots. Show the resulting dates for each choice; do not assume the answer or silently extend the series.           |
| Three occurrences starting September 7                                     | Ask whether the count includes the past start or means three upcoming starts. Do not reset a written start anchor when the reference changes.                          |
| Three occurrences with an earlier `until` boundary                         | Preserve both constraints. Show that the end boundary prevents reaching three, and require a concrete correction before presenting a complete three-occurrence result. |
| Monthly day 31 for three occurrences                                       | Resolve the existing skip/last-day policy first. Count actual scheduled starts under that policy; a skipped month is not an invented appointment.                      |
| Sunday 1:30 AM starting November 1 for three occurrences                   | Ask for the repeated clock on November 1. Retain the count and choice; later Sundays retain the written wall time. Validate all exported starts independently.         |
| Ambiguous clock after the displayed preview                                | Complete export must ask about that occurrence; preview success cannot authorize a partial file.                                                                       |
| Count of zero, negative, fractional or above export capacity               | Explain the invalid count or capacity. Do not cap, round, ignore or convert it to a duration.                                                                          |
| Edit count, exclusion, timezone or reference after choosing/export preview | Invalidate stale decisions and export state. Re-resolve the complete current request.                                                                                  |

The remaining journey is input → count/boundary clarification → inspect full requested extent → explicit file action → independent file readback → edit invalidation. Desktop browser and packed runtime verification must follow implementation. Actual calendar-client import remains a separate authorized test.

## Implementation boundary

Keep count resolution in the existing recurrence resolver and complete-export path. The optional `rule.count` field records the requested total. Existing monthly and clock selection history applies. The optional `rule.countExclusions` is `consume` or `replace`; replacing that answer clears dependent occurrence-clock choices. Changing the monthly policy also clears the count answer. The three-row preview is a display limit, not a recurrence count. Keep strict calculator/API v2 unchanged.

Do not implement count support by removing the suffix, taking the current preview, or converting an occurrence count into an inferred end date. Recurrence traversal begins at the reference date; counted schedules with past written starts require an explicit `countPast` policy rather than silently choosing what consumes a slot. An excluded skipped or repeated clock straddling the reference asks which start instant determines its count slot. Without a written start boundary, a selected past instant does not consume an upcoming slot; a selected future instant does. No event is created on that excluded date. With a written start boundary, the selected past-count policy determines whether that instant consumes a slot. The existing 1,000-event and ten-year export limits remain explicit failures, never silent truncation.

[Current-source evidence](../../comparison/evidence/count-journeys-retry/README.md) covers weekly and monthly correction-to-file journeys, four independently read downloads, 782 shared tests and the production build. This is not packed runtime, physical-device, actual calendar import or independent language-evaluation evidence.

[Count-exclusion source evidence](../../comparison/evidence/count-exclusion-files-retry/README.md) now covers both policies through complete downloads and edit invalidation, with eight independently read files and 788 shared tests. The existing packed archive predates this addition.

[Excluded-clock source journeys](../../comparison/evidence/excluded-clock-journeys/README.md) pass both choices for spring/fall transitions at two desktop widths, with eight independently read downloads and 793 shared tests.

## Written past starts

`rule.countPast` is `consume` (count from the written start) or `upcoming` (count upcoming starts while retaining the written cadence). The question shows up to three future dates for each choice. Neither choice exports past events. Exhausted counts remain empty; insufficient end boundaries fail instead of extending the schedule. The file description records the policy.

A past-count change clears dependent exclusion and clock answers; a monthly-policy change clears both count policies. Exclusion changes retain the past policy. Conflicting raw answers reopen clarification; input/context edits invalidate history. Past starts whose two clock interpretations are both before the reference can consume a slot without inventing an instant or resolving an irrelevant end. A clock straddling the reference still needs a selectable instant.

[Written-start source evidence](../../comparison/evidence/count-past-journeys/README.md) covers both policies through future-only files and edit invalidation, plus cadence, exclusions, empty results and DST source checks. The latest packed archive still predates these changes.
