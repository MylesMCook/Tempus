import assert from "node:assert/strict";
import { parse, appendSelection } from "@tempus-date/core";
import { resolveRecurringExport, prepareRecurringCalendarFile } from "@tempus-date/core/calendar";
// Authored integration answers; hosts must ask the user. This writes no files or calendars.
const context = { timezone: "America/Chicago", reference: "2026-01-01T00:00:00Z" };
const input =
  "Call Sam every month on the 30th at 9am for half an hour until 2026-05-31 except 2026-03-30";
const question = parse(input, context);
assert.equal(question.status, "needs-clarification");
const choice = question.clarification.choices.find((choice) => choice.id === "monthly:last-day");
assert.ok(choice);
const selection = appendSelection(undefined, {
  contextKey: question.clarification.contextKey,
  id: choice.id,
});
const result = parse(input, { ...context, selection });
assert.equal(result.status, "resolved");
assert.equal(result.input, input);
assert.equal(result.value.rule.frequency, "monthly");
const plan = resolveRecurringExport(result, context.reference);
assert.ok(plan.ok);
assert.deepEqual(
  plan.occurrences.map((row) => row.start.result.local.slice(0, 10)),
  ["2026-01-30", "2026-02-28", "2026-04-30", "2026-05-30"],
);
const metadata = {
  reference: context.reference,
  stamp: context.reference,
  uid: "11111111-2222-4333-8444-555555555555",
  title: "Call Sam",
};
const file = prepareRecurringCalendarFile(result, metadata);
assert.ok(file.ok);
assert.equal(file.eventCount, 4);
assert.equal(parse(input + " ", { ...context, selection }).status, "needs-clarification");
const ongoing = parse("every month on the first at 9am for half an hour", context);
const ongoingFile = prepareRecurringCalendarFile(ongoing, metadata);
assert.ok(ongoingFile.ok);
assert.ok(ongoingFile.text.includes("RRULE:FREQ=MONTHLY;BYMONTHDAY=1"));
assert.ok(ongoingFile.text.includes("DURATION:PT1800S"));
console.log(
  JSON.stringify({
    status: "passed",
    monthlyBoundedEvents: file.eventCount,
    ongoingRule: true,
    staleDecisionRejected: true,
  }),
);
