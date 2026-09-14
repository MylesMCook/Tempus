# Tempus core

Calculate dates, inspect the steps and ask for missing details. This is an **unpublished 0.1.0 package** with ESM and TypeScript types. Its API may change.

## Build and install locally

From the repository root:

```sh
pnpm build:sdk
cd packages/core
pnpm pack
```

Requires Node 22.12 or newer and ESM. The archive is `packages/core/tempus-date-core-0.1.0.tgz`. From your app, install it with its absolute path:

```sh
npm install /absolute/path/to/TempusTotal/packages/core/tempus-date-core-0.1.0.tgz
node --input-type=module -e 'import { parse, SDK_VERSION } from "@tempus-date/core"; const r = parse("tomorrow", { timezone: "UTC", reference: "2026-09-13T12:00:00Z" }); if (r.status !== "resolved") throw new Error(r.status); console.log(SDK_VERSION, r.status);'
```

The check prints `0.1.0 resolved`. `pnpm add` accepts the same archive path. Keep its SHA-256 (`shasum -a 256 <archive>`) and your lockfile: different local builds share version 0.1.0. CommonJS is not provided.

## Calculate a date

```ts
import { calculateDate } from "@tempus-date/core";

const result = calculateDate("January 31 2027 plus 1 month plus 1 month", {
  timezone: "America/Chicago",
  reference: "2026-09-13T15:00:00Z",
});

if (result.ok) {
  console.log(result.result.iso); // 2027-03-28T05:00:00.000Z
  console.log(result.steps); // January 31 → February 28 → March 28
} else {
  console.log(result.error.message, result.error.hint);
}
```

The engine uses your timezone and reference time. It does not read the clock, make network requests or create reminders. Each step includes the before/after date and explains adjustments such as month-end clamping.

## Parse dates and schedules

```ts
import { parse, parseMany, createParser } from "@tempus-date/core";

const context = {
  timezone: "America/Chicago",
  reference: "2026-09-13T15:00:00Z",
};

const result = parse("Call Sam tomorrow at noon", context);
const batch = parseMany(["in 3 weeks", "tomorrow at noon"], context);
const parser = createParser(context);
const next = parser.parse("Friday 10pm-12am");
```

All three calls are synchronous. Invalid arguments throw; see the [error contract](reference.md#errors). For a valid call, check `status` before using its result:

| Status                | What your app should do                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| `resolved`            | Read `value.kind`: point, interval, collection or recurrence.                                  |
| `needs-clarification` | Show the offered question and choices, if present. Otherwise show the error and allow editing. |
| `unsupported`         | Show the reason and let the user edit.                                                         |
| `no-expression`       | Keep the text; there is no date to act on.                                                     |

Keep `input`, `context`, source spans and event text. A recurrence contains a preview, not necessarily all its dates. `parseMany` keeps input order and unresolved results. A reusable parser keeps its original context; create another when that context changes.

## Handle a choice

```ts
import { parse, appendSelection } from "@tempus-date/core";
import type { ClarificationSelection } from "@tempus-date/core";

const input = "03/04/2027";
let selection: ClarificationSelection | undefined;
let result = parse(input, context);

function answer(chosenId: string) {
  if (result.status !== "needs-clarification" || !result.clarification) return;
  const question = result.clarification;
  if (!question.choices.some((choice) => choice.id === chosenId)) return;
  selection = appendSelection(selection, { contextKey: question.contextKey, id: chosenId });
  result = parse(input, { ...context, selection });
}
```

Call `answer` with the user's chosen ID. Another question may follow. Do not invent IDs or choose the first option automatically. Clear choices, prepared files and stale handlers whenever the input, timezone or reference changes—even if earlier text is restored.

## Get every date or prepare a file

```ts
import { prepareCalendar } from "@tempus-date/core/calendar";

const schedule = parse("every Monday at noon for 5 occurrences", context);
const prepared = prepareCalendar(schedule);
if (prepared.status === "ready") {
  console.log(prepared.schedule?.occurrences); // All five dates.
}
```

Preparation returns `ready`, `needs-clarification` or `blocked`. Show any question and pass its chosen ID through `appendSelection`, then prepare again with `{ selection }`. Parsing choices and preparation choices each use their own offered context key.

Omit `file` to get data only. To prepare an `.ics` file, pass `{ selection, file: { uid, stamp, title, pointMode } }`. Your app supplies the UUID and creation timestamp; points require `pointMode: "date" | "instant"` matching their precision. Check both `prepared.status === "ready"` and `prepared.file?.ok` before using file text. Ready data does not guarantee a valid file.

A finite result contains all its dates; an ongoing rule has a labeled preview. Use the preparation status and `ongoing`/`truncated` fields to interpret the output. The legacy `schedule.validation: "preview-only"` label remains even after finite dates are prepared; it does not indicate truncation. The engine never downloads a file or writes a calendar.

## Limits and details

Start with inputs of up to 200 characters and batches of at most 100. Keep errors visible rather than turning a partial result into success. Real calendar-client imports and physical-phone behavior remain unverified.

See the [reference](reference.md) for full limits, date policies, runtime checks, exported types and older calendar helpers. The [integration examples](../../examples/sdk/README.md) exercise Node, browser and Worker consumers. Exact tested builds are in the [release checklist](../../docs/release-checklist.md).
