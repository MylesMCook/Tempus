import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { parse, appendSelection } from "./sdk";
import { prepareCalendarFile } from "./calendar-file";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  title: "Call Sam",
};
it("retains the title and every source span through a two-date reminder file", () => {
  const input = "Call Sam September 14, 2026 at noon and September 16, 2026 at noon";
  const result = parse(input, context);
  if (result.status !== "resolved" || result.value.kind !== "collection")
    throw Error(JSON.stringify(result));
  expect(result.event?.text).toBe("Call Sam");
  expect(result.input).toBe(input);
  expect(result.value.occurrences.map((row) => row.start.result.iso)).toEqual([
    "2026-09-14T17:00:00.000Z",
    "2026-09-16T17:00:00.000Z",
  ]);
  for (const row of result.value.occurrences)
    expect(input.slice(row.source.span.start, row.source.span.end)).toBe(row.source.text);
  const file = prepareCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  expect(file.eventCount).toBe(2);
  const events = new ICAL.Component(ICAL.parse(file.text))
    .getAllSubcomponents("vevent")
    .map((component) => new ICAL.Event(component));
  expect(events.map((event) => event.startDate.toJSDate().toISOString())).toEqual([
    "2026-09-14T17:00:00.000Z",
    "2026-09-16T17:00:00.000Z",
  ]);
  expect(events.every((event) => event.summary === "Call Sam")).toBe(true);
});
it("keeps date-only entries as dates rather than midnight appointments", () => {
  const input = "2026-09-16 and 2026-09-14 at noon";
  const question = parse(input, context);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw Error("Missing shared-time question");
  expect(prepareCalendarFile(question, metadata).ok).toBe(false);
  const result = parse(input, {
    ...context,
    selection: { contextKey: question.clarification.contextKey, id: "list:0:time:date-only" },
  });
  const file = prepareCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  expect(file.text).toContain("DTSTART;VALUE=DATE:20260916");
  expect(file.text).toContain("DTSTART:20260914T170000Z");
  expect(file.text).not.toContain("DTSTART:20260916T");
});
it("preserves separate numeric-date and occurrence-clock answers", () => {
  const input = "Call Sam 11/01/2026 at 1:30am and 2026-11-08 at noon";
  const options = { ...context, reference: "2026-10-31T12:00:00Z" };
  const first = parse(input, options);
  if (first.status !== "needs-clarification" || !first.clarification)
    throw Error(JSON.stringify(first));
  let selection = appendSelection(undefined, {
    contextKey: first.clarification.contextKey,
    id: "list:0:date:2026-11-01",
  });
  const question = parse(input, { ...options, selection });
  if (question.status !== "needs-clarification" || !question.clarification)
    throw Error("Missing clock choice");
  selection = appendSelection(selection, {
    contextKey: question.clarification.contextKey,
    id: question.clarification.choices[1].id,
  });
  const result = parse(input, { ...options, selection });
  if (result.status !== "resolved" || result.value.kind !== "collection")
    throw Error(JSON.stringify(result));
  expect(result.value.occurrences[0].start.result.iso).toBe("2026-11-01T07:30:00.000Z");
  expect(prepareCalendarFile(result, metadata).ok).toBe(true);
  expect(parse(input + " ", { ...options, selection }).status).toBe("needs-clarification");
  const changed = appendSelection(selection, {
    contextKey: first.clarification.contextKey,
    id: "list:0:date:2026-01-11",
  });
  expect(changed?.previous?.some((id) => id.startsWith("list:0:start:"))).toBe(false);
});
it("exports complete durations and overnight intervals in written order", () => {
  const result = parse(
    "Call Sam 2026-09-16 at noon for half an hour and 2026-09-14 from 10pm to 1am",
    context,
  );
  if (result.status !== "resolved" || result.value.kind !== "collection")
    throw Error(JSON.stringify(result));
  expect(
    result.value.occurrences.map((row) => [row.start.result.iso, row.end?.result.iso]),
  ).toEqual([
    ["2026-09-16T17:00:00.000Z", "2026-09-16T17:30:00.000Z"],
    ["2026-09-15T03:00:00.000Z", "2026-09-15T06:00:00.000Z"],
  ]);
  expect(prepareCalendarFile(result, metadata).ok).toBe(true);
});
it.each([
  "2026-09-14 at noon and maybe 2026-09-16 at noon",
  "2026-09-14 at noon and 2026-02-30 at noon",
  "2026-09-14 at noon and 2026-09-14 at noon",
  "2026-09-14 at noon and later",
  "2026-09-14 at noon and 2026-09-16 at noon except Friday",
])("does not export incomplete or conflicting list %s", (input) => {
  const result = parse(input, context);
  expect(result.status).not.toBe("resolved");
  expect(prepareCalendarFile(result, metadata).ok).toBe(false);
});

it("asks before treating equal list endpoints as a full day", () => {
  const input = "2026-09-14 from noon to noon and 2026-09-16 at noon";
  const question = parse(input, context);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw Error(JSON.stringify(question));
  expect(question.clarification.choices[0].id).toBe("list:0:end-next-day");
  const result = parse(input, {
    ...context,
    selection: {
      contextKey: question.clarification.contextKey,
      id: question.clarification.choices[0].id,
    },
  });
  if (result.status !== "resolved" || result.value.kind !== "collection")
    throw Error(JSON.stringify(result));
  expect(result.value.occurrences[0].end?.result.iso).toBe("2026-09-15T17:00:00.000Z");
});
it("rejects stale list decisions after timezone or reference changes", () => {
  const input = "11/01/2026 at 1:30am and 2026-11-08 at noon";
  const question = parse(input, context);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw Error("Missing date choice");
  const selection = { contextKey: question.clarification.contextKey, id: "list:0:date:2026-01-11" };
  expect(parse(input, { ...context, selection }).status).toBe("resolved");
  expect(parse(input, { ...context, timezone: "UTC", selection }).status).toBe(
    "needs-clarification",
  );
  expect(parse(input, { ...context, reference: "2026-09-13T16:00:00Z", selection }).status).toBe(
    "needs-clarification",
  );
});

it("requires an explicit shared clock and preserves both original spans", () => {
  const input = "Call Sam 2026-09-14 and 2026-09-16 at noon";
  const question = parse(input, context);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw Error("Missing time scope");
  const selection = { contextKey: question.clarification.contextKey, id: "list:0:time:0" };
  const result = parse(input, { ...context, selection });
  if (result.status !== "resolved" || result.value.kind !== "collection")
    throw Error(JSON.stringify(result));
  expect(result.value.occurrences.map((row) => row.start.result.iso)).toEqual([
    "2026-09-14T17:00:00.000Z",
    "2026-09-16T17:00:00.000Z",
  ]);
  for (const row of result.value.occurrences)
    expect(input.slice(row.source.span.start, row.source.span.end)).toBe(row.source.text);
  expect(prepareCalendarFile(result, metadata).ok).toBe(true);
  expect(parse(input.replace("noon", "midnight"), { ...context, selection }).status).toBe(
    "needs-clarification",
  );
});
it("retains numeric, shared-time and repeated-clock answers separately", () => {
  const input = "11/01/2026 and 2026-11-08 at 1:30am";
  const first = parse(input, context);
  if (first.status !== "needs-clarification" || !first.clarification)
    throw Error("Missing date question");
  let selection = appendSelection(undefined, {
    contextKey: first.clarification.contextKey,
    id: "list:0:date:2026-11-01",
  });
  const time = parse(input, { ...context, selection });
  expect(time.status).toBe("needs-clarification");
  selection = appendSelection(selection, {
    contextKey: first.clarification.contextKey,
    id: "list:0:time:0",
  });
  const clock = parse(input, { ...context, selection });
  if (clock.status !== "needs-clarification" || !clock.clarification)
    throw Error("Missing repeated-clock question");
  selection = appendSelection(selection, {
    contextKey: first.clarification.contextKey,
    id: clock.clarification.choices[1].id,
  });
  const result = parse(input, { ...context, selection });
  if (result.status !== "resolved" || result.value.kind !== "collection")
    throw Error(JSON.stringify(result));
  expect(result.value.occurrences[0].start.result.iso).toBe("2026-11-01T07:30:00.000Z");
  const changed = appendSelection(selection, {
    contextKey: first.clarification.contextKey,
    id: "list:0:time:date-only",
  });
  expect(changed?.previous).toEqual(["list:0:date:2026-11-01"]);
});

it("completes a valid list requiring more than 32 prior answers", () => {
  const years: number[] = [];
  for (let year = 2026; years.length < 13; year++)
    if (new Date(Date.UTC(year, 10, 1)).getUTCDay() === 0) years.push(year);
  const input = years.map((year) => `11/1/${year}`).join(" and ") + " at 1:30am";
  expect(input.length).toBeLessThanOrEqual(200);
  let selection: Parameters<typeof appendSelection>[0];
  let result = parse(input, context);
  let answers = 0;
  while (result.status === "needs-clarification" && result.clarification && answers < 50) {
    const choices = result.clarification.choices;
    const choice =
      choices.find((choice) => /:date:.*-11-01$/.test(choice.id)) ??
      choices.find((choice) => choice.id.endsWith(":time:0")) ??
      choices[choices.length - 1];
    selection = appendSelection(selection, {
      contextKey: result.clarification.contextKey,
      id: choice.id,
    });
    result = parse(input, { ...context, selection });
    answers++;
  }
  expect(answers).toBe(38);
  if (result.status !== "resolved" || result.value.kind !== "collection")
    throw Error("The list lost an earlier answer");
  expect(result.value.occurrences).toHaveLength(13);
  expect(
    result.value.occurrences.every((row) => row.start.result.iso.endsWith("T07:30:00.000Z")),
  ).toBe(true);
  expect(prepareCalendarFile(result, metadata).ok).toBe(true);
});

it("completes a same-month reminder after an explicit shared-time answer", () => {
  const input = "Call Sam September 14 and 16, 2026 at noon";
  const question = parse(input, context);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw Error("Missing time-scope question");
  expect(prepareCalendarFile(question, metadata)).toMatchObject({ ok: false, code: "unresolved" });
  const result = parse(input, {
    ...context,
    selection: { contextKey: question.clarification.contextKey, id: "list:0:time:0" },
  });
  if (result.status !== "resolved" || result.value.kind !== "collection")
    throw Error(JSON.stringify(result));
  expect(result.input).toBe(input);
  expect(result.event?.text).toBe("Call Sam");
  expect(result.value.occurrences.map((row) => row.start.result.iso)).toEqual([
    "2026-09-14T17:00:00.000Z",
    "2026-09-16T17:00:00.000Z",
  ]);
  expect(result.value.occurrences.map((row) => row.source.text)).toEqual([
    "September 14",
    "16, 2026 at noon",
  ]);
  for (const row of result.value.occurrences)
    expect(input.slice(row.source.span.start, row.source.span.end)).toBe(row.source.text);
  const file = prepareCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  const events = new ICAL.Component(ICAL.parse(file.text))
    .getAllSubcomponents("vevent")
    .map((event) => new ICAL.Event(event));
  expect(events.map((event) => event.startDate.toJSDate().toISOString())).toEqual([
    "2026-09-14T17:00:00.000Z",
    "2026-09-16T17:00:00.000Z",
  ]);
  expect(events.every((event) => event.summary === "Call Sam")).toBe(true);
  expect(
    parse(input.replace("2026", "2027"), {
      ...context,
      selection: { contextKey: question.clarification.contextKey, id: "list:0:time:0" },
    }).status,
  ).toBe("needs-clarification");
});
it("preserves date-only shorthand and written order when the year occurs first", () => {
  const result = parse("September 16, 2026 and 14", context);
  if (result.status !== "resolved" || result.value.kind !== "collection")
    throw Error(JSON.stringify(result));
  expect(
    result.value.occurrences.map((row) => [row.start.result.local.slice(0, 10), row.allDay]),
  ).toEqual([
    ["2026-09-16", true],
    ["2026-09-14", true],
  ]);
  const file = prepareCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  expect(file.text).toContain("DTSTART;VALUE=DATE:20260916");
  expect(file.text).toContain("DTSTART;VALUE=DATE:20260914");
});
it.each([
  "September 14 and 16 at noon",
  "September 14, 2026 and 16, 2027 at noon",
  "December 31 and January 1, 2027 at noon",
  "February 28 and 29, 2027 at noon",
  "September 14 and 14, 2026",
  "September 14 and maybe 16, 2026 at noon",
  "September 14 and 16, 2026 at noon except Friday",
])("does not discard ambiguous or invalid shorthand qualifiers: %s", (input) => {
  const result = parse(input, context);
  expect(result.status).not.toBe("resolved");
  expect(prepareCalendarFile(result, metadata).ok).toBe(false);
  expect(result.input).toBe(input);
});

it("asks for a shared year before time scope and preserves the complete reminder", () => {
  const input = "Call Sam September 14 and 16 at noon";
  const question = parse(input, context);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw Error(JSON.stringify(question));
  expect(question.clarification.choices.map((choice) => choice.id)).toEqual([
    "list:year:2026",
    "list:year:2027",
  ]);
  expect(question.error.hint).toContain("another year");
  expect(prepareCalendarFile(question, metadata).ok).toBe(false);
  let selection = appendSelection(undefined, {
    contextKey: question.clarification.contextKey,
    id: "list:year:2026",
  });
  const time = parse(input, { ...context, selection });
  if (time.status !== "needs-clarification" || !time.clarification)
    throw Error(JSON.stringify(time));
  expect(time.clarification.choices.some((choice) => choice.id === "list:0:time:0")).toBe(true);
  selection = appendSelection(selection, {
    contextKey: time.clarification.contextKey,
    id: "list:0:time:0",
  });
  const resolved = parse(input, { ...context, selection });
  if (resolved.status !== "resolved" || resolved.value.kind !== "collection")
    throw Error(JSON.stringify(resolved));
  expect(resolved.input).toBe(input);
  expect(resolved.event?.text).toBe("Call Sam");
  expect(resolved.value.occurrences.map((row) => row.start.result.iso)).toEqual([
    "2026-09-14T17:00:00.000Z",
    "2026-09-16T17:00:00.000Z",
  ]);
  for (const row of resolved.value.occurrences)
    expect(input.slice(row.source.span.start, row.source.span.end)).toBe(row.source.text);
  const file = prepareCalendarFile(resolved, metadata);
  if (!file.ok) throw Error(file.reason);
  expect(file.eventCount).toBe(2);
  expect(file.text).toContain("20260916T170000Z");
  const replaced = appendSelection(selection, {
    contextKey: question.clarification.contextKey,
    id: "list:year:2027",
  });
  expect(replaced?.previous).toEqual([]);
  expect(parse(input, { ...context, selection: replaced }).status).toBe("needs-clarification");
  expect(parse(input.replace("16", "17"), { ...context, selection }).status).toBe(
    "needs-clarification",
  );
});

it("uses the reference's local year only as an offered choice, never as a selected year", () => {
  const input = "Call Sam September 14 and 16";
  const result = parse(input, { ...context, reference: "2027-01-01T00:30:00Z" });
  if (result.status !== "needs-clarification" || !result.clarification)
    throw Error(JSON.stringify(result));
  expect(result.clarification.choices.map((choice) => choice.label)).toEqual(["2026", "2027"]);
  const tampered = parse(input, {
    ...context,
    reference: "2027-01-01T00:30:00Z",
    selection: { contextKey: result.clarification.contextKey, id: "list:year:2028" },
  });
  expect(tampered.status).toBe("needs-clarification");
});

it("does not turn a year choice into permission to discard an invalid date", () => {
  const input = "Call Sam February 29 and 28 at noon";
  const question = parse(input, context);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw Error(JSON.stringify(question));
  const result = parse(input, {
    ...context,
    selection: { contextKey: question.clarification.contextKey, id: "list:year:2026" },
  });
  expect(result.status).not.toBe("resolved");
  expect(prepareCalendarFile(result, metadata).ok).toBe(false);
});

it("completes mixed-month reminder year/time choices without rolling dates forward", () => {
  for (const [input, expected] of [
    [
      "Call Sam September 30 and October 2 at noon",
      ["2026-09-30T17:00:00.000Z", "2026-10-02T17:00:00.000Z"],
    ],
    [
      "Call Sam December 31 and January 1 at noon",
      ["2026-12-31T18:00:00.000Z", "2026-01-01T18:00:00.000Z"],
    ],
  ] as const) {
    let selection;
    let result = parse(input, context);
    for (const id of ["list:year:2026", "list:0:time:0"]) {
      if (result.status !== "needs-clarification" || !result.clarification)
        throw Error(JSON.stringify(result));
      expect(prepareCalendarFile(result, metadata).ok).toBe(false);
      expect(result.clarification.choices.some((choice) => choice.id === id)).toBe(true);
      selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
      result = parse(input, { ...context, selection });
    }
    if (result.status !== "resolved" || result.value.kind !== "collection")
      throw Error(JSON.stringify(result));
    expect(result.event?.text).toBe("Call Sam");
    expect(result.value.occurrences.map((row) => row.start.result.iso)).toEqual(expected);
    for (const row of result.value.occurrences)
      expect(input.slice(row.source.span.start, row.source.span.end)).toBe(row.source.text);
    const file = prepareCalendarFile(result, metadata);
    if (!file.ok) throw Error(file.reason);
    const events = new ICAL.Component(ICAL.parse(file.text)).getAllSubcomponents("vevent");
    expect(events.map((event) => new ICAL.Event(event).startDate.toJSDate().toISOString())).toEqual(
      expected,
    );
    expect(
      events.every((event) => !event.hasProperty("dtend") && !event.hasProperty("duration")),
    ).toBe(true);
    const edited = parse(input.replace("at noon", "at 1pm"), { ...context, selection });
    expect(edited.status).toBe("needs-clarification");
    expect(prepareCalendarFile(edited, metadata).ok).toBe(false);
  }
});

it.each([
  "September 30 and October 2, 2026 at noon",
  "September 30 and October 2 and 3 at noon",
  "September 30 and October 2 at noon except Friday",
  "September 30 and maybe October 2 at noon",
])("does not infer a mixed-month year, missing month or discarded qualifier: %s", (input) => {
  const result = parse(input, context);
  expect(result.status).not.toBe("resolved");
  expect(prepareCalendarFile(result, metadata).ok).toBe(false);
});

it("completes a year-boundary reminder without changing the written year", () => {
  const input = "Call Sam December 31 and January 1, 2027 at noon";
  let selection;
  let result = parse(input, context);
  for (const id of ["list:0:year:2026", "list:0:time:0"]) {
    if (result.status !== "needs-clarification" || !result.clarification)
      throw Error(JSON.stringify(result));
    expect(result.clarification.choices.some((choice) => choice.id === id)).toBe(true);
    expect(prepareCalendarFile(result, metadata).ok).toBe(false);
    selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
    result = parse(input, { ...context, selection });
  }
  if (result.status !== "resolved" || result.value.kind !== "collection")
    throw Error(JSON.stringify(result));
  expect(result.input).toBe(input);
  expect(result.event?.text).toBe("Call Sam");
  expect(result.value.occurrences.map((row) => row.start.result.iso)).toEqual([
    "2026-12-31T18:00:00.000Z",
    "2027-01-01T18:00:00.000Z",
  ]);
  for (const row of result.value.occurrences)
    expect(input.slice(row.source.span.start, row.source.span.end)).toBe(row.source.text);
  const file = prepareCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  const events = new ICAL.Component(ICAL.parse(file.text)).getAllSubcomponents("vevent");
  expect(events.map((event) => new ICAL.Event(event).startDate.toJSDate().toISOString())).toEqual([
    "2026-12-31T18:00:00.000Z",
    "2027-01-01T18:00:00.000Z",
  ]);
  const changedYear = appendSelection(selection, {
    contextKey: selection!.contextKey,
    id: "list:0:year:2027",
  });
  expect(changedYear?.previous).toEqual([]);
  expect(parse(input, { ...context, selection: changedYear }).status).toBe("needs-clarification");
  expect(parse(input.replace("2027", "2028"), { ...context, selection }).status).toBe(
    "needs-clarification",
  );
});

it("does not treat an item year choice as permission to normalize an invalid date", () => {
  const input = "February 29 and March 1, 2027";
  const question = parse(input, context);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw Error("Missing year choice");
  for (const year of ["2027", "2030"]) {
    const result = parse(input, {
      ...context,
      selection: { contextKey: question.clarification.contextKey, id: `list:0:year:${year}` },
    });
    expect(result.status).not.toBe("resolved");
    expect(prepareCalendarFile(result, metadata).ok).toBe(false);
  }
});

it("completes an omitted-month reminder through month, year, time and file", () => {
  const input = "Call Sam September 30 and October 2 and 4 at noon";
  let selection;
  let result = parse(input, context);
  for (const id of ["list:2:month:october", "list:year:2026", "list:0:time:0", "list:1:time:0"]) {
    if (result.status !== "needs-clarification" || !result.clarification)
      throw Error(JSON.stringify(result));
    expect(result.clarification.choices.some((choice) => choice.id === id)).toBe(true);
    expect(prepareCalendarFile(result, metadata).ok).toBe(false);
    selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
    result = parse(input, { ...context, selection });
  }
  if (result.status !== "resolved" || result.value.kind !== "collection")
    throw Error(JSON.stringify(result));
  expect(result.input).toBe(input);
  expect(result.event?.text).toBe("Call Sam");
  const expected = [
    "2026-09-30T17:00:00.000Z",
    "2026-10-02T17:00:00.000Z",
    "2026-10-04T17:00:00.000Z",
  ];
  expect(result.value.occurrences.map((row) => row.start.result.iso)).toEqual(expected);
  for (const row of result.value.occurrences)
    expect(input.slice(row.source.span.start, row.source.span.end)).toBe(row.source.text);
  const file = prepareCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  const events = new ICAL.Component(ICAL.parse(file.text)).getAllSubcomponents("vevent");
  expect(events.map((event) => new ICAL.Event(event).startDate.toJSDate().toISOString())).toEqual(
    expected,
  );
  expect(
    events.every((event) => !event.hasProperty("dtend") && !event.hasProperty("duration")),
  ).toBe(true);
  const changedMonth = appendSelection(selection, {
    contextKey: selection!.contextKey,
    id: "list:2:month:september",
  });
  const changed = parse(input, { ...context, selection: changedMonth });
  if (changed.status !== "resolved" || changed.value.kind !== "collection")
    throw Error(JSON.stringify(changed));
  expect(changed.value.occurrences[2].start.result.iso).toBe("2026-09-04T17:00:00.000Z");
  const edited = parse(input.replace("4 at", "5 at"), { ...context, selection });
  expect(edited.status).toBe("needs-clarification");
  expect(prepareCalendarFile(edited, metadata).ok).toBe(false);
});

it("does not use a month answer to accept an invalid date or unoffered month", () => {
  const input = "September 30, 2026 and October 2, 2026 and 31, 2026";
  const question = parse(input, context);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw Error(JSON.stringify(question));
  for (const month of ["september", "november"]) {
    const result = parse(input, {
      ...context,
      selection: { contextKey: question.clarification.contextKey, id: `list:2:month:${month}` },
    });
    expect(result.status).not.toBe("resolved");
    expect(prepareCalendarFile(result, metadata).ok).toBe(false);
  }
});

it("retains the month through an item-year answer and clears dependent answers when it changes", () => {
  const input = "September 30, 2026 and October 2, 2026 and 4";
  let selection;
  let result = parse(input, context);
  for (const id of ["list:2:month:october", "list:2:year:2026"]) {
    if (result.status !== "needs-clarification" || !result.clarification)
      throw Error(JSON.stringify(result));
    expect(result.clarification.choices.some((choice) => choice.id === id)).toBe(true);
    selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
    result = parse(input, { ...context, selection });
  }
  expect(result.status).toBe("resolved");
  const changed = appendSelection(selection, {
    contextKey: selection!.contextKey,
    id: "list:2:month:september",
  });
  expect(changed?.previous?.some((id) => id.startsWith("list:2:year:"))).toBe(false);
  expect(parse(input, { ...context, selection: changed }).status).toBe("needs-clarification");
});
