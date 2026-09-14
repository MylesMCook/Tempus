import { expect, it } from "vite-plus/test";
import { interpretDate } from "./interpret-date";
import { appendSelection, type ClarificationSelection } from "./clarify-numeric-date";
import ICAL from "ical.js";
import { prepareCalendarFile } from "./calendar-file";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
it("requires title confirmation before a generic appointment becomes an event", () => {
  const input = "  Dentist appointment next Tuesday at 2pm!  ";
  const prompt = interpretDate(input, context);
  if (prompt.status === "resolved" || !prompt.clarification)
    throw new Error("Missing title confirmation");
  expect(prompt.clarification.question).toBe("Use “Dentist appointment” as the event title?");
  const selection = { contextKey: prompt.clarification.contextKey, id: "event:title" };
  const result = interpretDate(input, { ...context, selection });
  if (result.status !== "resolved" || result.value.kind !== "point")
    throw new Error("Missing appointment");
  expect(result.value.calculation.result.iso).toBe("2026-09-15T19:00:00.000Z");
  expect(result.event?.text).toBe("Dentist appointment");
  expect(result.apiReplay).toBe(false);
  expect(result.selectedChoice).toContain("Title: Dentist appointment");
  expect(input.slice(result.event!.span.start, result.event!.span.end)).toBe("Dentist appointment");
  expect(input.slice(result.source.span.start, result.source.span.end)).toBe("next Tuesday at 2pm");
  expect(interpretDate(input + " ", { ...context, selection }).status).toBe("needs-clarification");
});
it("retains a confirmed title through date and clock decisions", () => {
  const input = "Dentist appointment 01/11/2026 at 1:30am for half an hour";
  let selection: ClarificationSelection | undefined;
  for (const id of ["event:title", "2026-11-01", "interval:start:2026-11-01T07:30:00Z"]) {
    const r = interpretDate(input, { ...context, selection });
    if (r.status === "resolved" || !r.clarification) throw new Error("Missing staged choice");
    expect(r.clarification.choices.some((c) => c.id === id)).toBe(true);
    selection = appendSelection(selection, { contextKey: r.clarification.contextKey, id });
  }
  const result = interpretDate(input, { ...context, selection });
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw new Error("Missing interval");
  expect(result.event?.text).toBe("Dentist appointment");
  expect(result.apiReplay).toBe(false);
  expect(result.selectedChoice).toContain("Title: Dentist appointment");
  expect([result.value.start.result.iso, result.value.end.result.iso]).toEqual([
    "2026-11-01T07:30:00.000Z",
    "2026-11-01T08:00:00.000Z",
  ]);
});
it.each([
  "Dentist appointment tomorrow unless it rains",
  "Maybe dentist appointment tomorrow",
  "Dentist appointment tomorrow nonsense Friday",
  "I had an appointment yesterday",
  "Do not book dentist tomorrow",
  "Dentist appointment sometime tomorrow",
])("does not resolve prose or swallow a qualifier: %s", (input) => {
  const r = interpretDate(input, context);
  expect(r.status).not.toBe("resolved");
  if (r.status !== "resolved") expect(r.clarification).toBeUndefined();
});

it.each([
  "Dentist (check-up)",
  "R&D review:",
  "Lunch / coffee",
  '"Team sync"',
  "Dr. Smith, follow-up",
])("confirms punctuated labels without rewriting the source: %s", (title) => {
  const input = `  ${title} tomorrow at noon!  `;
  const prompt = interpretDate(input, context);
  if (prompt.status === "resolved" || !prompt.clarification) throw Error("Missing title question");
  const selection = { contextKey: prompt.clarification.contextKey, id: "event:title" };
  const result = interpretDate(input, { ...context, selection });
  if (result.status !== "resolved") throw Error(JSON.stringify(result));
  expect(result.event?.text).toBe(title);
  expect(input.slice(result.event!.span.start, result.event!.span.end)).toBe(title);
  expect(input.slice(result.source.span.start, result.source.span.end)).toBe("tomorrow at noon");
  const file = prepareCalendarFile(result, {
    uid: "11111111-2222-4333-8444-555555555555",
    stamp: context.reference,
    title,
    pointMode: "instant",
  });
  if (!file.ok) throw Error(file.reason);
  const event = new ICAL.Event(
    new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!,
  );
  expect(event.summary).toBe(title);
  expect(event.startDate.toJSDate().toISOString()).toBe("2026-09-13T17:00:00.000Z");
  expect(
    interpretDate(input.replace(title, `${title} edited`), { ...context, selection }).status,
  ).toBe("needs-clarification");
});

it("accepts punctuation in a direct reminder target", () => {
  const result = interpretDate("Remind me to call Dr. Smith tomorrow at noon", context);
  expect(result).toMatchObject({
    status: "resolved",
    event: { text: "call Dr. Smith" },
    source: { text: "tomorrow at noon" },
  });
});

it.each([
  "Dentist (maybe), tomorrow at noon",
  "Call Dr. Smith, not tomorrow at noon",
  "R&D review: sometime tomorrow",
  "R&D review: tomorrow nonsense Friday",
  "Dentist (check-up) tomorrow unless it rains",
  "Call Dr. Smith, for about 30 minutes tomorrow",
])("punctuation does not hide constraints: %s", (input) => {
  expect(interpretDate(input, context).status).not.toBe("resolved");
});

it.each([
  "tomorrow at noon America/New_York",
  "tomorrow at noon in Europe/London",
  "tomorrow at noon PST",
  "tomorrow at noon CST",
  "tomorrow at noon UTC+05:30",
  "tomorrow at noon Etc/GMT+5",
  "every Monday at noon EST until 2026-10-01",
  "Call Sam tomorrow at noon America/Chicago",
])("explains inline timezone recovery without applying or ignoring it: %s", (input) => {
  const result = interpretDate(input, context);
  if (result.status === "resolved") throw Error("Timezone was ignored");
  expect(result.status).toBe("unsupported");
  expect(result.error.message).toMatch(/timezone setting/);
  expect(result.error.hint).toMatch(/has not been applied/);
  expect(result.error.hint).not.toMatch(/plus 2 days/);
});

it("does not interpret a title abbreviation as a written timezone", () => {
  const result = interpretDate("Call ET tomorrow at noon", context);
  expect(result).toMatchObject({ status: "resolved", event: { text: "Call ET" } });
});

it("names the complete fixed-offset IANA zone in recovery guidance", () => {
  const result = interpretDate("tomorrow at noon Etc/GMT+5", context);
  if (result.status === "resolved") throw Error("Timezone was ignored");
  expect(result.error.hint).toContain("“Etc/GMT+5”");
});
