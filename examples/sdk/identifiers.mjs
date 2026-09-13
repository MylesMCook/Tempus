import assert from "node:assert/strict";
import { parse, appendSelection } from "@tempus-date/core";
import { prepareCalendarFile, prepareRecurringCalendarFile } from "@tempus-date/core/calendar";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  title: "Pay invoice #123",
};
const input = "Pay invoice #123 on 11/01/2026 at 1:30am for 30 minutes";
// Authored answers for this integration check; a real host asks its user.
let selection;
for (const id of ["2026-11-01", "interval:start:2026-11-01T07:30:00Z"]) {
  const question = parse(input, { ...context, selection });
  assert.equal(question.status, "needs-clarification");
  assert.ok(question.clarification.choices.some((choice) => choice.id === id));
  assert.equal(prepareCalendarFile(question, metadata).ok, false);
  selection = appendSelection(selection, { contextKey: question.clarification.contextKey, id });
}
const result = parse(input, { ...context, selection });
assert.equal(result.status, "resolved");
assert.equal(result.event.text, "Pay invoice #123");
assert.equal(input.slice(result.event.span.start, result.event.span.end), result.event.text);
assert.equal(input.slice(result.source.span.start, result.source.span.end), result.source.text);
const file = prepareCalendarFile(result, metadata);
assert.ok(file.ok);
assert.ok(file.text.includes("DTSTART:20261101T073000Z"));
assert.ok(file.text.includes("DTEND:20261101T080000Z"));
const edited = input.replace("#123", "#124");
assert.deepEqual(parse(edited, { ...context, selection }), parse(edited, context));
const schedule = parse("Visit room 3 every Monday at noon for 3 occurrences", context);
assert.equal(schedule.status, "resolved");
assert.equal(schedule.event.text, "Visit room 3");
const recurring = prepareRecurringCalendarFile(schedule, {
  ...metadata,
  title: "Visit room 3",
  reference: context.reference,
});
assert.ok(recurring.ok);
assert.equal(recurring.eventCount, 3);
for (const text of [
  "Visit room 3 pm tomorrow at noon",
  "Pay invoice 03/04/2027 tomorrow",
  "Visit room 3 tomorrow unless it rains",
])
  assert.notEqual(parse(text, context).status, "resolved");
console.log(
  JSON.stringify({
    status: "passed",
    reminder: result.event.text,
    recurrence: schedule.event.text,
    events: recurring.eventCount,
  }),
);
const quantityInput = "Buy 3 apples on 11/01/2026 at 1:30am for 30 minutes";
let quantitySelection;
for (const id of ["event:title", "2026-11-01", "interval:start:2026-11-01T07:30:00Z"]) {
  const question = parse(quantityInput, { ...context, selection: quantitySelection });
  assert.equal(question.status, "needs-clarification");
  assert.ok(question.clarification.choices.some((choice) => choice.id === id));
  assert.equal(prepareCalendarFile(question, metadata).ok, false);
  quantitySelection = appendSelection(quantitySelection, {
    contextKey: question.clarification.contextKey,
    id,
  });
}
const quantityResult = parse(quantityInput, { ...context, selection: quantitySelection });
assert.equal(quantityResult.status, "resolved");
assert.equal(quantityResult.event.text, "Buy 3 apples");
const quantityFile = prepareCalendarFile(quantityResult, {
  ...metadata,
  title: quantityResult.event.text,
});
assert.ok(quantityFile.ok);
assert.ok(quantityFile.text.includes("DTSTART:20261101T073000Z"));
assert.ok(quantityFile.text.includes("DTEND:20261101T080000Z"));
const quantityEdit = quantityInput.replace("3 apples", "4 apples");
assert.deepEqual(
  parse(quantityEdit, { ...context, selection: quantitySelection }),
  parse(quantityEdit, context),
);
console.log(JSON.stringify({ status: "passed", quantityTitleCorrectionAndEdit: true }));
