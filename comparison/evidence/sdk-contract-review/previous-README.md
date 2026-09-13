# Tempus core

Local English date calculations and scheduling interpretations. This is a **local 0.1.0 package candidate**, not a published or fully validated replacement for gpu-time. The package name is provisional; publication is disabled.

```ts
import { parse, parseMany, appendSelection } from "@tempus-date/core";

const context = {
  timezone: "America/Chicago",
  reference: "2026-09-12T16:00:00Z",
};
const result = parse("Remind me to call Sam tomorrow at noon", context);
const batch = parseMany(["in 3 weeks", "every Monday at noon"], context);

// Present alternatives to the user. Apply only the alternative they select.
const question = parse("03/04/2027", context);
if (question.status === "needs-clarification" && question.clarification) {
  const choose = (userSelectedId: string) =>
    parse(question.input, {
      ...context,
      selection: appendSelection(undefined, {
        contextKey: question.clarification!.contextKey,
        id: userSelectedId,
      }),
    });
  // Connect choose to the user's selection control; do not auto-select the first item.
}
```

## API

| Export                            | Contract                                                                                                                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parse(input, options)`           | Returns a point, interval, finite collection or weekly/monthly recurrence; otherwise an explicit unresolved status. Includes unchanged input and reference/timezone context      |
| `parseMany(inputs, options)`      | Same semantics and context as single parsing, in input order. Unresolved items remain in their original positions                                                                |
| `createParser(options)`           | Snapshots options for reuse; no asynchronous initialization or disposal required                                                                                                 |
| `appendSelection(previous, next)` | Retains decisions for the same context. Replacing an arithmetic clock clears that answer and later arithmetic answers. Pass `undefined` to clear after input or preference edits |
| `calculateDate(input, options)`   | Existing strict calculator, engine version 2; no sentence or schedule interpretation                                                                                             |
| `limits`, `SDK_VERSION`           | Declared resource limits and package version                                                                                                                                     |

`status` is `resolved`, `needs-clarification`, `unsupported` or `no-expression`. Check it before reading `value`. Resolved `value.kind` is `point`, `interval`, `collection` or `recurrence`; never treat the first occurrence as the whole result. A resolved finite recurrence can have an empty preview.

Reference and timezone are required strings. Invalid date/time values produce unresolved results. Incorrect argument types throw `TypeError`; batches over 100 inputs throw `RangeError`. A batch containing non-string values is an invalid API call, not a language-parsing failure.

Timezone calculations use bundled IANA 2026d data, generated with the matching pinned compiler. Parsing does not fetch timezone rules or use the runtime's offsets. Yellowknife noon on December 1, 2026 resolves to 18:00Z. Historical periods marked unspecified in IANA data return an unresolved timezone error. Language labels may use Intl when its civil fields agree with the pinned result; otherwise the numeric offset is shown. Timezone legislation can change: updating the bundled data requires a new package build.

## Scope and limits

- English only; 200 characters per input and 100 inputs per batch. No document extraction or consequential scheduling guarantee.
- Supported sentence forms remain bounded. Reminder labels allow a supported action followed by multiple words, including hyphenated/apostrophe names. The first recognized temporal marker starts the complete date suffix. Date-like names, numeric targets, arbitrary prose and many idioms remain unsupported.
- Repeating previews show three future starts. One to seven distinct full weekday names joined by commas or `and`, shared explicit clocks/ranges, ISO start/until dates and up to ten excluded dates are supported. Finite weekday groups allow up to fourteen intervals.
- Numeric date, point-clock, complete two-clause correction and equal-clock next-date choices are supported. Ambiguous interval endpoints, arithmetic steps and recurring occurrences offer explicit clock choices. No operation or exception is silently removed to make a result succeed.
- Calendar file preparation is available from the optional `@tempus-date/core/calendar` entry point. A parsed recurrence is still only a preview; validate the complete export plan separately. Future-clock policy and some unbounded interval exports remain unsupported.

Bare scheduling weekdays include today's future clock; strict calculator v2 excludes today. Written-order arithmetic and explicit `next`/`last`/`this` semantics are preserved. Calendar days retain local clock time across DST; elapsed hours do not. Choices are bound to text, timezone and reference. Clear the decision history after any edit, even if the user later restores the old text.

All APIs are synchronous and local. They do not read the clock, send input over the network, persist it, create reminders or write calendars. The host application owns display, user confirmation and external actions. Runtime consumers need ESM, BigInt and Intl for readable labels; Temporal is supplied by the pinned polyfill dependency.

The manifest sets Node 22.12 as the intended floor; exact runtime verification is recorded in the repository task log. Browser, Node and Worker compatibility must be demonstrated with the packed artifact before a supported release. CommonJS is not provided.

## Build locally

From the repository root:

```sh
pnpm build:sdk
cd packages/core
pnpm pack
```

Install the resulting tarball into an application. The package contains ESM, declarations and its license. The repository's `examples/sdk` directory provides Node, browser and Worker entry points. Publishing, package-name ownership, independent evaluation and the remaining capability gates are separate work.

Check `value.kind === "recurrence"`, then branch on `value.rule.frequency` before reading cadence fields.

| Frequency | Cadence fields                  | Meaning                                                                                                                                 |
| --------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `weekly`  | `weekdays`, optional `interval` | Sorted, unique ISO weekdays (Monday = 1). An omitted interval means every week; preview size is the total across all selected weekdays. |
| `monthly` | `dayOfMonth`, `shortMonth`      | Written day 1–31, with `skip` or `last-day` behavior for short months. Monthly rules do not provide weekdays or a weekly interval.      |

Both rules include their clock, start date and exclusions, with optional end date, duration and selected clock overrides. The repository example `examples/sdk/monthly.mjs` illustrates the flow; use the example from the same local checkout as this candidate.

Point results include `precision` (`date` or `time`) and `clockSource` (`explicit`, `reference`, `arithmetic` or `default`). Do not infer date-only intent from a midnight timestamp. The strict `calculateDate` result is unchanged.

Daily input (`daily` or `every day` with a clock), weekday/weekend input and `weekly on Monday` share the weekday-set rule. Weekdays mean Monday–Friday and weekends mean Saturday/Sunday; no personal calendar is inferred. Bare supported cadence forms ask for a clock.

Single-range DST choices identify the start or end. Use `appendSelection` to retain earlier decisions while answering the next question. The written range determines the end date; reversed selected instants remain unresolved. Clear selection to restart. Recurring choices are bound to an occurrence date and endpoint and recorded in optional `rule.clockOverrides`. Conflicting answers for one occurrence endpoint remain unresolved. The same rule applies to each range in a finite collection. Replacing its start answer clears its dependent end answer; other occurrences retain their choices. They do not select a default for future DST transitions.

Arithmetic clock choices resume the remaining operations in written order, including fractional remainders. Selections appear in calculation warnings and interpretation assumptions. Answer each new question; replacing an earlier arithmetic answer clears later arithmetic decisions. Strict `calculateDate` still rejects ambiguous clocks, and a clarified interpretation cannot be replayed through strict API v2 unchanged.

Finite groups support range-specific start/end DST choices and matching-clock next-date confirmation. Context-bound history retains at most 64 prior decisions (`limits.clarificationHistory`), allowing completion of multiple ambiguous ranges. Each confirmation applies only to its own range.

Multi-week schedules accept `every other Monday at 9am` or `every N weeks on Monday and Wednesday at noon`, with whole N from 1 to 52 (`limits.weeklyInterval`). Optional `rule.interval` is omitted for weekly schedules. Active weeks start Monday; an explicit starting date anchors the cycle and exclusions do not reset it. Without a start date, the first upcoming occurrence establishes the cycle. Full rules and calendar export still require the separately documented validation gates.

Reminder and repeating durations accept positive whole seconds, minutes, hours, days and weeks, up to 1,000,000 units. `at noon for 30 seconds` keeps a complete end timestamp. The exact phrase `for half an hour` also means thirty elapsed minutes, including `for half an hour from …` and weekly recurrence. Original wording/spans remain intact. Other fractional or compound reminder durations remain unsupported; calculator arithmetic retains its separate fraction support.

Two complete dates or intervals joined by `or` return selectable alternatives. Confirm with the returned context key and choice ID; no branch is chosen implicitly. Multiple or incomplete alternatives still require edited input. Confirmed alternatives cannot be replayed through strict API v2.

Direct action phrases such as `Call Sam tomorrow at noon` use the same reminder grammar without requiring `Remind me to`. Supported actions are call, email, text, visit, pay, buy, send, submit and pick up. The target and complete date suffix remain required. Original event capitalization and spans are preserved; unknown qualifiers, conditions and negation remain unresolved. This does not accept arbitrary appointment titles or change strict calculator v2.

Free-form titles such as `Dentist appointment next Tuesday at 2pm` require explicit title confirmation before resolving an event. Use the returned choices with `appendSelection`; numeric-date and clock questions may follow. Confirmed titles preserve original spans, expose selection metadata for recovery and disable strict v2 replay. Editing input or context invalidates all decisions. This is a literal-title proposal, not general document or prose understanding.

## Calendar files

Import file preparation separately so parsing integrations do not load calendar code:

```ts
import { parse } from "@tempus-date/core";
import { prepareCalendarFile } from "@tempus-date/core/calendar";

const result = parse("tomorrow", {
  timezone: "America/Chicago",
  reference: "2026-09-12T16:00:00Z",
});
// Run after the user reviews this current result and requests a file.
const file = prepareCalendarFile(result, {
  uid: "11111111-2222-4333-8444-555555555555", // Supply a new UUID per real export.
  stamp: "2026-09-12T16:00:00Z", // Supply the creation instant.
  title: "Appointment",
  pointMode: "date",
});
if (file.ok) console.log(file.text);
```

`prepareCalendarFile` handles points, intervals and finite collections. Points require explicit `pointMode`: use `date` for an all-day date or `instant` for a clock time; inspect the parsed point's `precision`. All file functions return `{ ok: true, text, eventCount, mimeType }` or `{ ok: false, code, reason }`. They perform no download, network access, persistence or calendar write.

Use the exported `CalendarFileFailureCode` to branch on a file failure; `reason` is text to display and may change wording. These codes do not imply permission for an external action:

| Code                     | Caller action                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `unresolved`             | Return to the original parse result's clarification or diagnostic.                                      |
| `recurrence-required`    | Use the recurring plan/file functions instead of the finite serializer.                                 |
| `point-mode-required`    | Supply date/instant mode after reviewing the point's precision.                                         |
| `clarification-required` | Show the export plan's clock question; retain the selected answer and resolve again.                    |
| `export-blocked`         | Show the plan failure; do not invent a clock policy or end date.                                        |
| `empty-schedule`         | Explain that no upcoming occurrences remain; no file is available.                                      |
| `invalid-file`           | Show the validation reason and repair the metadata or unsupported value; never download a partial file. |

For recurrence, call `resolveRecurringExport(result, result.context.reference, decisions)` before offering a download. A failed plan can include `clockPrompt`; display its exact question and choices. Retain an answer with `[choice.id, ...retainOccurrenceDecisions(decisions, choice.id)]` and resolve again. Review the plan and its scope, then pass the same reference and decisions to `prepareRecurringCalendarFile(result, { uid, stamp, title, reference, decisions })` on the user's export action. Never substitute the three-row parsed preview for the complete file. A successful bounded plan has no `exportRule`: its `occurrences` contain the complete finite file. A successful ongoing plan has `exportRule`: its `occurrences` are only an upcoming preview, and the file keeps repeating. Display that distinction before download. Bounded exports are limited to 1,000 occurrences and ten calendar years; no end date is invented.

The host must clear export decisions after **any input, timezone, reference or interpretation change**, replace stale handlers and disable unresolved exports. These functions accept supplied interpretation snapshots; they cannot know which snapshot is currently on screen. The browser calendar example demonstrates edit invalidation, restart, selectable export questions and explicit download. The Node calendar example is a deterministic integration check with authored answers, not an automatic user-choice policy.

Unbounded rules pass only the documented timezone/clock preflight. Future ambiguous clocks and intervals spanning offset changes can still return a failure. File-reader checks are separate from real calendar-client import, which remains unverified. No general calendar compatibility guarantee follows from a successful file result.

### Monthly schedules

`every month on the first at 9am for half an hour` retains a monthly rule. Numeric days 1–31 and the words first/second/third are accepted. Days 29–31 ask whether to skip a short month or use its last valid date. Answer through `appendSelection`; do not invent a default or treat a policy ID as a clock instant. The same context identity protects both policy and occurrence-clock answers from stale edits.

Bounded monthly files contain the complete occurrence set. Ongoing point and interval files require monthly date-aware future-clock preflight. Intervals spanning a future offset change remain blocked. Ongoing skip rules and last-day-31 rules are supported where preflight permits them; ongoing last-day clamping for days 29/30 remains blocked after a reader expansion failure. A preview is not proof that export is available.

### Explicit date collections

`Call Sam September 14, 2026 at noon and September 16, 2026 at noon` returns a finite `collection` in written order. Each occurrence has its own source span, `start`, optional `end` and `allDay` boolean. Check `end` before reading an interval endpoint; a point has no invented duration. The optional calendar entry preserves DATE values for date-only items and UTC instants for timed ones.

Each item can use its own ISO date, full month/day/year, or four-digit-year numeric date. Same-month shorthand such as `September 14 and 16, 2026` can share the one written month and year; the first item must name the month. A mixed-month list with no written years can explicitly select one year for all dates when every item names its month. No December/January rollover is inferred. If a mixed-month list names every month and has one distinct written year, each missing year gets its own choice: that written year, the preceding year or the following year within 1–9999. Written years never change. Use `list:INDEX:year:YYYY` answers through `appendSelection`; replacing one clears that item’s dependent time/clock answers. Write other years explicitly. When different months are written and a later item omits its month, choose one of those written months before year/time clarification; type another month explicitly if needed. Use `list:INDEX:month:NAME` through `appendSelection`. Year/time answers retain this month; replacing it clears that item’s dependent answers. The original wording and spans stay unchanged. Incomplete lists with multiple distinct written years remain unsupported. Separate items with `and`; times, ranges and durations apply to their own item. Numeric-date and clock choices use the existing context-bound `appendSelection` flow. No month or year is silently taken from the reference. A supported list without a written year first asks which year applies to all dates, offering the reference’s local year and following year within the supported range. Neither is selected automatically; write another year explicitly if needed. Year choices use `list:year:YYYY` IDs through `appendSelection`. Replacing the shared year retains month choices and clears dependent list answers before time-scope or clock questions are answered again. Invalid dates remain unresolved. Sharing a written time requires the choice described below. Limits remain 200 input characters and 14 complete events.

When a list mixes untimed dates with written times, Tempus asks which written time applies to each untimed date, or whether it should stay date-only. Sharing a clock/range/duration is an explicit answer; no time is silently inherited. Replacing that answer clears its dependent clock decisions while retaining the item's numeric-date choice. The history bound is 64 prior answers, allowing full completion of supported lists that need more than 32 choices.

## Explicit start/end dates

`Call Sam from tomorrow at noon until Friday at noon` and fully dated timed endpoints produce one interval with an exclusive end. Both endpoints resolve against the original reference/timezone; the end must follow the start. Date-only/mixed-precision endpoints, endpoint arithmetic and additional qualifiers remain unsupported here. No overnight date or inclusive end is inferred.

Numeric endpoint choices use `interval:start:date:YYYY-MM-DD` or `interval:end:date:YYYY-MM-DD`; clock choices use the corresponding endpoint plus an ISO instant. Pass offered answers through `appendSelection`. Clock choices retain their endpoint date; replacing a start date clears dependent end decisions. Conflicting clock answers reopen clarification. Input/context edits invalidate selection. `examples/sdk/calendar.mjs` demonstrates correction through file preparation and edit recovery.

Source now supports count-bounded recurrence: `every Monday at noon for 3 occurrences`, optionally with a duration before the count and ISO boundaries afterward. `rule.count` records the total independently of preview size; complete file preparation expands the finite set. Digits 1–1,000 and words one through ten are accepted. Source now asks how exclusions affect the count, with `rule.countExclusions` set to `consume` or `replace` after selection. Choice replacement clears dependent clock answers and edits invalidate the choice. Written past starts now ask whether past slots count (`rule.countPast: "consume"`) or only upcoming starts count (`"upcoming"`); either choice preserves the cadence anchor and exports only future events. Changing the past-count policy clears dependent exclusion/clock answers; capacity and insufficient-boundary failures never produce partial files. Rebuild and verify a new packed candidate before relying on this source addition; archive `47a218ba` predates it.
