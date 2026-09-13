import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { interpretDate } from "./interpret-date";
import { appendSelection, type ClarificationSelection } from "./clarify-numeric-date";
import { prepareRecurringCalendarFile, resolveRecurringExport } from "./recurring-calendar-file";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const input = "Call Sam every Monday at noon for 3 occurrences starting 2026-09-07";
const metadata = {
  ...context,
  stamp: context.reference,
  uid: "11111111-2222-4333-8444-555555555555",
  title: "Call Sam",
};
function choose(text: string, ids: string[], options = context) {
  let result = interpretDate(text, options);
  let selection: ClarificationSelection | undefined;
  for (const id of ids) {
    if (result.status !== "needs-clarification" || !result.clarification)
      throw Error(JSON.stringify(result));
    expect(
      prepareRecurringCalendarFile(result, { ...metadata, reference: options.reference }).ok,
    ).toBe(false);
    expect(result.clarification.choices.some((choice) => choice.id === id)).toBe(true);
    selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
    result = interpretDate(text, { ...options, selection });
  }
  return { result, selection };
}
it.each([
  ["consume", ["2026-09-14", "2026-09-21"]],
  ["upcoming", ["2026-09-14", "2026-09-21", "2026-09-28"]],
] as const)("completes %s policy through a future-only finite file", (policy, expected) => {
  const question = interpretDate(input, context);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw Error("No question");
  const label = question.clarification.choices.find(
    (choice) => choice.id === `count:past:${policy}`,
  )!.label;
  for (const date of expected) expect(label).toContain(date);
  const { result, selection } = choose(input, [`count:past:${policy}`]);
  expect(result).toMatchObject({
    status: "resolved",
    event: { text: "Call Sam" },
    value: { rule: { count: 3, countPast: policy, starting: "2026-09-07" } },
  });
  const file = prepareRecurringCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
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
  expect(file.eventCount).toBe(expected.length);
  expect(event.description).toContain(
    policy === "consume" ? "count includes past starts" : "count includes upcoming starts only",
  );
  for (const [text, options] of [
    [input.replace("3 occurrences", "4 occurrences"), context],
    [input, { ...context, reference: "2026-09-13T16:00:00Z" }],
    [input, { ...context, timezone: "UTC" }],
  ] as const)
    expect(interpretDate(text, { ...options, selection }).status).toBe("needs-clarification");
});
it.each(["consume", "upcoming"])("keeps a two-week cadence anchored under %s", (policy) => {
  const text = input.replace("every Monday", "every 2 weeks on Monday");
  const { result } = choose(text, [`count:past:${policy}`]);
  const plan = resolveRecurringExport(result, context.reference);
  if (!plan?.ok) throw Error(JSON.stringify(plan));
  expect(plan.rule.starting).toBe("2026-09-07");
  expect(plan.occurrences.map((row) => row.start.result.local.slice(0, 10))).toEqual(
    policy === "consume"
      ? ["2026-09-21", "2026-10-05"]
      : ["2026-09-21", "2026-10-05", "2026-10-19"],
  );
});
it.each(["consume", "replace"])("combines past slots with %s exclusions", (policy) => {
  const { result } = choose(input + " except 2026-09-07", [
    "count:past:consume",
    `count:exclusions:${policy}`,
  ]);
  const plan = resolveRecurringExport(result, context.reference);
  if (!plan?.ok) throw Error(JSON.stringify(plan));
  expect(plan.occurrences).toHaveLength(policy === "consume" ? 2 : 3);
});
it("keeps an exhausted count empty and honors an insufficient until boundary", () => {
  const { result } = choose(input.replace("3 occurrences", "1 occurrence"), ["count:past:consume"]);
  expect(result).toMatchObject({
    status: "resolved",
    value: { occurrences: [], truncated: false },
  });
  expect(prepareRecurringCalendarFile(result, metadata)).toMatchObject({
    ok: false,
    code: "empty-schedule",
  });
  const tooShort = choose(input + " until 2026-09-14", ["count:past:consume"]);
  expect(tooShort.result.status).toBe("unsupported");
});
it("counts a long exhausted history without using the preview-attempt cap", () => {
  const { result } = choose("every day at noon for 1000 occurrences starting 2020-01-01", [
    "count:past:consume",
  ]);
  expect(result).toMatchObject({
    status: "resolved",
    value: { occurrences: [], truncated: false },
  });
});
it.each(["consume", "upcoming"])("retains %s policy through a selected past fold", (policy) => {
  const options = { timezone: "America/Chicago", reference: "2026-11-01T07:00:00Z" };
  const text = "every Sunday at 1:30am for 3 occurrences starting 2026-11-01";
  const { result } = choose(
    text,
    [`count:past:${policy}`, "recurrence:2026-11-01:start:2026-11-01T06:30:00Z"],
    options,
  );
  const plan = resolveRecurringExport(result, options.reference);
  if (!plan?.ok) throw Error(JSON.stringify(plan));
  expect(plan.occurrences.map((row) => row.start.result.local.slice(0, 10))).toEqual(
    policy === "consume"
      ? ["2026-11-08", "2026-11-15"]
      : ["2026-11-08", "2026-11-15", "2026-11-22"],
  );
});
it("rejects conflicting past answers and clears dependent exclusion/clock decisions when changing the policy", () => {
  const { selection } = choose(input, ["count:past:consume"]);
  if (!selection) throw Error("No selection");
  expect(
    interpretDate(input, {
      ...context,
      selection: { ...selection, previous: ["count:past:upcoming"] },
    }).status,
  ).toBe("needs-clarification");
  const next = appendSelection(
    {
      ...selection,
      previous: [
        "monthly:last-day",
        "count:exclusions:consume",
        "recurrence:2026-11-01:start:2026-11-01T06:30:00Z",
      ],
    },
    { contextKey: selection.contextKey, id: "count:past:upcoming" },
  );
  expect(next?.previous).toEqual(["monthly:last-day"]);
});
