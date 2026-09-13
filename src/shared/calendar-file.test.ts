import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { interpretDate } from "./interpret-date";
import { prepareCalendarFile } from "./calendar-file";
import { appendSelection, type ClarificationSelection } from "./clarify-numeric-date";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: "2026-09-12T16:00:00.123Z",
  title: "Call Sam",
};
it("independently preserves both selected repeated-clock interval endpoints", () => {
  const input = "November 1, 2026 1:10am-1:50am";
  let result = interpretDate(input, context);
  let selection: ClarificationSelection | undefined;
  for (const index of [0, 1]) {
    if (result.status === "resolved" || !result.clarification) throw new Error("Missing choice");
    selection = appendSelection(selection, {
      contextKey: result.clarification.contextKey,
      id: result.clarification.choices[index].id,
    });
    result = interpretDate(input, { ...context, selection });
  }
  const output = prepareCalendarFile(result, metadata);
  if (!output.ok) throw new Error(output.reason);
  const calendar = new ICAL.Component(ICAL.parse(output.text));
  const event = new ICAL.Event(calendar.getFirstSubcomponent("vevent")!);
  expect(event.startDate.toJSDate().toISOString()).toBe("2026-11-01T06:10:00.000Z");
  expect(event.endDate.toJSDate().toISOString()).toBe("2026-11-01T07:50:00.000Z");
  expect(event.description).toContain(input);
});
function read(input: string, pointMode?: "date" | "instant") {
  const output = prepareCalendarFile(interpretDate(input, context), { ...metadata, pointMode });
  if (!output.ok) throw new Error(output.reason);
  const calendar = new ICAL.Component(ICAL.parse(output.text));
  return {
    output,
    calendar,
    events: calendar.getAllSubcomponents("vevent").map((c) => new ICAL.Event(c)),
  };
}
it("independently reads an exact-time point without inventing a duration", () => {
  const { events, calendar } = read("tomorrow at noon", "instant");
  expect(calendar.getFirstPropertyValue("version")).toBe("2.0");
  expect(events).toHaveLength(1);
  expect(events[0].startDate.toJSDate().toISOString()).toBe("2026-09-13T17:00:00.000Z");
  expect(events[0].endDate.toJSDate().toISOString()).toBe("2026-09-13T17:00:00.000Z");
  expect(events[0].summary).toBe("Call Sam");
  expect(events[0].component.getFirstPropertyValue("dtstamp")?.toString()).toBe(
    "2026-09-12T16:00:00Z",
  );
});
it("keeps an explicitly selected all-day point as one civil day", () => {
  const { events } = read("2026-03-08", "date");
  expect(events[0].startDate.isDate).toBe(true);
  expect(events[0].startDate.toString()).toBe("2026-03-08");
  expect(events[0].endDate.toString()).toBe("2026-03-09");
});
it("keeps all-day interval boundaries exclusive across DST", () => {
  const { events } = read("for 3 days from 2026-03-07");
  expect(events[0].startDate.isDate).toBe(true);
  expect(events[0].endDate.isDate).toBe(true);
  expect(events[0].startDate.toString()).toBe("2026-03-07");
  expect(events[0].endDate.toString()).toBe("2026-03-10");
});
it.each([
  ["2026-03-08 1am-3am", "2026-03-08T07:00:00.000Z", "2026-03-08T08:00:00.000Z"],
  ["Friday 10pm-12am", "2026-09-19T03:00:00.000Z", "2026-09-19T05:00:00.000Z"],
])("preserves exact timed endpoints: %s", (input, start, end) => {
  const { events } = read(input);
  expect(events[0].startDate.toJSDate().toISOString()).toBe(start);
  expect(events[0].endDate.toJSDate().toISOString()).toBe(end);
});
it("exports every finite range with a distinct UID and no recurrence", () => {
  const { events } = read("Sat Sun 1pm-8pm Mon 10pm-12am");
  expect(events).toHaveLength(3);
  expect(new Set(events.map((e) => e.uid)).size).toBe(3);
  expect(
    events.map((e) => [e.startDate.toJSDate().toISOString(), e.endDate.toJSDate().toISOString()]),
  ).toEqual([
    ["2026-09-12T18:00:00.000Z", "2026-09-13T01:00:00.000Z"],
    ["2026-09-13T18:00:00.000Z", "2026-09-14T01:00:00.000Z"],
    ["2026-09-15T03:00:00.000Z", "2026-09-15T05:00:00.000Z"],
  ]);
  expect(events.every((e) => !e.isRecurring())).toBe(true);
});
it("round-trips punctuation, newlines and multibyte text without extra properties", () => {
  const title = "Meet, plan; café \\ ".repeat(7) + "🦉\r\nATTENDEE:someone@example.invalid";
  const output = prepareCalendarFile(interpretDate("tomorrow at noon", context), {
    ...metadata,
    title,
    pointMode: "instant",
  });
  if (!output.ok) throw new Error(output.reason);
  const calendar = new ICAL.Component(ICAL.parse(output.text));
  const event = new ICAL.Event(calendar.getFirstSubcomponent("vevent")!);
  expect(event.summary).toBe(title.replace(/\r\n/g, "\n"));
  expect(event.component.getAllProperties("attendee")).toHaveLength(0);
  expect(calendar.getAllSubcomponents("vevent")).toHaveLength(1);
  expect(output.text.endsWith("\r\n")).toBe(true);
  for (const line of output.text.split("\r\n"))
    expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
});
it.each([
  "03/04/2027",
  "not tomorrow",
  "every Monday at noon",
  "every Monday at noon until 2026-09-14",
])("does not export unresolved or preview-only schedules: %s", (input) => {
  expect(prepareCalendarFile(interpretDate(input, context), metadata).ok).toBe(false);
});
it("requires a point-format choice and refuses fractional seconds rather than rounding", () => {
  const point = interpretDate("tomorrow at noon", context);
  expect(prepareCalendarFile(point, metadata).ok).toBe(false);
  const fractional = interpretDate("now plus 1 millisecond", context);
  expect(prepareCalendarFile(fractional, { ...metadata, pointMode: "instant" }).ok).toBe(false);
});
it.each([
  { uid: "bad\r\nBEGIN:VEVENT" },
  { stamp: "invalid" },
  { title: "" },
  { title: "bad\u0000text" },
  { title: "\ud800" },
])("rejects invalid export metadata: %j", (changes) => {
  expect(
    prepareCalendarFile(interpretDate("tomorrow at noon", context), {
      ...metadata,
      ...changes,
      pointMode: "instant",
    }).ok,
  ).toBe(false);
});

it("retains the explicitly selected repeated-clock instant", () => {
  const text = "November 1, 2026 at 1:30 am";
  const question = interpretDate(text, context);
  if (question.status === "resolved" || !question.clarification)
    throw new Error("Missing clock decision");
  const chosen = interpretDate(text, {
    ...context,
    selection: {
      contextKey: question.clarification.contextKey,
      id: question.clarification.choices[1].id,
    },
  });
  const file = prepareCalendarFile(chosen, { ...metadata, pointMode: "instant" });
  if (!file.ok) throw new Error(file.reason);
  const calendar = new ICAL.Component(ICAL.parse(file.text));
  const event = new ICAL.Event(calendar.getFirstSubcomponent("vevent")!);
  expect(event.startDate.toJSDate().toISOString()).toBe("2026-11-01T07:30:00.000Z");
  expect(event.description).toContain("November 1, 2026 at 1:30 am");
});

it.each(["0001-01-01", "9999-12-31"])("preserves supported all-day boundary %s", (input) => {
  const { events, output } = read(input, "date");
  expect(events[0].startDate.isDate).toBe(true);
  const date = events[0].startDate;
  expect([date.year, date.month, date.day]).toEqual(input.split("-").map(Number));
  expect(output.text).toContain(`DTSTART;VALUE=DATE:${input.replace(/-/g, "")}\r\n`);
});
it("retains whole seconds instead of exporting the minute-only display", () => {
  const { events } = read("2026-09-12 at noon plus 37 seconds", "instant");
  expect(events[0].startDate.toJSDate().toISOString()).toBe("2026-09-12T17:00:37.000Z");
});
it("rejects a UTC event outside the supported calendar year range", () => {
  const result = interpretDate("9999-12-31 at 11pm", context);
  expect(result.status).toBe("resolved");
  expect(prepareCalendarFile(result, { ...metadata, pointMode: "instant" })).toMatchObject({
    ok: false,
    reason: "Calendar dates must use years 0001–9999.",
  });
});
