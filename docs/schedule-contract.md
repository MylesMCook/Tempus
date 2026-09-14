# Schedule interpretation contract

This contract defines scheduling behavior alongside the original calculator. Points, intervals, weekly/monthly recurrence and finite weekday/date collections have implemented paths; the export limits below still apply. Numeric date-order, two-clause corrections, endpoint DST choices and arithmetic-step clock choices are selectable. Equal-clock ranges can be confirmed to end on the next date. Complete ongoing recurrence export and broader conflict recovery remain open. Strict calculator/API v2 behavior stays unchanged; new schedule behavior belongs in the interpretation API.

## Values and context

Every request uses an explicit reference instant and IANA timezone. Preserve the original input, source spans, event text and assumptions. Recognition proposes a complete value; calendar resolution validates it. Unknown trailing date words, durations and exceptions cannot be discarded to obtain a successful point.

| Value      | Required meaning                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Point      | One instant, with whether a clock was supplied or defaulted. A date-only expression must retain that precision for future export                                    |
| Interval   | Start and exclusive end, timezone and all-day/timed classification. End must follow start. Keep calendar duration distinct from elapsed duration                    |
| Schedule   | Recurrence definition, timezone, duration, boundaries and exceptions, plus a bounded preview. Preview truncation is explicit; a preview is not the full schedule    |
| Unresolved | Needs clarification, unsupported, or no scheduling expression. No usable export value. Retain original text and explain the specific missing decision or capability |

Do not expose interval or schedule union variants as supported until resolution and consumer handling exist. Existing point consumers must not silently use the first endpoint or occurrence.

## Interpretation policies

| Input or condition                   | Policy                                                                                                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `for 3 days from today`              | Calendar interval beginning at local midnight today, ending at exclusive midnight three calendar days later                                                    |
| `3 days from today`                  | Date offset, not a duration interval                                                                                                                           |
| `for 24 hours from now`              | Timed interval lasting 24 elapsed hours from the reference instant                                                                                             |
| `Friday 10pm–12am`                   | Upcoming Friday through following midnight; retain the overnight date change                                                                                   |
| A range whose end precedes its start | Clock-only ends can roll overnight; unqualified weekday ends are anchored to the start date as described below. Explicit contradictory dates remain unresolved |
| Equal clock endpoints                | Offer explicit confirmation of the same clock on the next date, or let the user edit. Zero-length intervals remain invalid; use a point for an instant         |
| Bare `8` without AM/PM               | Clarify unless a documented, explicit user preference resolves it                                                                                              |
| Numeric `03/04/2027`                 | Clarify without a date-order preference. Do not infer locale from server location                                                                              |
| Repeated or nonexistent local clock  | Show the concrete alternatives or request another time. Never silently select a DST offset or shift a nonexistent clock                                        |
| `Friday, actually Saturday instead`  | Ask whether Saturday replaces Friday. A selected answer resolves the candidate; editing text or context invalidates that selection                             |
| Cancellation or prohibition          | No scheduling event. Mention extraction is a separate contract and must not be scored as equivalent                                                            |
| Conditions and exceptions            | Represent them completely or return unresolved; never omit them to export a simpler schedule                                                                   |
| Recurrence                           | Preserve local wall time across DST; use explicit bounds/limits. Clarify any occurrence that lands on an unresolved DST clock before export                    |

Calendar arithmetic retains written order, stepwise month-end clamping and labeled fractional approximations. A whole calendar day can have 23 or 25 elapsed hours. Do not convert it to 24 hours for convenience.

## Weekday policy boundary

Scheduling interpretation treats a bare weekday as including today when its clock is still ahead; date-only weekdays include the current civil date. A past clock advances to next week. Explicit `next`, `last` and `this` retain their meaning, and arithmetic expressions keep strict calculator behavior. A repeated or skipped current-day clock stays unresolved.

In a range such as `from Friday to Monday`, the unqualified end weekday is the matching weekday on or after the resolved start date, crossing the week boundary when necessary. The same weekday stays on the same date, not an inferred extra week; equal/reversed timed endpoints remain invalid. Explicit dates and qualified weekdays are never silently moved. Date-only ranges still ask whether to include the final civil date.

Clock ranges accept date-first and clock-first wording, including `tomorrow between 9am and 5pm`, `between 9am and 5pm tomorrow`, and `9am–5pm tomorrow`. Hyphen, en-dash and em-dash clock separators are supported. The entire range must be understood; this does not change arithmetic or ISO date separators.

The strict calculator/API v2 continues to treat bare weekdays as next occurrences excluding today. This distinction was exposed by correction acceptance tests; it is intentional and must be reported as a policy difference in comparisons. The interpreter records its effective `this` expression for reproducibility.

## Protected development contrasts

These expectations define interval contrasts. They are inspected development cases, not a holdout. Context is September 12, 2026 at 11:00 America/Chicago unless overridden.

| Input                                   | Expected value or decision                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `set OOO for 3 days from today`         | All-day interval: September 12 through exclusive September 15; UTC endpoints 05:00Z on each date |
| `3 days from today`                     | September 15 at local midnight; no interval                                                      |
| `September 14, 2026 from 9 am to 11 am` | Timed interval 14:00Z–16:00Z on September 14                                                     |
| `Friday 10pm-12am`                      | September 19 03:00Z–05:00Z, corresponding to Friday night in Chicago                             |
| `March 8, 2026 from 1 am to 3 am`       | 07:00Z–08:00Z: two displayed clock hours, one elapsed hour                                       |
| `March 8, 2026 at 2:30 am`              | Needs clarification: local clock does not exist                                                  |
| `November 1, 2026 at 1:30 am`           | Needs clarification: 06:30Z or 07:30Z                                                            |
| `Friday 10pm-10pm`                      | Needs clarification; not an automatic 24-hour interval                                           |

Expected answers must be reviewed independently of parser outputs. The interval milestone ends when these contrasts, additional independently authored variations, existing arithmetic regressions and UI consumers pass. Recurrence and export remain separate gates in the [product matrix](product-matrix.md).

Clock-choice provenance: the selected instant is evaluated as an explicit reference through the unchanged calculator. Its trace labels the user decision; it does not pretend the original ambiguous expression was accepted by strict v2. Strict API replay is unavailable for that interpretation. Gap options show the actual replacement clock and offset, and never apply without selection.

## Weekly preview contract

The internal weekly resolver accepts one to seven distinct named weekdays with a shared explicit clock or clock range. Use commas or `and` between weekdays, as in `every Monday, Wednesday and Friday at noon`; plural shorthand such as `Mondays at noon` is also recognized. Weekday order does not change chronological preview order. Duplicate weekdays are rejected. Optional `starting` and `until` boundaries accept ISO, named or relative calendar dates resolved against the supplied reference and timezone; ambiguous numeric dates require a choice. Both dates include occurrences starting on that date. Exceptions still require ISO dates and exclude occurrences by their local start date, including overnight ranges. Only occurrences starting at or after the reference instant appear in the preview; an already-started occurrence is not upcoming.

Preview limits are 1–100 occurrences (default 3), with at most 10 excluded dates. `truncated` means another occurrence exists beyond the returned preview. An empty finite schedule is distinct from an invalid schedule. A DST-ambiguous occurrence prevents partial success until its occurrence-specific clock choices are answered.

The rule retains local clocks and timezone, not fixed UTC spacing. Its `preview-only` status describes the interpretation result, not export eligibility. A separate export planner resolves the complete requested schedule and checks whether it can produce a file. Copy remains labeled as a preview and is disabled for an empty result. Monthly/yearly rules and broader exception language remain open. See the export boundary below; a valid preview alone never authorizes a file or calendar write.

## Finite weekday groups

Inputs such as `Sat Sun 1pm-8pm Mon 10pm-12am` produce a collection of one-time intervals, in source order. Each day uses the scheduling weekday policy above; there is no inferred repeating rule. Groups can be separated by spaces, commas or semicolons. Each occurrence retains its complete group source span, including any event-prefix offset.

All text must be consumed. Unknown qualifiers, invalid intervals and duplicated identical intervals prevent partial success. At most 14 intervals are accepted within the existing 200-character input limit. Recurrence and finite collections share the occurrence preview UI, with distinct labels and complete copy output. Arbitrary date lists remain a separate coverage gap. Recurring weekday lists use the explicit `every` grammar above.

## Equal-clock range confirmation

A single range such as `Friday 8pm-8pm` remains unresolved until the user confirms the next-date endpoint. The choice names the exact end date, clock, timezone and UTC offset. The resulting timed interval spans one calendar day; DST can make that 23 or 25 elapsed hours. It is not an all-day event. Original input/event spans are retained, the assumption is explicit, and editing input or context invalidates the choice.

Clock choices and next-date confirmation are separate decisions. An ambiguous endpoint asks for its clock occurrence or replacement first; the range remains unresolved until all required decisions are made. For a multi-range collection, confirmation applies separately to each named range; it never changes the other ranges. This confirmation does not apply to an entire recurrence. A zero-length interval is not another valid option under the positive-duration contract; users who mean a single instant can edit the range to a point.

The unpublished SDK candidate now uses `rule.weekdays` (ISO Monday = 1 through Sunday = 7, sorted and unique) instead of the earlier singular `rule.weekday`. This is a candidate type change, not a published compatibility guarantee. Preview limits count total occurrences across the selected days, not occurrences per weekday.

## Point precision

Resolved points now carry `precision: date | time` and `clockSource: explicit | reference | arithmetic | default`. An explicit clock wins, including midnight and selected DST occurrences. An implicit `now` anchor retains reference-time precision. On a date-only anchor, elapsed-time units or an arithmetic step that changes the local clock introduce time precision, even if later steps return to midnight. Otherwise the point remains date-only with the evaluator's default midnight. Whole calendar operations can therefore remain date-only, including fractional years that resolve to whole months.

Numeric-date and correction choices retain the chosen point's precision. These are interpretation/SDK fields; strict calculator/API v2 output is unchanged. The interface labels date-only results and copied text as having no specified time. Calendar preparation still requires an explicit export representation; metadata does not authorize a write.

## Daily and weekly cadence forms

`daily at noon` and `every day at noon` select all seven weekdays. `every weekday` means Monday–Friday; `every weekend` means Saturday and Sunday. These definitions are explicit product policies, not inferred from location or a personal work calendar. The preview and copied text name the repeat days. Use explicit weekday names for a different workweek or weekend.

`weekly on Monday at noon` (including supported weekday lists) is another spelling of the weekly rule. All forms share complete clock/range resolution, inclusive calendar start/until dates, excluded start dates, three-occurrence preview limits and DST rejection. Rules retain canonical `frequency: weekly` plus the selected ISO `weekdays`, including all seven for daily input. This represents a weekday set, not elapsed 24-hour spacing. Original source text is retained.

Bare `daily`, `every weekday` or `weekly on Monday` asks what time should repeat; it does not infer midnight or an all-day schedule. All-day recurrence and broader frequencies remain open. Multi-week intervals are supported as specified below.

## Single-range clock clarification

Explicit range endpoints and a duration's start anchor can offer separate Start and End clock choices. Each choice names the actual date, clock and offset. Decisions are bound to the complete original text, timezone and reference; editing clears them. Restart choices returns to the first unresolved decision without changing the input.

The written date and clock order determine the end date before any skipped-clock replacement is selected. A replacement cannot silently turn a same-date range into an overnight event. The final end must be later than the start; reversed choices remain unresolved and offer recovery. This also applies when an entire civil date was skipped. Equal written clocks still require explicit next-date confirmation, and replacements can change the elapsed duration.

Arithmetic-step clock ambiguity offers selectable recovery and resumes the remaining written-order operations; strict API v2 remains unchanged. Finite groups offer range-specific endpoint clock choices. Choosing a duration anchor never drops its remaining arithmetic. No clock choice creates a reminder or calendar event.

## Recurring-occurrence clock choices

A repeated or skipped clock asks for a choice on a named occurrence date and endpoint. Weekly point clocks and range endpoints use the same complete-resolution rules as single values. A skipped-clock replacement changes that occurrence only; later dates retain the written local clock. Both range endpoints must yield a positive duration. Excluded dates do not ask for clock choices.

The unpublished rule can now contain `clockOverrides`, with the requested occurrence date, start/end endpoint, chosen instant and readable label. These record validated choices encountered while generating the preview and its lookahead, not a policy for unseen future transitions. The interpretation rule remains `preview-only`. Bounded export resolves all remaining occurrences and asks for additional clock choices beyond the preview; unbounded export remains blocked when unseen conflicts need a future-clock policy. Input, timezone or reference edits invalidate choices. The app shows and copies selected exceptions and allows restarting the decisions.

Finite-group DST choices name the range index, weekday and endpoint. Each resolved range retains source order and its original source span. A choice cannot resolve another range, and invalid trailing qualifiers still prevent complete success. Matching-clock next-date confirmation applies separately to each group; other ranges retain their values. Decision history retains at most 64 prior IDs, covering supported multi-stage date/time/clock choices; the SDK validates the same bound.

Suffix durations such as `tomorrow at noon for 30 minutes` now resolve the same complete interval as `for 30 minutes from tomorrow at noon`. Positive integer days, weeks, hours, minutes and seconds use the existing calendar/elapsed policy. Clock clarification selects only the start; duration remains intact. Unknown trailing qualifiers and anchors with arithmetic remain unresolved. Numeric dates with `at … for …` or date-only `for …` offer calendar-valid date choices, then resolve the complete duration. A later clock choice retains the date choice; edits invalidate both.

Finite groups validate complete syntax and the range-count limit before offering per-range clarification. Unsupported trailing text cannot trigger a clock question for a partial collection. Calendar resolution still validates each complete range and rejects duplicate intervals.

Repeating durations: `every Monday at 9am for 30 minutes` uses the same complete interval resolver for each occurrence. Positive integer seconds, minutes, hours, days and weeks retain the existing elapsed/calendar policy. Bounds and exclusions apply to occurrence start dates; the duration is retained in `rule.duration`, and every preview/export row contains an end. Repeated-start choices change only the named occurrence. Timed calendar-day/week duration endpoints offer repeated-clock or gap-replacement choices. The civil endpoint is calculated from the resolved start before asking; the start and calendar duration are retained. All-day midnight transitions remain unresolved; no end is guessed.

Date-only midnight transitions: a date without a time or arithmetic uses the first valid local time on that civil date as its internal boundary. This is not an appointment-time choice. A midnight gap does not change the named date; a repeated midnight uses the beginning of the date. A wholly skipped civil date remains unresolved. Numeric date choices follow the same policy. All-day duration endpoints are computed as exclusive civil dates and resolved independently, rather than copying a shifted start clock onto the end date.

The strict calculator/API v2 policy and explicit midnight behavior are unchanged. Scheduling-only boundary results disable strict API replay and include an explicit policy note. Source: [Temporal PlainDate conversion](https://tc39.es/proposal-temporal/docs/plaindate.html#toZonedDateTime), verified against installed Temporal 0.5.1. The date-only boundary rule does not select a replacement for a wholly skipped civil date. Arithmetic-step clock clarification is separate and must preserve every remaining operation.

Written recurrence clocks and duration amounts validate before any occurrence is enumerated. An empty preview does not make an invalid clock or unspecified matching-clock range valid. Valid expired bounds can still produce an empty preview; they do not produce a downloadable event file.

Recurring past starts: on the reference's civil date, the resolver compares both earlier/later timezone interpretations of the written start. It skips the occurrence before asking about its clocks only when both are strictly before the reference instant. A candidate exactly at the reference is upcoming. A past-starting range is omitted even if its end is still ahead, matching the existing upcoming-start policy. This check selects no instant, records no override and applies equally to complete bounded export.

## Multi-week cadence

`every other Monday at 9am` means every two weeks on that single named weekday. `every N weeks on Monday and Wednesday at noon` accepts whole N from 1 through 52. “Every other weekday” and ambiguous “biweekly” wording are not silently treated as alternating weeks.

Active weeks start Monday. A written `starting` date anchors that week; advancing the reference or excluding an occurrence never resets the phase. The start boundary may omit earlier weekdays in its initial active week. Without a written start, the first upcoming selected weekday/clock establishes the cycle, including advancing past a clock already gone today. The original source is retained; optional `rule.interval` records N when greater than one, and omitted interval means one week.

The UI and copied preview state the multi-week cadence. Bounded export resolves the complete requested range. Existing permitted unbounded paths serialize INTERVAL and a matching WKST; UTC conversion shifts WKST as well as BYDAY when the local weekday changes. Future-conflict checks follow the anchored active weeks, including shifted overnight endpoint weeks. An interval can still contain a transition on an inactive week if its elapsed duration reaches that date. The future scan covers the combined Gregorian-calendar and cadence cycle, or the remaining supported years through 9999. This does not authorize ambiguous-clock export or change the open future-policy gate.

Whole-second reminder durations: `at noon for 30 seconds` and its repeating equivalent retain exact elapsed seconds. The interval and schedule preview/copy include nonzero seconds. The existing positive integer 1–1,000,000-unit bound applies; fractional, zero and negative reminder durations remain unresolved. This does not narrow the calculator’s separate fractional arithmetic support.

## Explicit alternatives

Two complete points or intervals joined by `or` offer separate choices. For example, `tomorrow at noon for 30 minutes or Friday at 2pm for 30 seconds` preserves each complete interval. Neither is selected implicitly, and selecting one never borrows the other's duration. Reminder text and the full original source stay intact; edits or changed context invalidate the choice. Choice labels preserve nonzero seconds and milliseconds.

Numeric-date, clock and other supported clarification within a branch is answered before the final alternative choice. Branch decisions are separate, retain the full input context and do not implicitly choose that branch. Incomplete clauses, a second event label, three-way alternatives, conditions and negation still do not become selectable complete alternatives. Keep/replace corrections use the same staged recovery, with separate Original date and Replacement date questions. Resolving a replacement does not apply it: the final keep/replace confirmation is still required. Explicitly confirmed alternatives and replacements disable strict API v2 replay because that API has no selection field.

## Calendar export boundary

The web app prepares a file only from the current resolved interpretation. Editing the input or context invalidates its review and choices. The optional `@tempus-date/core/calendar` SDK entry point exposes `prepareCalendarFile`, `resolveRecurringExport`, `prepareRecurringCalendarFile` and `retainOccurrenceDecisions`. These functions perform no file or calendar writes. The integrating app owns current input/context and reference time, must clear decisions when that state changes, and must bind download to an explicit action on the reviewed result. The SDK cannot determine what is currently shown on screen.

- Finite points, intervals and weekday collections preserve date-only or timed precision and complete endpoints. Files require whole-second precision; subsecond calculator results remain usable without a calendar file.
- Bounded recurrence resolves the complete requested range, including exclusions and clock choices beyond the preview. Capacity limits cause an explicit failure, never a truncated schedule presented as complete.
- Unbounded recurrence has scoped supported paths: fixed future offsets, and zoned schedules whose future clocks and interval transitions pass preflight. A timezone-bearing rule is required when a fixed UTC rule would change the intended wall time.
- Future ambiguous clocks and intervals spanning offset changes still block unbounded export. The app may explain that an explicit end date allows bounded resolution, but must not choose that end date for the user.

File checks and actual calendar-client imports are separate release gates. The current sixteen scripted journey files pass both independent readers; broader DST diagnostic cases retain failures. No actual client import is verified. Current evidence and remaining gates belong in the [release checklist](release-checklist.md); prototype export experiments do not expand supported behavior.

## Direct action reminders

The existing reminder action grammar also accepts direct commands without `Remind me to`: `Call Sam tomorrow at noon`, `Pay rent on October 1, 2026`, or `Email Jo every Monday at noon for 30 minutes`. Supported actions remain call, email, text, visit, pay, buy, send, submit and pick up. Original capitalization, label and source spans are retained. The first temporal marker still begins the date suffix; unsupported qualifiers cannot be absorbed into the event label.

Direct commands use the same point, interval, recurrence, clarification and correction paths. A missing target, invalid suffix, condition or negation remains unresolved. This does not add arbitrary title extraction, broad document parsing, monthly recurrence or shorthand fractional reminder durations. Strict calculator/API v2 grammar is unchanged.

## Half-hour duration phrase

`for half an hour` means thirty elapsed minutes, in a suffix reminder or `for half an hour from …`. Weekly recurrence accepts the same phrase before its bounds and exclusions. Only the duration lexeme is normalized internally; original input, event/source spans and wording remain intact. Numeric-date, repeated-clock and correction choices retain the complete duration. Recurrence stores the equivalent `{ amount: 30, unit: minutes }` rule.

This exact phrase does not introduce arbitrary fractional reminder durations, compound durations or vague amounts. Extra qualifiers still require a complete supported interpretation. The calculator's separate fractional arithmetic and strict API v2 remain unchanged.

## Confirmed free-form event titles

A leading word-based title followed by a supported date phrase can be proposed explicitly: `Dentist appointment next Tuesday at 2pm` asks whether to use `Dentist appointment` as the title. Before confirmation it is unresolved and cannot produce a calendar file. The prompt names the title and date phrase; the user can confirm or edit the input.

Confirmation is bound to the full original input, timezone and reference. It survives subsequent numeric-date and clock decisions while retaining the original event/source spans. Edits invalidate it. The first meaningful temporal marker still starts the date suffix (bounded numeric identifiers below are the exception); unsupported suffixes cannot be swallowed into the label. Recognized modal/prose words, negation and conditions block this proposal. This is a literal-title confirmation policy, not a general semantic classifier or document-extraction claim. Title words containing temporal markers, arbitrary punctuation and broader prose remain coverage gaps. Existing reminder, meeting and strict calculator policies are unchanged.

Confirmed titles retain selection metadata so point, interval and schedule views can offer a change-interpretation action. Strict API v2 replay is disabled because it cannot carry title confirmation. Restarting returns to the title question without changing the input.

## Uncertainty in reminder labels

The direct-action and `Remind me to` paths do not absorb `maybe`, `perhaps`, `probably`, `possibly`, `tentatively` or `optionally` into the target label before a temporal suffix. They return an unresolved question asking whether the reminder is definite, with no selected event or export. The user may edit the phrase into a definite instruction; no word is removed automatically. This is a scoped uncertainty rule, not a general intent classifier.

Negative reminder clauses also include `cannot` and common straight/curly-apostrophe contractions (can't, won't, couldn't, shouldn't, isn't and related forms). They produce no selected event even when their words could fit a title. Ordinary name apostrophes remain accepted. Removing or rewriting the clause is an explicit user edit; Tempus does not infer which positive instruction was intended.

## Monthly schedules

`every month on the first at noon` and numeric days 1–31 use a monthly rule. First, second and third are accepted ordinal words. Dates 29–31 require an explicit skip-month or last-valid-day choice when it can change the complete finite schedule, or whenever the schedule is open-ended. Finite comparison includes counts, exclusions and past-start policies, not just the preview. The written day remains the anchor across shorter months. Choices bind to the original input, timezone and reference; an occurrence clock choice remains a separate answer.

Shared explicit clocks, ranges, durations, calendar start/end bounds and exact exclusions apply. Preview remains three upcoming starts. Bounded export resolves the complete set under the existing limits. Ongoing point export checks monthly dates against future timezone transitions. Ongoing monthly intervals require successful future-clock and offset-change preflight; ongoing clamping on days 29/30 remains unsupported; no end date is invented. See the [monthly acceptance and evidence](monthly-schedules.md).

## Explicit date lists

`Call Sam September 14, 2026 at noon and September 16, 2026 at noon` yields two finite events in written order. Every list item must contain an ISO date, a full English month/date/year, or a numeric date with four-digit year. Items are separated by `and`. When a list mixes untimed dates with written clocks/ranges/durations, each untimed item asks which written time applies or whether it should stay date-only. No common year, clock or repeating rule is silently inferred. Unsupported trailing text and duplicate complete events leave the whole list unresolved.

Each occurrence preserves its absolute source span and `allDay` classification. Date-only items export as DATE values; timed points have no invented duration. Intervals retain their explicit end. Numeric-date, start/end-clock and equal-clock-next-day questions use separate context-bound answers. Replacing a listed date clears that item's dependent clock answers; edits to input, timezone or reference invalidate all stale answers.

The existing 200-character and 14-event collection bounds apply. Abbreviated month names and incomplete lists with multiple distinct written years remain outside this implemented grammar. `September 14 and 16, 2026` can share one explicitly written month and year, with the month on the first item and the year on any item. Multiple conflicting years are not merged. Original item spans remain unchanged. A shared trailing time still requires a selectable interpretation. This limitation is not a claim that those broader product needs are complete.

## Explicit year choice for named-date lists

For a syntactically complete same-month list, or a list naming the month on every item, with no written year, ask which year applies to all dates before asking about shared time. Offer the reference's local calendar year and next year within 1–9999; select neither automatically. The user may instead write any supported year explicitly. Do not infer a different year per item or discard invalid dates. For mixed-month lists, the choice applies to every date, even December followed by January; no year rollover is inferred. To request different years, write each full date. An omitted month in a mixed-month list asks which written month applies before year and time clarification. It is not carried forward automatically. When every item names its month and exactly one distinct year is written, ask for each missing item’s year before shared-time questions. Offer the written year and its adjacent years within 1–9999; no year is preselected and written years stay unchanged. Other years can be typed explicitly. `list:INDEX:year:YYYY` is context-bound; replacing it clears that item’s time/clock decisions, while a time choice preserves its selected year. Incomplete lists with multiple distinct written years remain unsupported.

Year answers use context-bound `list:year:YYYY` IDs. Changing the year clears all dependent list decisions; changing text, timezone or reference invalidates the whole selection. Source text and spans retain the original yearless wording. This is implemented in source with main-app desktop and [packed Node/browser/Worker journey evidence](../comparison/evidence/year-sdk/README.md). Physical devices and actual calendar-client imports remain separate gates.

The mixed-month year/time path is verified in source and the main app at 320/1280 px with two independently read downloads. [Evidence](../comparison/evidence/mixed-month/README.md). This source change is newer than packed archive `906f3a6f…`; packed runtime evidence has not yet been refreshed.

Correction and alternative labels preserve precision: date-only points show a civil date marked “date only”; all-day intervals show civil dates marked “all day” with an explicit exclusive end. Explicit midnight remains a timed value. This presentation does not inherit a discarded branch’s clock or change calendar arithmetic.

## Explicit month choice in date lists

When a named-date list contains different written months and omits a month on a later item, offer the written months as selectable alternatives. The first item must name its month. Other months can be typed explicitly. `Call Sam September 30 and October 2 and 4 at noon` asks for the third month, then the shared year, then each missing time. The complete file contains all three dates in written order. Invalid dates and unoffered month IDs cannot export.

Context-bound `list:INDEX:month:NAME` answers preserve original text and item spans. Later year/time choices retain the month; replacing a month invalidates that item’s year/time/clock answers. Input, timezone or reference edits invalidate all answers. Main-app desktop evidence is retained in [omitted-month verification](../comparison/evidence/omitted-month/README.md). [Packed archive 8d0c2791](../comparison/evidence/omitted-month-runtimes/README.md) now has Node/browser/local-Worker evidence; the development replay contains 21 tasks. Devices and actual imports remain unverified.

## Explicit timed start/end dates

`from tomorrow at noon until Friday at noon` and `from 2026-09-13 at noon to 2026-09-18 at noon` use the original reference/timezone, except that an unqualified ending weekday is anchored to the resolved start date as specified above. Both must state a time; the end is exclusive and must follow the start. No overnight or inclusive-end guess is made. Numeric-date and DST choices are endpoint-specific and retain original input; edits invalidate them. Date-only endpoints now use the explicitly selected policy below. Mixed-precision endpoints ask for the missing clock as described below; endpoint arithmetic remains unresolved. See [acceptance and evidence](explicit-date-ranges.md); archive 47a218ba now has Node/browser/local-Worker evidence, with devices and actual imports still unverified.

## Occurrence counts

A count clause such as `for 3 occurrences` or `for three times` follows the recurrence clock/duration and precedes optional calendar boundaries. Digits 1–1,000 and words one through ten are supported. The optional `rule.count` is the requested total; it is independent of preview size and per-event duration. Complete export resolves the finite count with the existing monthly and DST choices. It never infers a calendar end date from the count.

Counts with exclusions ask whether to consume the excluded cadence slots or replace them to keep the requested event count. The optional `rule.countExclusions` records `consume` or `replace`, and the file description records the answer. Only matching cadence dates consume slots. All-excluded sets remain empty and cannot export an event file. Conflicting answers reopen the question; replacing an answer clears dependent occurrence-clock choices. Written past starts ask whether to consume past slots or count only upcoming starts; `rule.countPast` records the choice and the written start remains the cadence anchor. A selected start before the reference follows the explicit past-count policy when a start boundary is written. Insufficient end boundaries, counts above capacity and complete expansion beyond ten years fail without a partial file. See [acceptance cases and remaining work](occurrence-counts.md).

Excluded count slots across a clock transition: if an excluded start has interpretations on both sides of the reference, consuming its count slot requires an explicit occurrence-start choice. Only the start is resolved; no end or event is invented for an excluded date. The choice is retained in clock overrides and export descriptions. Without a written start, past selections leave all requested future slots available; future selections consume one slot. A written start selecting an already-past instant follows its explicit past-count policy. Exhausted counts export no events; all file contents remain future-only.

## Date-only explicit range policy

When both explicit range endpoints omit clocks, ask whether the last written date is included. `interval:end:boundary:exclusive` ends at the beginning of that date; `interval:end:boundary:inclusive` ends at the beginning of the following civil date. Both results remain all-day, with an exclusive stored/file end. No option is selected automatically. Numeric-date choices precede the policy; original text remains intact. The resolved end must follow the start, and wholly skipped date boundaries or an exclusive end beyond year 9999 remain unresolved. Input/context edits invalidate the choice; replacing an endpoint date clears dependent boundary answers.

Mixed date/time endpoints now ask which time belongs on the untimed date: use the other endpoint’s written clock or midnight at the start of this date. Midnight is offered once. Neither is selected automatically; another clock can be written in the input. The supplied clock is never discarded. A shared clock uses the written time, not a DST replacement, and resolves independently on the chosen endpoint date. Numeric-date and DST questions compose with the missing-time answer. `interval:ENDPOINT:time:written|midnight` choices are context-bound; changing one clears that endpoint’s clock answer while retaining its date. Contradictory ends remain unresolved; no overnight rollover is invented. [Mixed-range source/app evidence](../comparison/evidence/mixed-range/README.md) covers ten independently read desktop files. [Source and app evidence](../comparison/evidence/date-only-range/README.md) covers both all-day policies and four independently read desktop downloads, not device testing or client import.

## Numeric identifiers in event labels

Explicit commands can retain labels such as `Visit room 3`, `Pay invoice #123` and `Call person 0`. A number is treated as a label identifier only after a recognized singular noun: room, ticket, invoice, order, person, extension, issue, flight, gate, route, table, chapter, item or case. The identifier must be a nonnegative integer or a written number from zero through ten; an optional `#` is allowed. Original spelling, input and source spans are retained.

This does not accept every number as event text. A following clock marker, date separator, duration unit, fraction or conjunction prevents the number from being hidden as an identifier. For example, `Visit room 3 pm tomorrow at noon` remains unresolved. The parser does not skip a failed earlier temporal suffix to try a more convenient later one. Quantities follow the explicit confirmation policy below. Arbitrary alphanumeric identifiers and broader location prose remain unsupported.

Generic labels such as `Room 3 tomorrow at noon` still require explicit title confirmation. Numeric-date and repeated-clock choices retain the label; editing the identifier invalidates earlier answers and export eligibility. These bounded cases have authored regression and browser evidence, not independent language coverage evidence.

## Quantity labels with confirmation

`Buy 3 apples tomorrow at noon`, `Send 2 invoices tomorrow` and `Pick up three parcels tomorrow` can propose the complete command as an event title. Nothing resolves or exports before the user confirms that title. An optional `Remind me to` prefix is excluded from the retained event label, while its original input stays intact.

This bounded form accepts a positive integer or a written number from one through ten after buy, send or pick up, followed by an object phrase made of supported label words. Further quantified items may be joined with “and”. The first temporal marker outside these confirmed items starts the date phrase. Clock markers, duration units and unsupported temporal qualifiers cannot be absorbed into the object phrase. Unjoined extra quantities, fractional quantities, zero, broader commands and temporal words used as object names remain coverage gaps. Conditions, negation and uncertainty remain unresolved.

Title confirmation can lead to numeric-date and clock questions; those choices preserve the quantity and invalidate after a quantity edit. An optional `on` connector is handled consistently during title proposal and final resolution. Strict calculator/API v2 behavior is unchanged.

## Recipient title confirmation

A supported action with `for` followed by one to three name words, including lowercase `mom` or `jo smith` can propose the complete event title, for example “Buy apples for Sam tomorrow at noon”. Confirmation precedes date/clock choices. The original input and recipient span remain intact; editing the recipient clears prior choices. This bounded grammar does not handle names that resemble temporal words (such as May), arbitrary purpose clauses or multiple quantities. The connector and following date words are case-insensitive. Common indefinite-duration/article phrases cannot be proposed as names; names overlapping those words remain unsupported. Clock-first wording such as “at noon tomorrow” now uses the scheduling-only rule below. Duration and recurrence uses of `for` retain their existing meaning. No general recipient extraction claim is made. Incomplete conditional wording with “pending”, “assuming” or “provided” stays unresolved before title extraction; legitimate names/titles using these words are also outside this conservative rule.

## Clock-first points

Short clock-first phrases such as “at noon tomorrow”, “10 pm next Friday” and “at 1:30am on 11/01/2026” are evaluated as a date anchor followed by the written clock. Numeric dates and DST ambiguity retain their concrete choices. The original input/source spans remain unchanged, the resolved result exposes the evaluated wording, and strict API replay is disabled. Strict calculator/API v2 grammar does not change.

This transformation only accepts one date anchor and one explicit clock (noon, midnight, AM/PM or colon clock). It does not move a clock across arithmetic, durations, recurrence or another clock. Bare hours, compound schedule clauses and unsupported qualifiers remain unresolved. Calendar export still requires the explicit point mode and current user action.

Quantified item lists after buy/send/pick up may propose a complete event title after explicit confirmation. Preserve each item in the original title and spans. Positive integers or one through ten may be joined with “and”; temporal units and second actions must not be hidden as item text. Every changed item invalidates earlier choices. This is scheduling recognition, not an extension to strict API v2 arithmetic.
