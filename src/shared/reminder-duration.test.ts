import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { interpretDate } from "./interpret-date";
import { prepareCalendarFile } from "./calendar-file";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
it.each([
  ["tomorrow at noon for 30 minutes", "2026-09-13T17:00:00.000Z", "2026-09-13T17:30:00.000Z"],
  ["March 8, 2026 at 1:30am for 1 hour", "2026-03-08T07:30:00.000Z", "2026-03-08T08:30:00.000Z"],
  ["March 8, 2026 for 1 day", "2026-03-08T06:00:00.000Z", "2026-03-09T05:00:00.000Z"],
])("retains complete reminder duration: %s", (date, start, end) => {
  const input = `Remind me to call Sam ${date}`;
  const result = interpretDate(input, context);
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw new Error(JSON.stringify(result));
  expect(result.value.start.result.iso).toBe(start);
  expect(result.value.end.result.iso).toBe(end);
  expect(result.event?.text).toBe("call Sam");
  expect(input.slice(result.source.span.start, result.source.span.end)).toBe(date);
});
it("clarifies the start, preserves elapsed duration and independently reads the file", () => {
  const input = "Remind me to call Sam November 1, 2026 at 1:30am for 30 minutes";
  const first = interpretDate(input, context);
  if (first.status === "resolved" || !first.clarification) throw new Error("Missing clock choice");
  const selection = {
    contextKey: first.clarification.contextKey,
    id: first.clarification.choices[1].id,
  };
  const result = interpretDate(input, { ...context, selection });
  const file = prepareCalendarFile(result, {
    uid: "11111111-2222-4333-8444-555555555555",
    stamp: context.reference,
    title: "call Sam",
  });
  if (!file.ok) throw new Error(file.reason);
  const event = new ICAL.Event(
    new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!,
  );
  expect(event.startDate.toJSDate().toISOString()).toBe("2026-11-01T07:30:00.000Z");
  expect(event.endDate.toJSDate().toISOString()).toBe("2026-11-01T08:00:00.000Z");
  expect(event.description).toContain("November 1, 2026 at 1:30am for 30 minutes");
  expect(event.summary).toBe("call Sam");
  expect(interpretDate(input + " ", { ...context, selection }).status).toBe("needs-clarification");
});
it.each([
  "tomorrow at noon for",
  "tomorrow at noon for 0 minutes",
  "tomorrow at noon for 30 minutes unless it rains",
  "tomorrow at noon for 30 minutes plus 1 day",
  "tomorrow plus 1 day for 30 minutes",
])("does not discard a qualifier: %s", (date) => {
  expect(interpretDate(`Remind me to call Sam ${date}`, context).status).not.toBe("resolved");
});

it.each([
  [
    "03/04/2027 at noon for 30 seconds",
    [1],
    "2027-04-03T17:00:00.000Z",
    "2027-04-03T17:00:30.000Z",
  ],
  [
    "03/04/2027 at noon for 30 minutes",
    [1],
    "2027-04-03T17:00:00.000Z",
    "2027-04-03T17:30:00.000Z",
  ],
  ["03/04/2027 for 1 day", [1], "2027-04-03T05:00:00.000Z", "2027-04-04T05:00:00.000Z"],
  [
    "11/01/2026 at 1:30am for 30 minutes",
    [0, 1],
    "2026-11-01T07:30:00.000Z",
    "2026-11-01T08:00:00.000Z",
  ],
] as const)(
  "retains duration through numeric and clock choices: %s",
  (date, indices, start, end) => {
    const input = `Remind me to call Sam ${date}`;
    let result = interpretDate(input, context);
    let selection: import("./clarify-numeric-date").ClarificationSelection | undefined;
    for (const index of indices) {
      if (result.status === "resolved" || !result.clarification) throw new Error("Missing choice");
      const previous = selection ? [...(selection.previous ?? []), selection.id] : [];
      selection = {
        contextKey: result.clarification.contextKey,
        id: result.clarification.choices[index].id,
        previous,
      };
      result = interpretDate(input, { ...context, selection });
    }
    if (result.status !== "resolved" || result.value.kind !== "interval")
      throw new Error(JSON.stringify(result));
    expect(result.value.start.result.iso).toBe(start);
    expect(result.value.end.result.iso).toBe(end);
    expect(result.source.text).toBe(date);
    expect(input.slice(result.source.span.start, result.source.span.end)).toBe(date);
    expect(result.event?.text).toBe("call Sam");
    expect(interpretDate(input + " ", { ...context, selection }).status).toBe(
      "needs-clarification",
    );
    const file = prepareCalendarFile(result, {
      uid: "11111111-2222-4333-8444-555555555555",
      stamp: context.reference,
      title: "call Sam",
    });
    if (!file.ok) throw new Error(file.reason);
    const event = new ICAL.Event(
      new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!,
    );
    expect(event.description).toContain(date);
    expect(event.startDate.toJSDate().toISOString()).toBe(start);
    expect(event.endDate.toJSDate().toISOString()).toBe(end);
  },
);
it("offers duration-specific recovery without accepting incomplete input", () => {
  const result = interpretDate("Remind me to call Sam tomorrow at noon for", context);
  expect(result.status).toBe("unsupported");
  if (result.status !== "resolved")
    expect(result.error.message).toBe("How long should this event last?");
});

it.each([
  [
    "October 31, 2026 at 1:30am for 1 day",
    1,
    "2026-10-31T06:30:00.000Z",
    "2026-11-01T07:30:00.000Z",
  ],
  ["March 7, 2026 at 2:30am for 1 day", 1, "2026-03-07T08:30:00.000Z", "2026-03-08T08:30:00.000Z"],
] as const)(
  "clarifies a calendar-duration endpoint without changing its start: %s",
  (date, index, start, end) => {
    const input = `Remind me to call Sam ${date}`;
    const first = interpretDate(input, context);
    if (first.status === "resolved" || !first.clarification)
      throw new Error("Missing endpoint choice");
    expect(first.clarification.question).toContain("End:");
    const selection = {
      contextKey: first.clarification.contextKey,
      id: first.clarification.choices[index].id,
    };
    const result = interpretDate(input, { ...context, selection });
    if (result.status !== "resolved" || result.value.kind !== "interval")
      throw new Error("Missing duration");
    expect(result.value.start.result.iso).toBe(start);
    expect(result.value.end.result.iso).toBe(end);
    expect(result.value.selectedClocks?.[0]).toContain("End:");
    expect(interpretDate(input + " ", { ...context, selection }).status).toBe(
      "needs-clarification",
    );
    const file = prepareCalendarFile(result, {
      uid: "11111111-2222-4333-8444-555555555555",
      stamp: context.reference,
      title: "call Sam",
    });
    if (!file.ok) throw new Error(file.reason);
    const event = new ICAL.Event(
      new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!,
    );
    expect(event.endDate.toJSDate().toISOString()).toBe(end);
  },
);

it.each([
  "Call Sam tomorrow at noon for half an hour",
  "Call Sam for half an hour from tomorrow at noon",
])("preserves a half-hour reminder: %s", (input) => {
  const result = interpretDate(input, {
    timezone: "America/Chicago",
    reference: "2026-09-12T16:00:00Z",
  });
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw new Error("Missing complete half hour");
  expect([result.value.start.result.iso, result.value.end.result.iso]).toEqual([
    "2026-09-13T17:00:00.000Z",
    "2026-09-13T17:30:00.000Z",
  ]);
  expect(result.event?.text).toBe("Call Sam");
  expect(result.source.text).toContain("half an hour");
  expect(input.slice(result.source.span.start, result.source.span.end)).toBe(result.source.text);
});

it("retains half-hour duration, bounds and exclusion on recurring reminders", () => {
  const input =
    "Call Sam every Monday at noon for half an hour starting 2026-09-14 until 2026-09-28 except 2026-09-21";
  const result = interpretDate(input, {
    timezone: "America/Chicago",
    reference: "2026-09-12T16:00:00Z",
  });
  if (result.status !== "resolved" || result.value.kind !== "recurrence")
    throw new Error("Missing recurrence");
  expect(result.value.rule.duration).toEqual({ amount: 30, unit: "minutes" });
  expect(
    result.value.occurrences.map((row) => [row.start.result.iso, row.end?.result.iso]),
  ).toEqual([
    ["2026-09-14T17:00:00.000Z", "2026-09-14T17:30:00.000Z"],
    ["2026-09-28T17:00:00.000Z", "2026-09-28T17:30:00.000Z"],
  ]);
  expect(result.source.text).toContain("half an hour");
});

it.each([
  "Call Sam tomorrow at noon for half an hour unless it rains",
  "Call Sam tomorrow at noon for half an hour and 10 minutes",
  "Call Sam tomorrow at noon for half an hourish",
])("does not discard a half-hour qualifier: %s", (input) => {
  expect(
    interpretDate(input, { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" }).status,
  ).not.toBe("resolved");
});
