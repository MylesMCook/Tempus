import assert from "node:assert/strict";
import { parse, parseMany, createParser, appendSelection } from "@tempus-date/core";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
for (const clause of ["can't meet", "won’t be available", "cannot meet", "shouldn't meet"]) {
  const input = `Call Sam who ${clause} tomorrow at noon`;
  const result = parse(input, context);
  assert.equal(result.status, "no-expression");
  assert.equal(result.input, input);
}
assert.equal(parse("Call O’Toole tomorrow at noon", context).status, "resolved");
for (const qualifier of ["maybe", "perhaps", "probably", "possibly", "tentatively", "optionally"]) {
  for (const prefix of ["Call Sam", "Remind me to call Sam"]) {
    const input = `${prefix} ${qualifier} tomorrow at noon`;
    const uncertain = parse(input, context);
    assert.equal(uncertain.status, "needs-clarification");
    assert.equal(uncertain.input, input);
    const definite = parse(`${prefix} tomorrow at noon`, context);
    assert.equal(definite.status, "resolved");
    assert.equal(definite.value.kind, "point");
    assert.equal(definite.value.calculation.result.iso, "2026-09-13T17:00:00.000Z");
  }
}
console.log(
  JSON.stringify({ runtime: process.version, checks: "uncertain reminder edit recovery" }),
);
const result = parse("tomorrow at noon", context);
assert.equal(result.status, "resolved");
assert.equal(result.value.kind, "point");
assert.equal(result.value.calculation.result.iso, "2026-09-13T17:00:00.000Z");
const inputs = ["every Monday at noon", "invalid text", "Sat Sun 1pm-8pm"];
assert.deepEqual(
  parseMany(inputs, context),
  inputs.map((input) => parse(input, context)),
);
assert.deepEqual(createParser(context).parse(inputs[0]), parse(inputs[0], context));
console.log(
  JSON.stringify({
    runtime: process.version,
    package: result.sdkVersion,
    checks: "point, batch parity, unresolved item, reusable parser",
  }),
);

// Run correction journeys against the installed artifact, not repository source.
const arithmetic = parse("January 31, 2027 plus 1 month minus 1 day", context);
assert.equal(arithmetic.status, "resolved");
assert.equal(arithmetic.value.kind, "point");
assert.equal(arithmetic.value.calculation.result.iso, "2027-02-27T06:00:00.000Z");
for (const { input, options, expectedKind, expectedFirst, choices } of [
  {
    input: "Remind me to call Sam 03/04/2027 at noon",
    options: context,
    expectedKind: "point",
    expectedFirst: "2027-04-03T17:00:00.000Z",
    choices: [1],
  },
  {
    input: "every Sunday at 1:30am",
    options: { ...context, reference: "2026-10-31T12:00:00Z" },
    expectedKind: "recurrence",
    expectedFirst: "2026-11-01T07:30:00.000Z",
    choices: [1],
  },
  {
    input: "Sun 1:30am-3am Mon 9am-10am",
    options: { ...context, reference: "2026-10-31T12:00:00Z" },
    expectedKind: "collection",
    expectedFirst: "2026-11-01T07:30:00.000Z",
    choices: [1],
  },
]) {
  let answer = parse(input, options);
  let selection;
  for (const index of choices) {
    assert.equal(answer.status, "needs-clarification");
    assert.ok(answer.clarification);
    selection = appendSelection(selection, {
      contextKey: answer.clarification.contextKey,
      id: answer.clarification.choices[index].id,
    });
    answer = parse(input, { ...options, selection });
  }
  assert.equal(answer.status, "resolved");
  assert.equal(answer.value.kind, expectedKind);
  const first =
    answer.value.kind === "point" ? answer.value.calculation : answer.value.occurrences[0].start;
  assert.equal(first.result.iso, expectedFirst);
  assert.equal(answer.input, input);
  assert.equal(parse(input + " ", { ...options, selection }).status, "needs-clarification");
}
console.log(
  JSON.stringify({
    runtime: process.version,
    checks:
      "ordered arithmetic, reminder date correction, recurring and group DST correction, original input and stale selection",
  }),
);
const overnight = parse("Friday 10pm-12am", context);
assert.equal(overnight.status, "resolved");
assert.equal(overnight.value.kind, "interval");
assert.equal(overnight.value.start.result.iso, "2026-09-19T03:00:00.000Z");
assert.equal(overnight.value.end.result.iso, "2026-09-19T05:00:00.000Z");
console.log(JSON.stringify({ runtime: process.version, checks: "complete overnight interval" }));
const durationInput = "Remind me to call Sam 11/01/2026 at 1:30am for 30 minutes";
let durationResult = parse(durationInput, context);
let durationSelection;
for (const index of [0, 1]) {
  assert.notEqual(durationResult.status, "resolved");
  assert.ok(durationResult.clarification);
  durationSelection = appendSelection(durationSelection, {
    contextKey: durationResult.clarification.contextKey,
    id: durationResult.clarification.choices[index].id,
  });
  durationResult = parse(durationInput, { ...context, selection: durationSelection });
}
assert.equal(durationResult.status, "resolved");
assert.equal(durationResult.value.kind, "interval");
assert.equal(durationResult.value.start.result.iso, "2026-11-01T07:30:00.000Z");
assert.equal(durationResult.value.end.result.iso, "2026-11-01T08:00:00.000Z");
assert.equal(durationResult.event.text, "call Sam");
assert.equal(durationResult.input, durationInput);
assert.equal(
  parse(durationInput + " ", { ...context, selection: durationSelection }).status,
  "needs-clarification",
);
console.log(
  JSON.stringify({
    runtime: process.version,
    checks: "numeric date and DST correction preserve reminder duration",
  }),
);
const groupInput = "Sat 9am-9am Mon 9am-10am";
const groupQuestion = parse(groupInput, context);
assert.notEqual(groupQuestion.status, "resolved");
assert.ok(groupQuestion.clarification);
const groupSelection = {
  contextKey: groupQuestion.clarification.contextKey,
  id: groupQuestion.clarification.choices[0].id,
};
const groupAnswer = parse(groupInput, { ...context, selection: groupSelection });
assert.equal(groupAnswer.status, "resolved");
assert.equal(groupAnswer.value.kind, "collection");
assert.deepEqual(
  groupAnswer.value.occurrences.map((row) => [row.start.result.iso, row.end.result.iso]),
  [
    ["2026-09-19T14:00:00.000Z", "2026-09-20T14:00:00.000Z"],
    ["2026-09-14T14:00:00.000Z", "2026-09-14T15:00:00.000Z"],
  ],
);
const invalidGroup = parse(groupInput + " unknown", { ...context, selection: groupSelection });
assert.notEqual(invalidGroup.status, "resolved");
assert.equal(invalidGroup.clarification, undefined);
console.log(
  JSON.stringify({
    runtime: process.version,
    checks: "group next-date confirmation and whole-input rejection",
  }),
);
const repeatingDuration = parse(
  "every Monday at 9am for 30 minutes until 2026-10-05 except 2026-09-21",
  context,
);
assert.equal(repeatingDuration.status, "resolved");
assert.equal(repeatingDuration.value.kind, "recurrence");
assert.deepEqual(
  repeatingDuration.value.occurrences.map((row) => [row.start.result.iso, row.end.result.iso]),
  ["2026-09-14", "2026-09-28", "2026-10-05"].map((date) => [
    `${date}T14:00:00.000Z`,
    `${date}T14:30:00.000Z`,
  ]),
);
const dayDurationInput = "October 31, 2026 at 1:30am for 1 day";
const dayQuestion = parse(dayDurationInput, context);
assert.notEqual(dayQuestion.status, "resolved");
assert.ok(dayQuestion.clarification);
const dayDuration = parse(dayDurationInput, {
  ...context,
  selection: {
    contextKey: dayQuestion.clarification.contextKey,
    id: dayQuestion.clarification.choices[1].id,
  },
});
assert.equal(dayDuration.status, "resolved");
assert.equal(dayDuration.value.kind, "interval");
assert.equal(dayDuration.value.start.result.iso, "2026-10-31T06:30:00.000Z");
assert.equal(dayDuration.value.end.result.iso, "2026-11-01T07:30:00.000Z");
console.log(
  JSON.stringify({
    runtime: process.version,
    checks: "repeating duration with exclusions and calendar-duration endpoint choice",
  }),
);
const midnightContext = { timezone: "America/Sao_Paulo", reference: "2018-11-03T12:00:00Z" };
for (const [timezone, reference, instant] of [
  ["America/Sao_Paulo", "2018-11-04T12:00:00Z", "2018-11-04T14:00:00.000Z"],
  ["America/Havana", "2026-11-01T12:00:00Z", "2026-11-01T17:00:00.000Z"],
]) {
  const result = parse("daily at noon", { timezone, reference });
  assert.equal(result.status, "resolved");
  assert.equal(result.value.kind, "recurrence");
  assert.equal(result.value.occurrences[0].start.result.iso, instant);
  assert.equal(parse("daily", { timezone, reference }).status, "needs-clarification");
  const midnight = parse("daily at midnight", { timezone, reference });
  assert.equal(midnight.status, "resolved");
  assert.equal(midnight.value.kind, "recurrence");
  assert.equal(midnight.value.rule.clockOverrides, undefined);
}
for (const reference of ["2026-11-01T07:00:00Z", "2026-11-01T07:30:00Z"]) {
  assert.equal(
    parse("every Sunday at 1:30am", { timezone: "America/Chicago", reference }).status,
    "needs-clarification",
  );
}
const allDay = parse("November 4, 2018", midnightContext);
assert.equal(allDay.status, "resolved");
assert.equal(allDay.value.kind, "point");
assert.equal(allDay.value.precision, "date");
assert.equal(allDay.apiReplay, false);
assert.equal(allDay.value.calculation.result.local, "2018-11-04T01:00:00.000");
assert.equal(parse("November 4, 2018 at midnight", midnightContext).status, "needs-clarification");
assert.notEqual(
  parse("December 30, 2011", { timezone: "Pacific/Apia", reference: "2011-12-28T12:00:00Z" })
    .status,
  "resolved",
);
assert.equal(
  parse("every Monday at 25:00 starting 2026-01-01 until 2026-02-01", context).status,
  "unsupported",
);
const expired = parse("every Monday at noon starting 2026-01-01 until 2026-02-01", context);
assert.equal(expired.status, "resolved");
assert.equal(expired.value.kind, "recurrence");
assert.deepEqual(expired.value.occurrences, []);
console.log(
  JSON.stringify({
    runtime: process.version,
    checks:
      "date-only midnight boundary, explicit clock ambiguity, skipped date and empty-rule validation",
  }),
);

const arithmeticInput = "October 31, 2026 at 1:30am plus 1 day plus 2 hours";
const arithmeticPrompt = parse(arithmeticInput, context);
assert.equal(arithmeticPrompt.status, "needs-clarification");
const [firstArithmetic, secondArithmetic] = arithmeticPrompt.clarification.choices;
const conflictingArithmetic = {
  contextKey: arithmeticPrompt.clarification.contextKey,
  id: secondArithmetic.id,
  previous: [firstArithmetic.id],
};
assert.equal(
  parse(arithmeticInput, { ...context, selection: conflictingArithmetic }).status,
  "needs-clarification",
);
const recoveredArithmetic = parse(arithmeticInput, {
  ...context,
  selection: appendSelection(conflictingArithmetic, {
    contextKey: arithmeticPrompt.clarification.contextKey,
    id: secondArithmetic.id,
  }),
});
assert.equal(recoveredArithmetic.status, "resolved");
assert.equal(recoveredArithmetic.value.kind, "point");
assert.equal(recoveredArithmetic.value.calculation.result.iso, "2026-11-01T09:30:00.000Z");
assert.equal(recoveredArithmetic.value.calculation.steps.length, 2);
assert.equal(recoveredArithmetic.apiReplay, false);
console.log(
  JSON.stringify({
    runtime: process.version,
    checks: "arithmetic clock conflict recovery preserves remaining operations",
  }),
);

const recurrenceInput =
  "Remind me to call Sam every Sunday at 1:30am for 30 minutes starting 2026-11-01 until 2026-11-08";
const recurrenceQuestion = parse(recurrenceInput, context);
assert.equal(recurrenceQuestion.status, "needs-clarification");
const recurrenceIds = recurrenceQuestion.clarification.choices.map((choice) => choice.id);
const recurrenceConflict = {
  contextKey: recurrenceQuestion.clarification.contextKey,
  id: recurrenceIds[1],
  previous: [recurrenceIds[0]],
};
assert.equal(
  parse(recurrenceInput, { ...context, selection: recurrenceConflict }).status,
  "needs-clarification",
);
const recurrenceSelection = appendSelection(recurrenceConflict, {
  contextKey: recurrenceConflict.contextKey,
  id: recurrenceIds[1],
});
const recurrenceAnswer = parse(recurrenceInput, { ...context, selection: recurrenceSelection });
assert.equal(recurrenceAnswer.status, "resolved");
assert.equal(recurrenceAnswer.value.kind, "recurrence");
assert.equal(recurrenceAnswer.event.text, "call Sam");
assert.deepEqual(
  recurrenceAnswer.value.occurrences.map((row) => [row.start.result.iso, row.end.result.iso]),
  [
    ["2026-11-01T07:30:00.000Z", "2026-11-01T08:00:00.000Z"],
    ["2026-11-08T07:30:00.000Z", "2026-11-08T08:00:00.000Z"],
  ],
);
console.log(
  JSON.stringify({
    runtime: process.version,
    checks: "recurrence conflict recovery preserves complete reminder endpoints",
  }),
);

const groupedInput = "Remind me to call Sam Sun 1:15am-1:45am Mon 9am-10am";
const groupedContext = { ...context, reference: "2026-10-31T12:00:00Z" };
const groupedQuestion = parse(groupedInput, groupedContext);
assert.equal(groupedQuestion.status, "needs-clarification");
const groupedIds = groupedQuestion.clarification.choices.map((choice) => choice.id);
const groupedConflict = {
  contextKey: groupedQuestion.clarification.contextKey,
  id: groupedIds[1],
  previous: [groupedIds[0]],
};
const groupedBlocked = parse(groupedInput, { ...groupedContext, selection: groupedConflict });
assert.equal(groupedBlocked.status, "needs-clarification");
assert.match(groupedBlocked.clarification.question, /start/);
let groupedSelection = appendSelection(groupedConflict, {
  contextKey: groupedConflict.contextKey,
  id: groupedIds[1],
});
const groupedEnd = parse(groupedInput, { ...groupedContext, selection: groupedSelection });
assert.equal(groupedEnd.status, "needs-clarification");
groupedSelection = appendSelection(groupedSelection, {
  contextKey: groupedEnd.clarification.contextKey,
  id: groupedEnd.clarification.choices[1].id,
});
const groupedAnswer = parse(groupedInput, { ...groupedContext, selection: groupedSelection });
assert.equal(groupedAnswer.status, "resolved");
assert.equal(groupedAnswer.value.kind, "collection");
assert.equal(groupedAnswer.event.text, "call Sam");
assert.deepEqual(
  groupedAnswer.value.occurrences.map((row) => [row.start.result.iso, row.end.result.iso]),
  [
    ["2026-11-01T07:15:00.000Z", "2026-11-01T07:45:00.000Z"],
    ["2026-11-02T15:00:00.000Z", "2026-11-02T16:00:00.000Z"],
  ],
);
const groupedChanged = parse(groupedInput, {
  ...groupedContext,
  selection: appendSelection(groupedSelection, {
    contextKey: groupedConflict.contextKey,
    id: groupedIds[0],
  }),
});
assert.equal(groupedChanged.status, "needs-clarification");
assert.match(groupedChanged.clarification.question, /end/);
console.log(
  JSON.stringify({
    runtime: process.version,
    checks: "group conflict recovery, complete reminder endpoints and dependent end invalidation",
  }),
);

const spacedReminder = parse(
  "Remind me to call Sam every other Monday at 9am for 30 minutes starting 2026-09-14 until 2026-10-26 except 2026-09-28",
  { ...context, reference: "2026-09-20T16:00:00Z" },
);
assert.equal(spacedReminder.status, "resolved");
assert.equal(spacedReminder.value.kind, "recurrence");
assert.equal(spacedReminder.value.rule.interval, 2);
assert.deepEqual(
  spacedReminder.value.occurrences.map((row) => [row.start.result.iso, row.end.result.iso]),
  [
    ["2026-10-12T14:00:00.000Z", "2026-10-12T14:30:00.000Z"],
    ["2026-10-26T14:00:00.000Z", "2026-10-26T14:30:00.000Z"],
  ],
);
console.log(
  JSON.stringify({
    runtime: process.version,
    checks: "anchored fortnightly reminder retains exclusions after reference changes",
  }),
);

const shortInput = "Remind me to call Sam 03/04/2027 at noon for 30 seconds";
const shortQuestion = parse(shortInput, context);
assert.equal(shortQuestion.status, "needs-clarification");
const shortResult = parse(shortInput, {
  ...context,
  selection: {
    contextKey: shortQuestion.clarification.contextKey,
    id: "2027-04-03",
  },
});
assert.equal(shortResult.status, "resolved");
assert.equal(shortResult.value.kind, "interval");
assert.equal(shortResult.value.end.result.iso, "2027-04-03T17:00:30.000Z");
assert.equal(shortResult.event.text, "call Sam");
console.log(
  JSON.stringify({ runtime: process.version, checks: "seconds duration survives date correction" }),
);

const alternativeInput =
  "Remind me to call Sam tomorrow at noon for 30 minutes or Friday at 2pm for 30 seconds";
const alternativeQuestion = parse(alternativeInput, context);
assert.equal(alternativeQuestion.status, "needs-clarification");
const alternativeSelection = {
  contextKey: alternativeQuestion.clarification.contextKey,
  id: "alternative:second",
};
const alternativeResult = parse(alternativeInput, { ...context, selection: alternativeSelection });
assert.equal(alternativeResult.status, "resolved");
assert.equal(alternativeResult.value.kind, "interval");
assert.equal(alternativeResult.value.start.result.iso, "2026-09-18T19:00:00.000Z");
assert.equal(alternativeResult.value.end.result.iso, "2026-09-18T19:00:30.000Z");
assert.equal(alternativeResult.event.text, "call Sam");
assert.equal(alternativeResult.apiReplay, false);
assert.equal(
  parse(alternativeInput + " ", { ...context, selection: alternativeSelection }).status,
  "needs-clarification",
);
console.log(
  JSON.stringify({
    runtime: process.version,
    checks: "complete alternative selection preserves duration and invalidates after edits",
  }),
);

const nestedInput = "Remind me to call Sam tomorrow at noon or 01/11/2026 at 1:30am for 30 seconds";
let nestedSelection;
for (const index of [1, 1, 1]) {
  const question = parse(nestedInput, { ...context, selection: nestedSelection });
  assert.equal(question.status, "needs-clarification");
  assert.ok(question.clarification);
  nestedSelection = appendSelection(nestedSelection, {
    contextKey: question.clarification.contextKey,
    id: question.clarification.choices[index].id,
  });
}
const nestedResult = parse(nestedInput, { ...context, selection: nestedSelection });
assert.equal(nestedResult.status, "resolved");
assert.equal(nestedResult.value.kind, "interval");
assert.equal(nestedResult.value.start.result.iso, "2026-11-01T07:30:00.000Z");
assert.equal(nestedResult.value.end.result.iso, "2026-11-01T07:30:30.000Z");
assert.equal(nestedResult.event.text, "call Sam");
assert.equal(nestedResult.input, nestedInput);
assert.equal(nestedResult.apiReplay, false);
assert.equal(
  parse(nestedInput + " ", { ...context, selection: nestedSelection }).status,
  "needs-clarification",
);
console.log(
  JSON.stringify({
    runtime: process.version,
    checks:
      "staged date and clock choices retain the complete alternative and reject stale selections",
  }),
);

const correctionInput =
  "Remind me to call Sam Friday at noon for 30 minutes, actually 01/11/2026 at 1:30am for 30 seconds instead";
for (const [finalId, expectedStart, expectedEnd] of [
  ["keep", "2026-09-18T17:00:00.000Z", "2026-09-18T17:30:00.000Z"],
  ["replace", "2026-11-01T07:30:00.000Z", "2026-11-01T07:30:30.000Z"],
]) {
  let selection;
  for (const id of [
    "correction:branch:1:2026-11-01",
    "correction:branch:1:interval:start:2026-11-01T07:30:00Z",
    finalId,
  ]) {
    const question = parse(correctionInput, { ...context, selection });
    assert.equal(question.status, "needs-clarification");
    assert.ok(question.clarification.choices.some((choice) => choice.id === id));
    selection = appendSelection(selection, { contextKey: question.clarification.contextKey, id });
  }
  const corrected = parse(correctionInput, { ...context, selection });
  assert.equal(corrected.status, "resolved");
  assert.equal(corrected.value.kind, "interval");
  assert.deepEqual(
    [corrected.value.start.result.iso, corrected.value.end.result.iso],
    [expectedStart, expectedEnd],
  );
  assert.equal(corrected.input, correctionInput);
  assert.equal(corrected.event.text, "call Sam");
  assert.equal(corrected.apiReplay, false);
  assert.equal(
    parse(correctionInput + " ", { ...context, selection }).status,
    "needs-clarification",
  );
}
console.log(
  JSON.stringify({
    runtime: process.version,
    checks: "staged correction preserves both keep/replace durations and invalidates after edits",
  }),
);

const direct = parse("Call Sam tomorrow at noon", context);
assert.equal(direct.status, "resolved");
assert.equal(direct.value.kind, "point");
assert.equal(direct.event.text, "Call Sam");
assert.equal(direct.value.calculation.result.iso, "2026-09-13T17:00:00.000Z");
assert.equal(direct.input.slice(direct.event.span.start, direct.event.span.end), "Call Sam");
assert.equal(parse("Call Sam tomorrow unless it rains", context).status, "needs-clarification");
console.log(
  JSON.stringify({
    runtime: process.version,
    checks: "direct command preserves event case and spans without discarding conditions",
  }),
);

const halfHourInput = "Call Sam 01/11/2026 at 1:30am for half an hour";
let halfHourSelection;
for (const id of ["2026-11-01", "interval:start:2026-11-01T07:30:00Z"]) {
  const question = parse(halfHourInput, { ...context, selection: halfHourSelection });
  assert.equal(question.status, "needs-clarification");
  assert.ok(question.clarification.choices.some((choice) => choice.id === id));
  halfHourSelection = appendSelection(halfHourSelection, {
    contextKey: question.clarification.contextKey,
    id,
  });
}
const halfHour = parse(halfHourInput, { ...context, selection: halfHourSelection });
assert.equal(halfHour.status, "resolved");
assert.equal(halfHour.value.kind, "interval");
assert.deepEqual(
  [halfHour.value.start.result.iso, halfHour.value.end.result.iso],
  ["2026-11-01T07:30:00.000Z", "2026-11-01T08:00:00.000Z"],
);
assert.equal(halfHour.event.text, "Call Sam");
assert.equal(halfHour.input, halfHourInput);
assert.ok(halfHour.source.text.includes("half an hour"));
assert.equal(
  parse(halfHourInput.replace("half an hour", "0 minutes"), {
    ...context,
    selection: halfHourSelection,
  }).status === "resolved",
  false,
);
console.log(
  JSON.stringify({
    runtime: process.version,
    checks: "half-hour interval survives date/clock choices and invalid duration edit",
  }),
);

const titleInput = "Dentist appointment 01/11/2026 at 1:30am for half an hour";
let titleSelection;
for (const id of ["event:title", "2026-11-01", "interval:start:2026-11-01T07:30:00Z"]) {
  const question = parse(titleInput, { ...context, selection: titleSelection });
  assert.equal(question.status, "needs-clarification");
  assert.ok(question.clarification.choices.some((choice) => choice.id === id));
  titleSelection = appendSelection(titleSelection, {
    contextKey: question.clarification.contextKey,
    id,
  });
}
const titled = parse(titleInput, { ...context, selection: titleSelection });
assert.equal(titled.status, "resolved");
assert.equal(titled.value.kind, "interval");
assert.equal(titled.event.text, "Dentist appointment");
assert.equal(titled.input, titleInput);
assert.equal(titled.apiReplay, false);
assert.ok(titled.selectedChoice.includes("Title: Dentist appointment"));
assert.deepEqual(
  [titled.value.start.result.iso, titled.value.end.result.iso],
  ["2026-11-01T07:30:00.000Z", "2026-11-01T08:00:00.000Z"],
);
assert.equal(parse(titleInput, context).status, "needs-clarification");
assert.equal(
  parse(titleInput + " ", { ...context, selection: titleSelection }).status,
  "needs-clarification",
);
console.log(
  JSON.stringify({
    runtime: process.version,
    checks: "title/date/clock decisions preserve complete interval and reset safely",
  }),
);
