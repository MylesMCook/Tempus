import assert from "node:assert/strict";
import { appendSelection, createParser, parse, parseMany } from "@tempus-date/core";
import { prepareCalendarFile } from "@tempus-date/core/calendar";

// Authored correction answers for an integration check, never default user choices.
const input = "Remind me to call Sam 11/01/2026 at 1:30am for 30 minutes";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  title: "call Sam",
};
let result = parse(input, context);
let selection;
for (const id of ["2026-11-01", "interval:start:2026-11-01T07:30:00Z"]) {
  assert.equal(result.status, "needs-clarification");
  assert.equal(prepareCalendarFile(result, metadata).ok, false);
  const choice = result.clarification.choices.find((choice) => choice.id === id);
  assert.ok(choice, `Missing authored answer: ${id}`);
  selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
  result = parse(input, { ...context, selection });
}
assert.equal(result.status, "resolved");
assert.equal(result.value.kind, "interval");
assert.equal(result.value.start.result.iso, "2026-11-01T07:30:00.000Z");
assert.equal(result.value.end.result.iso, "2026-11-01T08:00:00.000Z");
assert.equal(result.event.text, "call Sam");
assert.equal(prepareCalendarFile(result, metadata).ok, true);

const edits = [
  { name: "event", input: input.replace("Sam", "Jo"), context },
  { name: "duration", input: input.replace("30 minutes", "45 minutes"), context },
  { name: "timezone", input, context: { ...context, timezone: "America/New_York" } },
  { name: "reference", input, context: { ...context, reference: "2026-10-01T16:00:00Z" } },
];
for (const edit of edits) {
  const fresh = parse(edit.input, edit.context);
  const stale = parse(edit.input, { ...edit.context, selection });
  assert.deepEqual(stale, fresh, `${edit.name} must discard prior answers`);
  assert.equal(stale.status, "needs-clarification");
  assert.equal(stale.input, edit.input);
  assert.equal(prepareCalendarFile(stale, metadata).ok, false);
}

// One selected item must not resolve a different item in the same batch.
const batchInputs = [input, edits[0].input, "invalid text"];
const options = { ...context, selection: structuredClone(selection) };
const captured = structuredClone(options);
const parser = createParser(options);
const expected = batchInputs.map((item) => parse(item, captured));
assert.deepEqual(parseMany(batchInputs, options), expected);
assert.deepEqual(
  expected.map((item) => item.status),
  ["resolved", "needs-clarification", "unsupported"],
);

// A reusable parser captures nested selection history as well as scalar options.
options.timezone = "UTC";
options.reference = "2027-01-01T00:00:00Z";
options.selection.contextKey = "changed";
options.selection.id = "changed";
options.selection.previous.splice(0);
assert.deepEqual(parser.parseMany(batchInputs), expected);
const returned = parser.parse(input);
returned.context.timezone = "UTC";
returned.value.start.result.iso = "changed";
assert.deepEqual(parser.parse(input), expected[0]);

// Choice labels must match the precision the user is about to export.
for (const [text, id, label, mode, start, end] of [
  [
    "Call Sam Friday at noon, actually Saturday instead",
    "replace",
    "Use September 12, 2026 (date only)",
    "date",
    "20260912",
    null,
  ],
  [
    "Call Sam tomorrow for 2 days or Friday at midnight for 2 days",
    "alternative:first",
    "Use September 13, 2026 to September 15, 2026 (all day; exclusive end)",
    undefined,
    "20260913",
    "20260915",
  ],
]) {
  const question = parse(text, context);
  assert.equal(question.status, "needs-clarification");
  assert.equal(question.clarification.choices.find((choice) => choice.id === id)?.label, label);
  assert.equal(prepareCalendarFile(question, metadata).ok, false);
  const answer = { contextKey: question.clarification.contextKey, id };
  const resolved = parse(text, { ...context, selection: answer });
  assert.equal(resolved.status, "resolved");
  assert.equal(resolved.input, text);
  assert.equal(resolved.event.text, "Call Sam");
  assert.equal(text.slice(resolved.event.span.start, resolved.event.span.end), "Call Sam");
  const file = prepareCalendarFile(resolved, { ...metadata, title: "Call Sam", pointMode: mode });
  assert.ok(file.ok);
  assert.ok(file.text.includes(`DTSTART;VALUE=DATE:${start}`));
  if (end) assert.ok(file.text.includes(`DTEND;VALUE=DATE:${end}`));
  const edited = parse(text.replace("Sam", "Jo"), { ...context, selection: answer });
  assert.equal(edited.status, "needs-clarification");
  assert.equal(prepareCalendarFile(edited, metadata).ok, false);
}

console.log(
  JSON.stringify({
    runtime: process.version,
    checks: [
      "two-step reminder correction and file preparation",
      "date-only and all-day choice precision through export and edit",
      ...edits.map((edit) => `${edit.name} invalidation`),
      "batch answer isolation",
      "reusable parser nested snapshot",
      "returned result isolation",
    ],
    limits:
      "Installed SDK integration only; no browser UI, recurrence export decisions or calendar-client import.",
  }),
);
