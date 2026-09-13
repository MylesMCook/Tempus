import assert from "node:assert/strict";
import { parse, parseMany, appendSelection } from "@tempus-date/core";
import { resolveRecurringExport, prepareRecurringCalendarFile } from "@tempus-date/core/calendar";

// Authored integration answers, not permission to select for a real user.
// This example creates file contents in memory; it writes no files or calendars.
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  reference: context.reference,
  stamp: context.reference,
  uid: "11111111-2222-4333-8444-555555555555",
  title: "Call Sam",
};
const input = "Call Sam every Monday at noon for 5 occurrences";
const result = parse(input, context);
assert.equal(result.status, "resolved");
assert.equal(result.input, input);
assert.equal(result.event.text, "Call Sam");
assert.equal(input.slice(result.source.span.start, result.source.span.end), result.source.text);
assert.equal(result.value.rule.count, 5);
assert.equal(result.value.occurrences.length, 3);
assert.equal(result.value.truncated, true);
const plan = resolveRecurringExport(result, context.reference);
assert.ok(plan.ok);
assert.deepEqual(
  plan.occurrences.map((row) => row.start.result.iso),
  [
    "2026-09-14T17:00:00.000Z",
    "2026-09-21T17:00:00.000Z",
    "2026-09-28T17:00:00.000Z",
    "2026-10-05T17:00:00.000Z",
    "2026-10-12T17:00:00.000Z",
  ],
);
const file = prepareRecurringCalendarFile(result, metadata);
assert.ok(file.ok);
assert.equal(file.eventCount, 5);
assert.ok(!file.text.includes("RRULE:"));
assert.deepEqual(
  [...new Set([...file.text.matchAll(/\r\nDTSTART:(\d{8}T\d{6}Z)/g)].map((match) => match[1]))],
  [
    "20260914T170000Z",
    "20260921T170000Z",
    "20260928T170000Z",
    "20261005T170000Z",
    "20261012T170000Z",
  ],
);

const monthlyInput = "Call Sam every month on the 31st at noon for 3 occurrences";
const question = parse(monthlyInput, context);
assert.equal(question.status, "needs-clarification");
const selection = appendSelection(undefined, {
  contextKey: question.clarification.contextKey,
  id: "monthly:last-day",
});
const monthly = parse(monthlyInput, { ...context, selection });
assert.equal(monthly.status, "resolved");
assert.equal(prepareRecurringCalendarFile(monthly, metadata).eventCount, 3);
assert.equal(
  parse(monthlyInput.replace("3 occurrences", "4 occurrences"), { ...context, selection }).status,
  "needs-clarification",
);

const folded = parse("every Sunday at 1:30am for 10 occurrences", context);
assert.equal(folded.status, "resolved");
const unresolved = resolveRecurringExport(folded, context.reference);
assert.equal(unresolved.ok, false);
assert.ok(unresolved.clockPrompt);
assert.equal(prepareRecurringCalendarFile(folded, metadata).ok, false);
const answer = unresolved.clockPrompt.choices.find((choice) =>
  choice.id.includes("2026-11-01T07:30:00"),
);
assert.ok(answer);
const complete = prepareRecurringCalendarFile(folded, { ...metadata, decisions: [answer.id] });
assert.ok(complete.ok);
assert.equal(complete.eventCount, 10);
assert.ok(complete.text.includes("DTSTART:20261101T073000Z"));

const blocked = [
  "every Monday at noon for 3 occurrences except 2026-09-21",
  "every Monday at noon for 3 occurrences starting 2026-09-07",
  "every Monday at noon for 3 occurrences until 2026-09-21",
  "every Monday at noon for 1001 occurrences",
];
const batch = parseMany([input, ...blocked], context);
assert.equal(batch.length, 5);
assert.equal(batch[0].status, "resolved");
for (const candidate of batch.slice(1)) {
  assert.notEqual(candidate.status, "resolved");
  assert.equal(prepareRecurringCalendarFile(candidate, metadata).ok, false);
}
// A host must present these authored choices rather than choosing automatically.
const policyCases = [
  [
    "past-consume",
    "Call Sam every Monday at noon for 3 occurrences starting 2026-09-07",
    ["count:past:consume"],
    ["2026-09-14", "2026-09-21"],
  ],
  [
    "past-upcoming",
    "Call Sam every Monday at noon for 3 occurrences starting 2026-09-07",
    ["count:past:upcoming"],
    ["2026-09-14", "2026-09-21", "2026-09-28"],
  ],
  [
    "excluded-consume",
    "Call Sam every Monday at noon for 3 occurrences except 2026-09-21",
    ["count:exclusions:consume"],
    ["2026-09-14", "2026-09-28"],
  ],
  [
    "excluded-replace",
    "Call Sam every Monday at noon for 3 occurrences except 2026-09-21",
    ["count:exclusions:replace"],
    ["2026-09-14", "2026-09-28", "2026-10-05"],
  ],
  [
    "combined",
    "Call Sam every Monday at noon for 3 occurrences starting 2026-09-07 except 2026-09-14",
    ["count:past:consume", "count:exclusions:consume"],
    ["2026-09-21"],
  ],
];
for (const [name, text, ids, expected] of policyCases) {
  let current = parse(text, context);
  let history;
  for (const id of ids) {
    assert.equal(current.status, "needs-clarification", name);
    assert.ok(
      current.clarification.choices.some((choice) => choice.id === id),
      name,
    );
    assert.equal(prepareRecurringCalendarFile(current, metadata).ok, false, name);
    history = appendSelection(history, { contextKey: current.clarification.contextKey, id });
    current = parse(text, { ...context, selection: history });
  }
  assert.equal(current.status, "resolved", name);
  assert.equal(current.input, text);
  assert.equal(current.event.text, "Call Sam");
  const full = resolveRecurringExport(current, context.reference);
  assert.ok(full.ok, name);
  assert.deepEqual(
    full.occurrences.map((row) => row.start.result.local.slice(0, 10)),
    expected,
    name,
  );
  const exported = prepareRecurringCalendarFile(current, metadata);
  assert.ok(exported.ok, name);
  assert.equal(exported.eventCount, expected.length, name);
  assert.ok(!exported.text.includes("RRULE:"));
  assert.equal(
    parse(text.replace("3 occurrences", "4 occurrences"), { ...context, selection: history })
      .status,
    "needs-clarification",
    name,
  );
}
console.log(
  JSON.stringify({
    status: "passed",
    weeklyEvents: 5,
    monthlyEvents: 3,
    foldEvents: 10,
    beyondPreviewChoice: true,
    editedCountInvalidates: true,
    batchFailures: 4,
    completedCountPolicyCases: policyCases.length,
  }),
);
