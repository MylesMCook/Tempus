import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { parse, appendSelection } from "./sdk";
import { prepareRecurringCalendarFile } from "./recurring-calendar-file";
const context = { timezone: "America/Chicago", reference: "2026-01-01T00:00:00Z" };
const metadata = {
  reference: context.reference,
  stamp: context.reference,
  uid: "11111111-2222-4333-8444-555555555555",
  title: "call Sam",
};
function answer(input: string, id: string, options = context) {
  const question = parse(input, options);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw Error("Missing policy");
  const selection = { contextKey: question.clarification.contextKey, id };
  return { result: parse(input, { ...options, selection }), selection };
}
function rows(text: string, count: number) {
  const calendar = new ICAL.Component(ICAL.parse(text));
  for (const zone of calendar.getAllSubcomponents("vtimezone")) {
    const timezone = new ICAL.Timezone(zone);
    ICAL.TimezoneService.register(timezone);
  }
  const components = calendar.getAllSubcomponents("vevent");
  const master = components.find((component) => !component.hasProperty("recurrence-id"))!;
  const event = new ICAL.Event(master, {
    exceptions: components.filter((c) => c !== master).map((c) => new ICAL.Event(c)),
  });
  const iterator = event.iterator();
  const result = [];
  for (let next = iterator.next(); next && result.length < count; next = iterator.next()) {
    const occurrence = event.getOccurrenceDetails(next);
    result.push([
      occurrence.startDate.toJSDate().toISOString(),
      occurrence.endDate.toJSDate().toISOString(),
    ]);
  }
  return result;
}
it("retains rent text and exports a monthly noon rule through DST", () => {
  const input = "Remind me to pay rent every month on the first at noon";
  const result = parse(input, context);
  if (result.status !== "resolved" || result.value.kind !== "recurrence")
    throw Error(JSON.stringify(result));
  expect(result.event?.text).toBe("pay rent");
  expect(result.input).toBe(input);
  expect(input.slice(result.source.span.start, result.source.span.end)).toBe(result.source.text);
  const file = prepareRecurringCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  expect(file.text).toContain("RRULE:FREQ=MONTHLY;BYMONTHDAY=1");
  expect(rows(file.text, 4).map((row) => row[0])).toEqual([
    "2026-01-01T18:00:00.000Z",
    "2026-02-01T18:00:00.000Z",
    "2026-03-01T18:00:00.000Z",
    "2026-04-01T17:00:00.000Z",
  ]);
});
it.each(["skip", "last-day"] as const)(
  "exports complete monthly intervals with %s policy and exact exclusions",
  (policy) => {
    const input =
      "Call Sam every month on the 30th at 9am for half an hour starting 2026-01-01 until 2026-05-31 except 2026-03-30";
    const { result, selection } = answer(input, `monthly:${policy}`);
    const file = prepareRecurringCalendarFile(result, metadata);
    if (!file.ok) throw Error(file.reason);
    const dates = [
      "2026-01-30T15:00:00.000Z",
      ...(policy === "last-day" ? ["2026-02-28T15:00:00.000Z"] : []),
      "2026-04-30T14:00:00.000Z",
      "2026-05-30T14:00:00.000Z",
    ];
    expect(file.eventCount).toBe(dates.length);
    expect(rows(file.text, 10)).toEqual(
      dates.map((start) => [start, new Date(Date.parse(start) + 1800000).toISOString()]),
    );
    expect(parse(input.replace("30th", "31st"), { ...context, selection }).status).toBe(
      "needs-clarification",
    );
  },
);
it.each(["skip", "last-day"] as const)(
  "keeps the 31st anchor after February using %s",
  (policy) => {
    const input = "every month on the 31st at noon";
    const { result } = answer(input, `monthly:${policy}`, {
      ...context,
      reference: "2028-01-31T20:00:00Z",
    });
    const file = prepareRecurringCalendarFile(result, {
      ...metadata,
      reference: "2028-01-31T20:00:00Z",
    });
    if (!file.ok) throw Error(file.reason);
    expect(rows(file.text, 3).map((row) => row[0].slice(0, 10))).toEqual(
      policy === "skip"
        ? ["2028-03-31", "2028-05-31", "2028-07-31"]
        : ["2028-02-29", "2028-03-31", "2028-04-30"],
    );
  },
);
it("retains a short-month choice through an occurrence clock correction", () => {
  const input = "every month on the 31st at 2:30am until 2024-05-31";
  const options = { timezone: "Europe/Berlin", reference: "2024-02-01T00:00:00Z" };
  const { result: question, selection } = answer(input, "monthly:last-day", options);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw Error("Missing gap question");
  const next = appendSelection(selection, {
    contextKey: question.clarification.contextKey,
    id: question.clarification.choices[1].id,
  });
  const result = parse(input, { ...options, selection: next });
  expect(result.status).toBe("resolved");
  const file = prepareRecurringCalendarFile(result, { ...metadata, reference: options.reference });
  if (!file.ok) throw Error(file.reason);
  expect(file.eventCount).toBe(4);
  expect(rows(file.text, 5).map((row) => row[0])).toEqual([
    "2024-02-29T01:30:00.000Z",
    "2024-03-31T01:30:00.000Z",
    "2024-04-30T00:30:00.000Z",
    "2024-05-31T00:30:00.000Z",
  ]);
});

it("asks for a missing monthly clock instead of inventing midnight", () => {
  const result = parse("every month on the first", context);
  expect(result.status).toBe("needs-clarification");
});
it("blocks an unresolved future monthly clock beyond the preview", () => {
  const result = parse("every month on the first at 1:30am", context);
  expect(result.status).toBe("resolved");
  const file = prepareRecurringCalendarFile(result, metadata);
  expect(file.ok).toBe(false);
});
it("rejects conflicting policy answers, then recovers explicitly", () => {
  const input = "every month on the 31st at noon";
  const { selection } = answer(input, "monthly:skip");
  const conflict = { ...selection, previous: ["monthly:last-day"] };
  expect(parse(input, { ...context, selection: conflict }).status).toBe("needs-clarification");
  const selected = appendSelection(conflict, selection);
  expect(parse(input, { ...context, selection: selected }).status).toBe("resolved");
});
it("does not export an ongoing short-month encoding that its reader misinterprets", () => {
  const { result } = answer("every month on the 30th at noon", "monthly:last-day");
  expect(prepareRecurringCalendarFile(result, metadata).ok).toBe(false);
});

it("exports an ongoing monthly half-hour reminder with local starts through DST", () => {
  const input =
    "Remind me to pay rent every month on the first at 9am for half an hour except 2026-03-01";
  const result = parse(input, context);
  const file = prepareRecurringCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  expect(file.text).toContain("DURATION:PT1800S");
  expect(rows(file.text, 4)).toEqual([
    ["2026-01-01T15:00:00.000Z", "2026-01-01T15:30:00.000Z"],
    ["2026-02-01T15:00:00.000Z", "2026-02-01T15:30:00.000Z"],
    ["2026-04-01T14:00:00.000Z", "2026-04-01T14:30:00.000Z"],
    ["2026-05-01T14:00:00.000Z", "2026-05-01T14:30:00.000Z"],
  ]);
});
it("blocks an overnight monthly range whose next-day end later repeats", () => {
  const { result } = answer("every month on the 31st from 11pm to 1:30am", "monthly:skip");
  const file = prepareRecurringCalendarFile(result, metadata);
  expect(file.ok).toBe(false);
  if (!file.ok) expect(file.reason).toMatch(/ambiguous clock|offset change/);
});
it("blocks a monthly elapsed interval crossing a later DST transition", () => {
  const result = parse("every month on the first at noon for 14 days", context);
  const file = prepareRecurringCalendarFile(result, metadata);
  expect(file.ok).toBe(false);
  if (!file.ok) expect(file.reason).toMatch(/offset change/);
});
it("exports a monthly overnight range with no future clock conflict", () => {
  const result = parse("every month on the first from 10pm to 00:30", context);
  const file = prepareRecurringCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  expect(rows(file.text, 2)).toEqual([
    ["2026-01-02T04:00:00.000Z", "2026-01-02T06:30:00.000Z"],
    ["2026-02-02T04:00:00.000Z", "2026-02-02T06:30:00.000Z"],
  ]);
});
