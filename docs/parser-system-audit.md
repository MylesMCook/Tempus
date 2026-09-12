# Parser and system logic audit

## Result

The initial targeted audit reproduced 21 failures across 25 cases. The repairs retain the existing small parser and make its supported grammar explicit. The calculator now uses the debug calculation’s result directly, so its explanation cannot come from a second parse with a different clock or setting.

## Findings and repairs

| Priority | Finding                                                                                                                                                               | Repair and evidence                                                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High     | January 31 plus a month rolled to March 3; leap-day plus a year could roll into March. Repeated month changes could drift by months.                                  | Clamp to the destination month’s last valid day. Preserve mode can restore the original day in a later month; disabled mode retains the clamped day. Exact-date and trace tests cover both. |
| High     | Incomplete input such as `in`, `today plus`, or `today nonsense` returned a plausible date. Numeric date syntax and compound number words were partially interpreted. | Validate the entire normalized expression before selecting an anchor. Unsupported, incomplete, ambiguous, and out-of-range inputs return no result; the API returns JSON 400.               |
| High     | `2 days from today` and `2 days before tomorrow` ignored the explicit anchor.                                                                                         | Resolve explicit relative anchors before the default current-time base. Fixed-clock tests assert both the date and midnight.                                                                |
| Medium   | `next friday` unnecessarily skipped an upcoming Friday, while `friday next week` ignored next week.                                                                   | Define next weekday as the nearest future occurrence, excluding today. Explicit next/last week uses Monday-based calendar weeks. Trace describes the selected rule.                         |
| Medium   | Oversized arithmetic could produce Invalid Date and throw during ISO serialization.                                                                                   | Bound parser input and reject non-finite date results before output. Worker regression test verifies JSON 400 and no-store.                                                                 |
| Medium   | Debug mode ignored the requested preserve-day setting and reported operations in input order, not execution order.                                                    | Capture settings and one clock per evaluation; record before/after snapshots inside the real operation loop. Calculator and trace share the result.                                         |
| Medium   | Corrupt stored settings could break rendering; denied/full localStorage could throw from the settings effect.                                                         | Validate known field types, lengths, and timezone; recover defaults; catch write failures and show that settings will not survive reload.                                                   |
| Low      | API metadata misclassified simple relative expressions and matched `day` inside `yesterday`; sub-day units were missing.                                              | Classify whole words and include hours, minutes, and seconds. Response-shape tests cover these cases.                                                                                       |

## Defined behavior and limits

- Supported examples include all 27 phrases shown in the UI. Tests assert their complete local year/month/day/hour/minute under a fixed clock, not merely a non-null result.
- Named dates without a year use the current year, even if already past. A standalone day number selects its next valid future midnight. Bare numeric anchors in larger expressions are rejected.
- Weekdays preserve the current time. Today/tomorrow/yesterday use local midnight. Offset-only expressions start at the current time.
- Operations retain larger-unit-first execution, with stable order for equal units. This is not general left-to-right arithmetic; the trace exposes the actual order.
- Fractional conversions retain the existing rounding rules: days/weeks round to hours; months use 30.436875 days and round to whole days; years split into whole months and remaining days using 365.25; smaller time units round to the next smaller unit. Tiny fractions can round to zero. These are approximate calendar conversions.
- The UI calculates in the browser timezone. The production Worker calculates in UTC. The timezone option formats the resulting instant; it does not change calendar arithmetic. Independent evaluations also have different capture times. This boundary remains explicit in the UI; timezone-aware parsing is not implemented.
- The API’s omitted preserve-day option remains false for compatibility; the calculator default remains true and the playground sends it explicitly.
- The trace updates on phrase/month-setting edits, and its display updates on timezone/format edits. An unchanged `now` result is a snapshot, not a continuous clock.
- This is a finite English grammar. Numeric dates, compound numbers such as `twenty one`, implicit `last month`, time-of-day syntax, holidays, business days, and arbitrary prose are not supported. Rejection is deliberate.

## System checks

Worker routing, GET/OPTIONS/405 behavior, JSON errors, schema limits, output formatting, CORS, and no-store handling are covered. The API is an intentionally public, stateless calculation endpoint; no account or database migration is involved. This review does not include load testing, infrastructure penetration testing, or exhaustive language coverage.

The existing GitHub deployment secret is still invalid. The user-authorized Wrangler OAuth fallback remains the release path until that credential handoff is completed. No host service, network, dependency, or credential changes were made.

## Verification

- Fixed-clock tests cover every advertised example, invalid inputs, month-end/leap-year behavior, exact trace continuity, settings, metadata, and Worker responses.
- The arithmetic suite passed under UTC, America/New_York, and Asia/Tokyo. The daylight-saving test distinguishes calendar-day arithmetic from a fixed 24-hour duration.
- Browser and final deployment verification are recorded in `tasks.md`.
