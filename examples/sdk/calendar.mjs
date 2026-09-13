import assert from "node:assert/strict";
import { parse, appendSelection } from "@tempus-date/core";
import {
  prepareCalendarFile,
  resolveRecurringExport,
  prepareRecurringCalendarFile,
  retainOccurrenceDecisions,
} from "@tempus-date/core/calendar";

// Deterministic integration check. Choices below are authored test answers,
// not a policy to apply to users. This example writes no files or calendars.
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  title: "Call Sam",
};
const input = "Remind me to call Sam every Sunday at 1:30am for 30 minutes until 2026-11-08";
const result = parse(input, context);
const pending = resolveRecurringExport(result, context.reference);
assert.equal(pending.ok, false);
assert.ok(pending.clockPrompt);
assert.equal(
  prepareRecurringCalendarFile(result, { ...metadata, reference: context.reference }).ok,
  false,
);
assert.equal(
  prepareRecurringCalendarFile(result, { ...metadata, reference: context.reference }).code,
  "clarification-required",
);
const choice = pending.clockPrompt.choices.find(
  ({ id }) => id === "recurrence:2026-11-01:start:2026-11-01T07:30:00Z",
);
assert.ok(choice);
const decisions = [choice.id, ...retainOccurrenceDecisions([], choice.id)];
const plan = resolveRecurringExport(result, context.reference, decisions);
assert.equal(plan.ok, true);
assert.equal(plan.occurrences.length, 9);
assert.equal(plan.occurrences[7].start.result.iso, "2026-11-01T07:30:00.000Z");
assert.equal(plan.occurrences[7].end.result.iso, "2026-11-01T08:00:00.000Z");
const file = prepareRecurringCalendarFile(result, {
  ...metadata,
  reference: context.reference,
  decisions,
});
assert.equal(file.ok, true);
assert.equal(file.eventCount, 9);
assert.ok(file.text.includes("20261101T073000Z"));
assert.equal(
  prepareRecurringCalendarFile(parse(input.replace("30 minutes", "0 minutes"), context), {
    ...metadata,
    reference: context.reference,
    decisions: [],
  }).ok,
  false,
);
const date = prepareCalendarFile(parse("tomorrow", context), { ...metadata, pointMode: "date" });
assert.equal(date.ok, true);
assert.ok(date.text.includes("DTSTART;VALUE=DATE:20260913"));
const time = prepareCalendarFile(parse("tomorrow at midnight", context), {
  ...metadata,
  pointMode: "instant",
});
assert.equal(time.ok, true);
assert.ok(time.text.includes("DTSTART:20260913T050000Z"));
assert.equal(prepareCalendarFile(parse("03/04/2027", context), metadata).ok, false);
assert.equal(
  prepareRecurringCalendarFile(parse("every Sunday at 1:30am", context), {
    ...metadata,
    reference: context.reference,
  }).ok,
  false,
);
// Branch on codes; reason is display text, not a machine-readable policy.
assert.equal(prepareCalendarFile(parse("03/04/2027", context), metadata).code, "unresolved");
assert.equal(prepareCalendarFile(parse("tomorrow", context), metadata).code, "point-mode-required");
assert.equal(
  prepareCalendarFile(parse("every Monday at noon", context), metadata).code,
  "recurrence-required",
);
assert.equal(
  prepareRecurringCalendarFile(parse("every Sunday at 1:30am", context), {
    ...metadata,
    reference: context.reference,
  }).code,
  "export-blocked",
);
const repaired = parse("tomorrow at noon", context);
assert.equal(
  prepareCalendarFile(repaired, { ...metadata, title: "", pointMode: "instant" }).code,
  "invalid-file",
);
assert.equal(prepareCalendarFile(repaired, { ...metadata, pointMode: "instant" }).ok, true);
console.log(
  JSON.stringify({
    runtime: process.version,
    status: "passed",
    checks:
      "point precision, recurrence clarification, complete file, edit recovery, unresolved and future-policy rejection",
  }),
);

// Explicit end-date intervals retain numeric-date and DST answers separately.
const rangeInput = "Call Sam from 11/01/2026 at 1:30am until 2026-11-02 at noon";
let rangeResult = parse(rangeInput, context);
let rangeSelection;
for (const id of ["interval:start:date:2026-11-01", "interval:start:2026-11-01T07:30:00Z"]) {
  assert.equal(rangeResult.status, "needs-clarification");
  assert.ok(rangeResult.clarification.choices.some((choice) => choice.id === id));
  rangeSelection = appendSelection(rangeSelection, {
    contextKey: rangeResult.clarification.contextKey,
    id,
  });
  rangeResult = parse(rangeInput, { ...context, selection: rangeSelection });
}
assert.equal(rangeResult.status, "resolved");
assert.equal(rangeResult.value.kind, "interval");
assert.equal(rangeResult.input, rangeInput);
assert.equal(rangeResult.event.text, "Call Sam");
assert.deepEqual(
  [rangeResult.value.start.result.iso, rangeResult.value.end.result.iso],
  ["2026-11-01T07:30:00.000Z", "2026-11-02T18:00:00.000Z"],
);
const rangeMetadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  title: "Call Sam",
};
assert.equal(prepareCalendarFile(rangeResult, rangeMetadata).eventCount, 1);
const editedRange = parse(rangeInput.replace("11-02", "11-03"), {
  ...context,
  selection: rangeSelection,
});
assert.equal(editedRange.status, "needs-clarification");
assert.equal(prepareCalendarFile(editedRange, rangeMetadata).ok, false);
const conflictingRange = parse(rangeInput, {
  ...context,
  selection: {
    ...rangeSelection,
    previous: [...rangeSelection.previous, "interval:start:2026-11-01T06:30:00Z"],
  },
});
assert.equal(conflictingRange.status, "needs-clarification");
assert.equal(prepareCalendarFile(conflictingRange, rangeMetadata).ok, false);

// Completed range-policy journeys; answers represent authored user intentions.
for (const [
  text,
  ids,
  expectedStart,
  expectedEnd,
  allDay,
] of /** @type {Array<[string, string[], string, string, boolean]>} */ ([
  [
    "Call Sam from 2026-09-13 to 2026-09-18",
    ["interval:end:boundary:exclusive"],
    "20260913",
    "20260918",
    true,
  ],
  [
    "Call Sam from 2026-09-13 to 2026-09-18",
    ["interval:end:boundary:inclusive"],
    "20260913",
    "20260919",
    true,
  ],
  [
    "Call Sam from 11/01/2026 until 2026-11-02 at 1:30am",
    [
      "interval:start:date:2026-11-01",
      "interval:start:time:written",
      "interval:start:2026-11-01T07:30:00Z",
    ],
    "20261101T073000Z",
    "20261102T073000Z",
    false,
  ],
])) {
  let answer = parse(text, context),
    selection;
  for (const id of ids) {
    assert.equal(answer.status, "needs-clarification");
    assert.ok(answer.clarification.choices.some((choice) => choice.id === id));
    assert.equal(prepareCalendarFile(answer, metadata).ok, false);
    selection = appendSelection(selection, { contextKey: answer.clarification.contextKey, id });
    answer = parse(text, { ...context, selection });
  }
  assert.equal(answer.status, "resolved");
  assert.equal(answer.value.kind, "interval");
  assert.equal(answer.value.allDay, allDay);
  assert.equal(answer.input, text);
  assert.equal(answer.event.text, "Call Sam");
  const output = prepareCalendarFile(answer, metadata);
  assert.equal(output.ok, true);
  const parameter = allDay ? ";VALUE=DATE" : "";
  assert.ok(output.text.includes(`DTSTART${parameter}:${expectedStart}`));
  assert.ok(output.text.includes(`DTEND${parameter}:${expectedEnd}`));
  const edited = parse(text.replace("Sam", "Jo"), { ...context, selection });
  assert.equal(edited.status, "needs-clarification");
  assert.equal(prepareCalendarFile(edited, metadata).ok, false);
}
console.log(JSON.stringify({ rangePolicyJourneys: 3, status: "passed" }));
