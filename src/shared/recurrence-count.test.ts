import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { interpretDate } from "./interpret-date";
import { interpretRecurrence } from "./interpret-recurrence";
import { prepareRecurringCalendarFile, resolveRecurringExport } from "./recurring-calendar-file";
import { appendSelection } from "./clarify-numeric-date";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  ...context,
  stamp: context.reference,
  uid: "11111111-2222-4333-8444-555555555555",
  title: "Call Sam",
};
function dates(text: string) {
  const event = new ICAL.Event(
    new ICAL.Component(ICAL.parse(text)).getFirstSubcomponent("vevent")!,
  );
  const iterator = event.iterator();
  const rows: string[] = [];
  for (let next = iterator.next(); next; next = iterator.next()) {
    rows.push(event.getOccurrenceDetails(next).startDate.toJSDate().toISOString());
    if (rows.length > 1000) throw new Error("Unbounded file");
  }
  return rows;
}
it.each(["3", "three"])(
  "exports exactly %s weekly starts with retained source and title",
  (count) => {
    const input = `Call Sam every Monday at noon for ${count} occurrences`;
    const result = interpretDate(input, context);
    expect(result).toMatchObject({
      status: "resolved",
      event: { text: "Call Sam" },
      value: { kind: "recurrence", rule: { count: 3 }, truncated: false },
    });
    if (result.status !== "resolved") throw Error("Unresolved");
    expect(input.slice(result.source.span.start, result.source.span.end)).toBe(result.source.text);
    const file = prepareRecurringCalendarFile(result, metadata);
    if (!file.ok) throw Error(file.reason);
    expect(file.eventCount).toBe(3);
    expect(dates(file.text)).toEqual([14, 21, 28].map((day) => `2026-09-${day}T17:00:00.000Z`));
    expect(file.text).not.toContain("RRULE:");
  },
);
it("exports the requested extent beyond a one-row preview", () => {
  const text = "every Monday at noon for 5 occurrences";
  expect(interpretRecurrence(text, { ...context, limit: 1 })).toMatchObject({
    ok: true,
    occurrences: [expect.anything()],
    truncated: true,
    rule: { count: 5 },
  });
  const file = prepareRecurringCalendarFile(interpretDate(text, context), metadata);
  if (!file.ok) throw Error(file.reason);
  expect(dates(file.text)).toHaveLength(5);
  expect(dates(file.text).at(-1)).toBe("2026-10-12T17:00:00.000Z");
});
it("keeps duration separate from count", () => {
  const result = interpretDate(
    "Call Sam every Monday at noon for 30 minutes for 3 occurrences",
    context,
  );
  expect(result).toMatchObject({
    status: "resolved",
    value: { rule: { count: 3, duration: { amount: 30, unit: "minutes" } } },
  });
  const file = prepareRecurringCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  const event = new ICAL.Event(
    new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!,
  );
  expect(event.duration.toSeconds()).toBe(1800);
  expect(dates(file.text)).toHaveLength(3);
});
it.each([
  "every Monday at noon for 3 occurrences except 2026-09-21",
  "every Monday at noon for 3 occurrences starting 2026-09-07",
  "every Saturday at 9am for 3 occurrences starting 2026-09-12",
  "every Monday at noon for 3 occurrences until 2026-09-21",
  "every Monday at noon for 0 occurrences",
  "every Monday at noon for -1 occurrences",
  "every Monday at noon for 1.5 occurrences",
  "every Monday at noon for 1001 occurrences",
  "every Monday at noon for 3 occurrences unless it rains",
])("does not export a partial or ambiguous count: %s", (text) => {
  const result = interpretDate(text, context);
  expect(result.status).not.toBe("resolved");
  expect(prepareRecurringCalendarFile(result, metadata).ok).toBe(false);
});
it("retains count through a monthly policy choice and invalidates after an edit", () => {
  const text = "Call Sam every month on the 31st at noon for 3 occurrences";
  let result = interpretDate(text, context);
  if (result.status !== "needs-clarification" || !result.clarification)
    throw Error("Missing monthly choice");
  const selection = appendSelection(undefined, {
    contextKey: result.clarification.contextKey,
    id: "monthly:last-day",
  });
  result = interpretDate(text, { ...context, selection });
  const file = prepareRecurringCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  expect(dates(file.text)).toEqual([
    "2026-09-30T17:00:00.000Z",
    "2026-10-31T17:00:00.000Z",
    "2026-11-30T18:00:00.000Z",
  ]);
  expect(
    interpretDate(text.replace("3 occurrences", "4 occurrences"), { ...context, selection }).status,
  ).toBe("needs-clarification");
});
it("requires a clock choice beyond the preview before complete export", () => {
  const result = interpretDate("every Sunday at 1:30am for 10 occurrences", context);
  expect(result.status).toBe("resolved");
  const plan = resolveRecurringExport(result, context.reference);
  expect(plan).toMatchObject({
    ok: false,
    clockPrompt: { question: expect.stringContaining("2026-11-01") },
  });
  expect(prepareRecurringCalendarFile(result, metadata).ok).toBe(false);
});
it("rejects complete expansion past the ten-year window", () => {
  const result = interpretDate("every month on the first at noon for 200 occurrences", context);
  expect(result.status).toBe("resolved");
  expect(resolveRecurringExport(result, context.reference)).toMatchObject({
    ok: false,
    error: { message: expect.stringContaining("ten-year") },
  });
});

it("does not silently replace a selected past fold occurrence with a future week", () => {
  const options = { timezone: "America/Chicago", reference: "2026-11-01T07:00:00Z" };
  const text = "every Sunday at 1:30am for 3 occurrences starting 2026-11-01";
  let result = interpretDate(text, options);
  if (result.status !== "needs-clarification" || !result.clarification)
    throw Error("Missing fold choice");
  expect(result.clarification.question).toBe(
    "Does the count include starts before the reference time?",
  );
  result = interpretDate(text, {
    ...options,
    selection: {
      contextKey: result.clarification.contextKey,
      id: "recurrence:2026-11-01:start:2026-11-01T06:30:00Z",
    },
  });
  expect(result).toMatchObject({
    status: "needs-clarification",
    clarification: { question: "Does the count include starts before the reference time?" },
  });
});
