import { expect, it } from "vite-plus/test";
import { interpretDate } from "./interpret-date";
import { appendSelection, type ClarificationSelection } from "./clarify-numeric-date";
import { prepareRecurringCalendarFile, resolveRecurringExport } from "./recurring-calendar-file";
import ICAL from "ical.js";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  ...context,
  stamp: context.reference,
  uid: "11111111-2222-4333-8444-555555555555",
  title: "Call Sam",
};
const input = "Call Sam every Monday at noon for 3 occurrences except 2026-09-21";
function answer(text: string, policy: string, previous?: ClarificationSelection) {
  const question = interpretDate(text, { ...context, selection: previous });
  if (question.status !== "needs-clarification" || !question.clarification)
    throw Error(JSON.stringify(question));
  expect(question.clarification.choices.some((choice) => choice.id === policy)).toBe(true);
  const selection = appendSelection(previous, {
    contextKey: question.clarification.contextKey,
    id: policy,
  });
  return { selection, result: interpretDate(text, { ...context, selection }) };
}
it.each([
  ["consume", ["2026-09-14", "2026-09-28"]],
  ["replace", ["2026-09-14", "2026-09-28", "2026-10-05"]],
] as const)("completes the %s choice through independently expanded file", (policy, expected) => {
  const question = interpretDate(input, context);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw Error("Missing question");
  const label = question.clarification.choices.find(
    (choice) => choice.id === `count:exclusions:${policy}`,
  )!.label;
  for (const date of expected) expect(label).toContain(date);
  const { result, selection } = answer(input, `count:exclusions:${policy}`);
  expect(result).toMatchObject({
    status: "resolved",
    event: { text: "Call Sam" },
    value: { rule: { count: 3, countExclusions: policy } },
  });
  const file = prepareRecurringCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  expect(file.eventCount).toBe(expected.length);
  expect(file.text).toContain(
    policy === "consume" ? "Excluded dates use count slots" : "Excluded dates are replaced",
  );
  const event = new ICAL.Event(
    new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!,
  );
  const iterator = event.iterator();
  const dates: string[] = [];
  for (let next = iterator.next(); next; next = iterator.next()) {
    dates.push(event.getOccurrenceDetails(next).startDate.toJSDate().toISOString().slice(0, 10));
    if (dates.length > 10) throw Error("Unbounded");
  }
  expect(dates).toEqual(expected);
  for (const [text, options] of [
    [input.replace("09-21", "09-28"), context],
    [input, { ...context, timezone: "UTC" }],
    [input, { ...context, reference: "2026-09-13T16:00:00Z" }],
  ] as const)
    expect(interpretDate(text, { ...options, selection }).status).toBe("needs-clarification");
});
it("replaces a choice, clears dependent clocks and rejects conflicting raw history", () => {
  const { selection } = answer(input, "count:exclusions:consume");
  if (!selection) throw Error("Missing history");
  const next = appendSelection(
    { ...selection, previous: ["recurrence:2026-11-01:start:2026-11-01T07:30:00Z"] },
    { contextKey: selection.contextKey, id: "count:exclusions:replace" },
  );
  expect(next?.previous).toEqual([]);
  expect(interpretDate(input, { ...context, selection: next })).toMatchObject({
    status: "resolved",
    value: { occurrences: [expect.anything(), expect.anything(), expect.anything()] },
  });
  expect(
    interpretDate(input, {
      ...context,
      selection: { ...selection, previous: ["count:exclusions:replace"] },
    }).status,
  ).toBe("needs-clarification");
});
it("preserves the monthly choice while resolving count exclusions", () => {
  const text = "Call Sam every month on the 31st at noon for 3 occurrences except 2026-10-31";
  const monthly = answer(text, "monthly:last-day");
  const counted = answer(text, "count:exclusions:consume", monthly.selection);
  expect(resolveRecurringExport(counted.result, context.reference)).toMatchObject({
    ok: true,
    occurrences: [expect.anything(), expect.anything()],
    rule: { shortMonth: "last-day", countExclusions: "consume" },
  });
});
it("keeps an all-excluded count empty instead of extending it", () => {
  const { result } = answer(
    "Call Sam every Monday at noon for 1 occurrence except 2026-09-14",
    "count:exclusions:consume",
  );
  expect(result).toMatchObject({
    status: "resolved",
    value: { occurrences: [], truncated: false },
  });
  expect(prepareRecurringCalendarFile(result, metadata)).toMatchObject({
    ok: false,
    code: "empty-schedule",
  });
});
it("only consumes exclusions on actual cadence dates", () => {
  const { result } = answer(input.replace("09-21", "09-22"), "count:exclusions:consume");
  const plan = resolveRecurringExport(result, context.reference);
  if (!plan?.ok) throw Error("Invalid plan");
  expect(plan.occurrences.map((row) => row.start.result.local.slice(0, 10))).toEqual([
    "2026-09-14",
    "2026-09-21",
    "2026-09-28",
  ]);
});
