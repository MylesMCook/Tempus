import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { appendSelection, calculateDate, parse } from "./sdk";
import { prepareCalendarFile } from "./calendar-file";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  title: "Call Sam",
};

it.each([
  ["from 9am to 5pm tomorrow", "2026-09-13T14:00:00.000Z", "2026-09-13T22:00:00.000Z"],
  ["9am–5pm tomorrow", "2026-09-13T14:00:00.000Z", "2026-09-13T22:00:00.000Z"],
  ["9am—5pm tomorrow", "2026-09-13T14:00:00.000Z", "2026-09-13T22:00:00.000Z"],
  ["between 9am and 5pm tomorrow", "2026-09-13T14:00:00.000Z", "2026-09-13T22:00:00.000Z"],
  ["tomorrow between 9am and 5pm", "2026-09-13T14:00:00.000Z", "2026-09-13T22:00:00.000Z"],
  ["10pm—1am December 31, 2026", "2027-01-01T04:00:00.000Z", "2027-01-01T07:00:00.000Z"],
  ["between 1am and 3am March 8, 2026", "2026-03-08T07:00:00.000Z", "2026-03-08T08:00:00.000Z"],
  ["from Friday at 9am to Monday at 5pm", "2026-09-18T14:00:00.000Z", "2026-09-21T22:00:00.000Z"],
  [
    "from 2026-03-06 at 9am to Monday at 5pm",
    "2026-03-06T15:00:00.000Z",
    "2026-03-09T22:00:00.000Z",
  ],
])("exports the complete range without changing the event or source: %s", (phrase, start, end) => {
  const input = `Call Sam ${phrase}`;
  const result = parse(input, context);
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw Error(JSON.stringify(result));
  expect(result.event?.text).toBe("Call Sam");
  expect(result.source.text).toBe(phrase);
  expect(input.slice(result.source.span.start, result.source.span.end)).toBe(phrase);
  expect(result.value.start.result.iso).toBe(start);
  expect(result.value.end.result.iso).toBe(end);
  expect(calculateDate(input, context).ok).toBe(false);
  const file = prepareCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  const event = new ICAL.Event(
    new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!,
  );
  expect(event.startDate.toJSDate().toISOString()).toBe(start);
  expect(event.endDate.toJSDate().toISOString()).toBe(end);
});

it.each([
  ["10pm—1:30am October 31, 2026", "2026-11-01T03:00:00.000Z"],
  ["from 2026-10-30 at 10pm to Sunday at 1:30am", "2026-10-31T03:00:00.000Z"],
])("clarifies and exports the destination-date fold: %s", (phrase, start) => {
  const input = `Call Sam ${phrase}`;
  const first = parse(input, context);
  if (first.status !== "needs-clarification" || !first.clarification)
    throw Error(JSON.stringify(first));
  const id = "interval:end:2026-11-01T07:30:00Z";
  expect(first.clarification.choices.some((choice) => choice.id === id)).toBe(true);
  expect(prepareCalendarFile(first, metadata).ok).toBe(false);
  const selection = appendSelection(undefined, { contextKey: first.clarification.contextKey, id });
  const result = parse(input, { ...context, selection });
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw Error(JSON.stringify(result));
  expect(result.value.start.result.iso).toBe(start);
  const file = prepareCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  const event = new ICAL.Event(
    new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!,
  );
  expect(event.endDate.toJSDate().toISOString()).toBe("2026-11-01T07:30:00.000Z");
});

it.each([
  "Call Sam from 9am to 5pm tomorrow plus 1 day",
  "Call Sam between 9am and 5pm tomorrow unless it rains",
  "Call Sam tomorrow between 9am and 5pm and 7pm",
  "Call Sam from 2026-03-06 at noon to Sunday at 2:30am",
  "Call Sam between 1am and 2:30am March 8, 2026",
  "Call Sam between 9am and 9am tomorrow",
])("does not export incomplete or ambiguous ranges: %s", (input) => {
  const result = parse(input, context);
  expect(result.status).not.toBe("resolved");
  expect(prepareCalendarFile(result, metadata).ok).toBe(false);
});

it.each([
  "Call Sam from Friday through Monday",
  "Call Sam between 9 and 5 tomorrow",
  "Call Sam tomorrow between 9 and 5",
])("keeps range-specific recovery through the SDK: %s", (input) => {
  const result = parse(input, context);
  expect(result).toMatchObject({
    status: "unsupported",
    error: {
      message: "That range wording is not supported.",
      hint: expect.stringContaining("from 9am to 5pm tomorrow"),
    },
  });
  expect(prepareCalendarFile(result, metadata).ok).toBe(false);
});
