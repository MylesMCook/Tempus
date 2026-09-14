# Tempus core

Local English date calculations and guided scheduling interpretation. This is a **private 0.1.0 candidate**, not a published package or a proven overall replacement for gpu-time. The name and public compatibility policy are not finalized.

## Prepare complete output

`prepareCalendar` from `@tempus-date/core/calendar` accepts a `ParseResult`. It returns `ready`, `needs-clarification`, or `blocked`. A ready recurrence contains its complete bounded schedule, or a labeled ongoing rule preview. Private serialization policy stays inside the engine.

```ts
import { parse, appendSelection } from "@tempus-date/core";
import { prepareCalendar } from "@tempus-date/core/calendar";

const result = parse("every Monday at noon for 5 occurrences", {
  timezone: "America/Chicago",
  reference: "2026-09-12T16:00:00Z",
});
const prepared = prepareCalendar(result);
// With no file metadata, preparation does not serialize a calendar file.
if (prepared.status === "ready") console.log(prepared.schedule?.occurrences);

// If a question is returned, present its choices and use the user's chosen ID:
// const selection = appendSelection(previousSelection, {
//   contextKey: prepared.clarification.contextKey, id: chosenId,
// });
// const corrected = prepareCalendar(result, { selection });
```

For a file, pass `{ selection, file: { uid, stamp, title, pointMode } }`. The host supplies a UUID and ISO timestamp; `pointMode` is `"date"` or `"instant"` for single points. Check both `status === "ready"` and `file.ok` before using the file. Data can be ready while file metadata or precision is rejected. The engine never downloads, writes a calendar, reads the clock or requests the network.

Preparation answers use the existing `ClarificationSelection` shape. The opaque context key binds the interpreted result, original input, reference and timezone. Structured cloning is supported; stale answers return `blocked`. Restart preparation without a selection after editing. Older raw calendar helpers remain available for preview-package compatibility, but new integrations should use this contract.

## Parse with an explicit context

```ts
import { parse, parseMany, createParser } from "@tempus-date/core";
import type { ParseOptions, ParseResult } from "@tempus-date/core";

const context: ParseOptions = {
  timezone: "America/Chicago",
  reference: "2026-09-12T16:00:00Z",
};
const result: ParseResult = parse("Call Sam tomorrow at noon", context);
const batch = parseMany(["in 3 weeks", "every Monday at noon"], context);
const parser = createParser(context);
const next = parser.parse("Friday 10pm-12am");
```

All three parsing APIs are synchronous and local. They require a timezone and reference instant; they do not read the current clock, fetch models/rules, store input or create reminders. `createParser` snapshots options, including selection history, and needs no initialization or disposal. Create another parser when the context changes.

`parseMany` preserves input order and unresolved items. It uses one context for every item, so a context-bound clarification answer cannot authorize a different input. Incorrect argument types throw `TypeError`; more than 100 batch inputs throws `RangeError`. Invalid date/time strings produce unresolved results. A non-string item or sparse array is an invalid API call, not a language failure.

## Handle every outcome

Check `result.status` before accessing `value`:

| Status                | Meaning and next action                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `resolved`            | Inspect the complete `value`, event text, assumptions and precision before use.                                            |
| `needs-clarification` | Display the question and offered choices when `clarification` is present. Otherwise show the diagnostic and allow editing. |
| `unsupported`         | The complete request cannot be interpreted under the supported grammar/policies. Preserve it for editing.                  |
| `no-expression`       | No supported date expression was identified. Do not create an event.                                                       |

Resolved `value.kind` is `point`, `interval`, `collection` or `recurrence`.

- **Point:** `calculation` plus `precision: date | time` and `clockSource: explicit | reference | arithmetic | default`. Midnight does not by itself mean all-day.
- **Interval:** complete `start` and exclusive `end`, `allDay` and `endExclusive`. The end must follow the start.
- **Collection:** finite `occurrences` in written order. Each retains its own source span, start, optional end and all-day flag. A point has no invented duration.
- **Recurrence:** `rule` and an upcoming preview. Branch on `rule.frequency` before reading weekly or monthly fields. The preview is not the complete schedule and may legitimately be empty.

Every parse result includes unchanged `input`, `context` and `sdkVersion`. Resolved results expose temporal source text/spans and an optional `event`. Preserve these rather than reconstructing the input from timestamps. `ParseOptions`, `ParseResult` and `ClarificationSelection` are exported TypeScript types; use their discriminated outcomes instead of casting all results to points.

## Let the user answer

```ts
import { parse, appendSelection } from "@tempus-date/core";
import type { ClarificationSelection } from "@tempus-date/core";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const input = "03/04/2027";
let selection: ClarificationSelection | undefined;
let result = parse(input, context);

function answer(userSelectedId: string) {
  if (result.status !== "needs-clarification" || !result.clarification) return;
  const question = result.clarification;
  if (!question.choices.some((choice) => choice.id === userSelectedId)) return;
  selection = appendSelection(selection, {
    contextKey: question.contextKey,
    id: userSelectedId,
  });
  result = parse(input, { ...context, selection });
}
// Render question/choices and call answer only for the user's selected option.
```

Treat returned IDs and context keys as opaque. Do not generate IDs, choose the first answer automatically or parse timestamps out of IDs. Each answer can lead to another question. `appendSelection` preserves relevant history and clears dependent answers when a choice is replaced. Passing `undefined` clears it.

The host must clear selections and export decisions after any input, timezone, reference or interpretation edit—even if the user later restores earlier text. Discard stale handlers and results too. The SDK cannot see which snapshot is currently on screen.

## Supported input and calendar policies

The grammar is bounded short English, not arbitrary prose or document extraction. Unknown meaningful qualifiers must remain unresolved. No consequential-scheduling guarantee is provided. Clock-first point wording such as `at noon tomorrow` is supported in scheduling: the original text stays intact, while the result explains the evaluated date-first wording. Numeric-date and DST choices remain explicit. This does not extend strict calculator/API v2 grammar or support moving clocks across arithmetic, durations or recurrence.

| Family            | Current behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Calculator        | `calculateDate(input, options)` exposes strict engine v2: written-order arithmetic, fractions, stepwise month-end clamping and inspectable steps. It does not interpret event sentences or apply clarification answers.                                                                                                                                                                                                                                             |
| Reminders         | `Remind me to …` and supported direct actions: call, email, text, visit, pay, buy, send, submit, pick up. Free-form titles require confirmation. Recipient text such as `for Sam` can also require title confirmation; this bounded form accepts one to three name words, including lowercase wording such as `for mom` and rejects date-like names. Numeric dates, missing/repeated clocks, complete corrections and two alternatives can ask follow-up questions. |
| Durations         | Positive whole seconds, minutes, hours, days or weeks; the exact phrase “half an hour” also works. Other fractional/compound reminder durations remain unsupported; calculator fractions are separate.                                                                                                                                                                                                                                                              |
| Explicit ranges   | Both endpoints use the original reference/timezone. Untimed ranges ask whether to include the last date, while storing an exclusive end. A mixed date/time range asks for the missing clock: share the other written clock or use midnight; other times can be typed. DST choices may follow. Endpoint arithmetic and contradictory ends remain unresolved; no overnight date is invented for explicit dates.                                                       |
| Date lists        | Complete dates or supported month/year shorthand joined by `and`. Missing month/year and shared time require the applicable choices; no December/January rollover or time inheritance is silently inferred.                                                                                                                                                                                                                                                         |
| Weekly rules      | `weekdays` are sorted ISO values, Monday = 1. Optional `interval` is 1–52 weeks; omission means weekly. Daily, weekday and weekend inputs use weekday sets. Explicit starts anchor multi-week cadence; exclusions do not reset it.                                                                                                                                                                                                                                  |
| Monthly rules     | `dayOfMonth` is 1–31. Days 29–31 ask for `shortMonth`: `skip` or `last-day`. Monthly rules have no weekly interval/weekday fields.                                                                                                                                                                                                                                                                                                                                  |
| Bounds and counts | ISO start/until dates include starts on those dates. Exceptions remove local start dates. A finite `count` is separate from preview size. Exclusion and past-start choices determine `countExclusions` (`consume` or `replace`) and `countPast` (`consume` or `upcoming`); past-count choices preserve cadence and export only future events.                                                                                                                       |

Scheduling bare weekdays can include today's future clock; strict calculator v2 excludes today. Explicit `next`, `last` and `this` retain their meaning. Calendar days preserve local time across DST, while elapsed hours preserve elapsed time. Sharing a written clock does not copy a selected DST replacement onto another date. Date-only boundaries use the first valid time on that civil date; wholly skipped dates remain unresolved.

Timezone calculations use bundled IANA 2026d data and a pinned Temporal polyfill. They do not fetch rules or use the runtime's timezone offsets. Unspecified historical periods remain unresolved. Intl is used for labels only when its civil fields agree with the pinned result; otherwise labels use numeric offsets. Updating timezone legislation requires a new package build.

### Limits

| Limit                               |                                      Value |
| ----------------------------------- | -----------------------------------------: |
| Input length / batch size           |                200 characters / 100 inputs |
| Prior clarification answers         |                                         64 |
| Upcoming recurrence preview         |                             3 total starts |
| Weekly interval / distinct weekdays |                           1–52 weeks / 1–7 |
| Finite collection                   |                                  14 events |
| Excluded dates                      |                                         10 |
| Count / reminder duration           |    1–1,000 occurrences / 1–1,000,000 units |
| Finite export                       | 1,000 events and ten future calendar years |
| Calendar years                      | 1–9999, subject to available timezone data |

Count words one through ten are accepted. `limits` exposes the parsing limits declared by the current SDK; it is not an exhaustive listing of every export/timezone constraint. Resource-limit failures must not be converted into a partial successful schedule.

## Prepare a calendar file

Import the optional calendar entry separately. The functions return file text; the host performs any download or calendar write after the user reviews and confirms the current interpretation.

```ts
import { parse } from "@tempus-date/core";
import { prepareCalendarFile } from "@tempus-date/core/calendar";

const result = parse("tomorrow", {
  timezone: "America/Chicago",
  reference: "2026-09-12T16:00:00Z",
});
const file = prepareCalendarFile(result, {
  uid: "11111111-2222-4333-8444-555555555555", // New UUID for each real export.
  stamp: "2026-09-12T16:00:00Z", // Host-supplied creation instant.
  title: "Appointment",
  pointMode: "date",
});
if (file.ok) console.log(file.text); // Example only; this writes no calendar.
```

`prepareCalendarFile` handles points, intervals and collections. Points require `pointMode: date | instant`; respect the parsed precision. Successful file results contain `text`, `eventCount` and `mimeType`. Failures contain `code` and a display `reason`. Branch on the exported `CalendarFileFailureCode`, not wording:

| Code                     | Caller action                                                          |
| ------------------------ | ---------------------------------------------------------------------- |
| `unresolved`             | Return to clarification or editing.                                    |
| `recurrence-required`    | Use the recurring plan/file functions.                                 |
| `point-mode-required`    | Select the representation consistent with point precision.             |
| `clarification-required` | Show the export plan's clock question, then resolve again.             |
| `export-blocked`         | Show the reason; do not invent an end or clock policy.                 |
| `empty-schedule`         | Explain that no future events remain; no file is available.            |
| `invalid-file`           | Repair metadata or unsupported values; do not download a partial file. |

For recurrence:

1. Call `resolveRecurringExport(result, result.context.reference, decisions)`.
2. If it returns a `clockPrompt`, display it. Retain the user's answer with `[choice.id, ...retainOccurrenceDecisions(decisions, choice.id)]`, then resolve again.
3. Review the complete plan. Without `exportRule`, `occurrences` is the complete finite file. With `exportRule`, occurrences are only a preview and the file keeps repeating.
4. On the user's export action, call `prepareRecurringCalendarFile(result, { uid, stamp, title, reference, decisions })` with that same context and decisions.

No API performs network access, persistence, downloads or calendar writes. Future ambiguous clocks, ongoing intervals across offset changes and ongoing day-29/30 clamping remain blocked where validation cannot establish faithful output. Subsecond calculator values cannot become calendar files requiring whole-second precision. File-reader success does not establish actual calendar-client compatibility; real client imports remain unverified.

## Candidate API and upgrade boundaries

Only the two package entry points below are public. Files inside `dist` support emitted imports and declarations; their presence in the tarball does not make them supported deep imports.

| Entry                        | Runtime exports                                                                                              | Named type exports                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `@tempus-date/core`          | `parse`, `parseMany`, `createParser`, `calculateDate`, `appendSelection`, `limits`, `SDK_VERSION`            | `ParseOptions`, `ParseResult`, `ClarificationSelection` |
| `@tempus-date/core/calendar` | `prepareCalendarFile`, `resolveRecurringExport`, `prepareRecurringCalendarFile`, `retainOccurrenceDecisions` | `CalendarFile`, `CalendarFileFailureCode`               |

This unpublished candidate has no cross-version compatibility guarantee. Pin the tarball and record its hash: several local candidates share version 0.1.0, so `sdkVersion` alone cannot identify the implementation. Keep the matching lockfile, timezone/reference context and original input when reproducing a result.

Selections, context keys and recurring export decisions are opaque, transient state for the current interpretation. Do not persist them across upgrades or use them as authorization. After upgrading, reparse original text, discard prior choices/files and ask for any required answers again. Review changed timestamps, precision, recurrence, warnings and export eligibility before an external action. Do not replay a stored resolved object as proof that the current SDK accepted it.

Diagnostic wording, labels, trace prose and serialized ICS layout are presentation, not machine identifiers. Branch on documented discriminants and fields. Preserve complete trace data for inspection; do not parse its prose to recover calendar values. A changed resolution policy or timezone database can change results even when function signatures remain identical.

### Strict calculator and API v2

Existing strict arithmetic integrations should keep `calculateDate`. It returns an `ok`-discriminated calculation; scheduling `parse` returns a `status`-discriminated interpretation and can ask questions. They are not drop-in replacements. Scheduling bare weekdays can include today's future clock, while strict v2 excludes today. Do not pass scheduling sentences or clarification state through strict API replay to bypass a question.

The web HTTP API v2 remains a separate contract; installing this library does not create a server or preserve an HTTP response envelope automatically. Retain existing v2 compatibility tests when changing an integration. Public naming, release numbering and cross-version guarantees still require a publication decision and independent consumer review.

## Install and verification status

From the repository root, run `pnpm build:sdk`, then `pnpm pack` in `packages/core`. Install that tarball in a consumer. It contains ESM, declarations, README and license. CommonJS is not provided. Consumers need BigInt and Intl; Temporal comes from the declared polyfill dependency.

The intended Node floor is 22.12. Verified versions include Node 22.12/26.8, desktop Chrome 153, Playwright Firefox 148, WebKit 26.4 and local workerd. These are scoped candidate checks, not a guarantee for all later versions, physical phones, Safari.app, retail Firefox or deployed Workers. Browser checks use explicit WebKit Option-Tab and paced downloads; rapid repeated Chrome downloads have a retained failure.

The repository's `examples/sdk` includes Node, browser and Worker integrations plus packed-artifact verifiers. `docs/release-checklist.md` records exact candidate hashes and remaining gates. Public name/version ownership, compatibility guarantees, independent evaluation, physical-device behavior and actual client imports remain unfinished. Do not claim broad replacement, security certification or universal accuracy from the authored checks.

Quantified item lists such as “Buy 3 apples and 2 pears tomorrow at noon” require explicit title confirmation. Items use positive whole-number quantities or one through ten, joined by “and”. Date/time words, uncertain qualifiers and second actions are not absorbed into an item title. Decimal/zero quantities and arbitrary shopping-list punctuation are outside this grammar.
