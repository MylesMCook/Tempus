import assert from "node:assert/strict";
import { parse, appendSelection, limits } from "@tempus-date/core";
import { prepareCalendarFile } from "@tempus-date/core/calendar";
// Authored answers for verification. Hosts must present the questions to the user.
const context = { timezone: "America/Chicago", reference: "2026-10-31T12:00:00Z" };
const input = "Call Sam 11/01/2026 and 2026-11-08 at 1:30am";
let selection;
let result = parse(input, context);
for (const id of ["list:0:date:2026-11-01", "list:0:time:0", "list:0:start:2026-11-01T07:30:00Z"]) {
  assert.equal(result.status, "needs-clarification");
  assert.ok(result.clarification.choices.some((choice) => choice.id === id));
  selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
  result = parse(input, { ...context, selection });
}
assert.equal(result.status, "resolved");
assert.equal(result.value.kind, "collection");
assert.deepEqual(
  result.value.occurrences.map((row) => row.start.result.iso),
  ["2026-11-01T07:30:00.000Z", "2026-11-08T07:30:00.000Z"],
);
assert.ok(result.value.occurrences.every((row) => !row.allDay && row.end === undefined));
assert.equal(result.input, input);
const metadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  title: "Call Sam",
};
const file = prepareCalendarFile(result, metadata);
assert.ok(file.ok);
assert.equal(file.eventCount, 2);
assert.equal(parse(input + " ", { ...context, selection }).status, "needs-clarification");
const changed = appendSelection(selection, {
  contextKey: selection.contextKey,
  id: "list:0:time:date-only",
});
const mixed = parse(input, { ...context, selection: changed });
assert.equal(mixed.status, "resolved");
assert.equal(mixed.value.occurrences[0].allDay, true);
const mixedFile = prepareCalendarFile(mixed, metadata);
assert.ok(mixedFile.ok);
assert.ok(mixedFile.text.includes("DTSTART;VALUE=DATE:20261101"));
assert.equal(limits.clarificationHistory, 64);

// One written month/year may anchor same-month shorthand. The clock still needs a choice.
const shorthandInput = "Call Sam September 14 and 16, 2026 at noon";
const shorthandQuestion = parse(shorthandInput, context);
assert.equal(shorthandQuestion.status, "needs-clarification");
const shorthandResult = parse(shorthandInput, {
  ...context,
  selection: { contextKey: shorthandQuestion.clarification.contextKey, id: "list:0:time:0" },
});
assert.equal(shorthandResult.status, "resolved");
assert.deepEqual(
  shorthandResult.value.occurrences.map((row) => row.start.result.iso),
  ["2026-09-14T17:00:00.000Z", "2026-09-16T17:00:00.000Z"],
);
assert.equal(shorthandResult.input, shorthandInput);
for (const row of shorthandResult.value.occurrences)
  assert.equal(shorthandInput.slice(row.source.span.start, row.source.span.end), row.source.text);
assert.equal(prepareCalendarFile(shorthandResult, metadata).eventCount, 2);
assert.notEqual(parse(shorthandInput.replace(", 2026", ""), context).status, "resolved");

// A missing year is a separate, explicit decision before shared time.
for (const [yearlessInput, expected] of [
  [
    "Call Sam September 14 and 16 at noon",
    ["2026-09-14T17:00:00.000Z", "2026-09-16T17:00:00.000Z"],
  ],
  [
    "Call Sam September 30 and October 2 at noon",
    ["2026-09-30T17:00:00.000Z", "2026-10-02T17:00:00.000Z"],
  ],
]) {
  const yearQuestion = parse(yearlessInput, context);
  assert.equal(yearQuestion.status, "needs-clarification");
  assert.deepEqual(
    yearQuestion.clarification.choices.map((choice) => choice.id),
    ["list:year:2026", "list:year:2027"],
  );
  let yearSelection = appendSelection(undefined, {
    contextKey: yearQuestion.clarification.contextKey,
    id: "list:year:2026",
  });
  const yearTimeQuestion = parse(yearlessInput, { ...context, selection: yearSelection });
  assert.equal(yearTimeQuestion.status, "needs-clarification");
  assert.ok(yearTimeQuestion.clarification.choices.some((choice) => choice.id === "list:0:time:0"));
  yearSelection = appendSelection(yearSelection, {
    contextKey: yearTimeQuestion.clarification.contextKey,
    id: "list:0:time:0",
  });
  const yearResult = parse(yearlessInput, { ...context, selection: yearSelection });
  assert.equal(yearResult.status, "resolved");
  assert.equal(yearResult.input, yearlessInput);
  assert.equal(yearResult.event.text, "Call Sam");
  assert.deepEqual(
    yearResult.value.occurrences.map((row) => row.start.result.iso),
    expected,
  );
  for (const row of yearResult.value.occurrences)
    assert.equal(yearlessInput.slice(row.source.span.start, row.source.span.end), row.source.text);
  const yearFile = prepareCalendarFile(yearResult, metadata);
  assert.ok(yearFile.ok);
  assert.equal(yearFile.eventCount, 2);
  assert.ok(
    expected.every((iso) => yearFile.text.includes(iso.replace(/[-:]/g, "").replace(".000", ""))),
  );
  const replaceYear = appendSelection(yearSelection, {
    contextKey: yearQuestion.clarification.contextKey,
    id: "list:year:2027",
  });
  assert.deepEqual(replaceYear.previous, []);
  assert.equal(
    parse(yearlessInput, { ...context, selection: replaceYear }).status,
    "needs-clarification",
  );
  for (const changedContext of [
    { ...context, timezone: "UTC" },
    { ...context, reference: "2026-09-13T16:00:00Z" },
  ]) {
    const reset = parse(yearlessInput, { ...changedContext, selection: yearSelection });
    assert.equal(reset.status, "needs-clarification");
    assert.ok(reset.clarification.choices.every((choice) => choice.id.startsWith("list:year:")));
  }
  assert.equal(
    parse(yearlessInput.replace("at noon", "at 1pm"), { ...context, selection: yearSelection })
      .status,
    "needs-clarification",
  );
}

// A written year belongs to its date; select the missing year before sharing time.
const itemInput = "Call Sam December 31 and January 1, 2027 at noon";
let itemSelection;
let itemResult = parse(itemInput, context);
for (const id of ["list:0:year:2026", "list:0:time:0"]) {
  assert.equal(itemResult.status, "needs-clarification");
  assert.ok(itemResult.clarification.choices.some((choice) => choice.id === id));
  assert.equal(prepareCalendarFile(itemResult, metadata).ok, false);
  itemSelection = appendSelection(itemSelection, {
    contextKey: itemResult.clarification.contextKey,
    id,
  });
  itemResult = parse(itemInput, { ...context, selection: itemSelection });
}
assert.equal(itemResult.status, "resolved");
assert.equal(itemResult.event.text, "Call Sam");
assert.equal(itemResult.input, itemInput);
assert.deepEqual(
  itemResult.value.occurrences.map((row) => row.start.result.iso),
  ["2026-12-31T18:00:00.000Z", "2027-01-01T18:00:00.000Z"],
);
for (const row of itemResult.value.occurrences)
  assert.equal(itemInput.slice(row.source.span.start, row.source.span.end), row.source.text);
const itemFile = prepareCalendarFile(itemResult, metadata);
assert.ok(itemFile.ok && itemFile.eventCount === 2);
assert.ok(itemFile.text.includes("20261231T180000Z") && itemFile.text.includes("20270101T180000Z"));
const changedItemYear = appendSelection(itemSelection, {
  contextKey: itemSelection.contextKey,
  id: "list:0:year:2027",
});
assert.deepEqual(changedItemYear.previous, []);
assert.equal(
  parse(itemInput, { ...context, selection: changedItemYear }).status,
  "needs-clarification",
);
assert.equal(
  parse(itemInput.replace("2027", "2028"), { ...context, selection: itemSelection }).status,
  "needs-clarification",
);

console.log(
  JSON.stringify({
    status: "passed",
    dateTimeClockChoices: 3,
    events: file.eventCount,
    changedToDateOnly: true,
    staleDecisionRejected: true,
    explicitYearJourney: true,
  }),
);

// An omitted month is chosen before year/time; later answers preserve it.
const monthInput = "Call Sam September 30 and October 2 and 4 at noon";
let monthResult = parse(monthInput, context);
let monthSelection;
for (const id of ["list:2:month:october", "list:year:2026", "list:0:time:0", "list:1:time:0"]) {
  assert.equal(monthResult.status, "needs-clarification");
  assert.equal(prepareCalendarFile(monthResult, metadata).ok, false);
  assert.ok(monthResult.clarification.choices.some((choice) => choice.id === id));
  monthSelection = appendSelection(monthSelection, {
    contextKey: monthResult.clarification.contextKey,
    id,
  });
  monthResult = parse(monthInput, { ...context, selection: monthSelection });
}
assert.equal(monthResult.status, "resolved");
assert.equal(monthResult.input, monthInput);
assert.equal(monthResult.event.text, "Call Sam");
assert.deepEqual(
  monthResult.value.occurrences.map((row) => row.start.result.iso),
  ["2026-09-30T17:00:00.000Z", "2026-10-02T17:00:00.000Z", "2026-10-04T17:00:00.000Z"],
);
for (const row of monthResult.value.occurrences) {
  assert.equal(monthInput.slice(row.source.span.start, row.source.span.end), row.source.text);
  assert.equal(row.end, undefined);
}
assert.equal(prepareCalendarFile(monthResult, metadata).eventCount, 3);
const monthEdited = parse(monthInput.replace("4 at", "5 at"), {
  ...context,
  selection: monthSelection,
});
assert.equal(monthEdited.status, "needs-clarification");
assert.equal(prepareCalendarFile(monthEdited, metadata).ok, false);
