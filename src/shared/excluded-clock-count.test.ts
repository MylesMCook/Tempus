import { expect, it } from "vite-plus/test";
import { interpretDate } from "./interpret-date";
import { appendSelection, type ClarificationSelection } from "./clarify-numeric-date";
import { prepareRecurringCalendarFile, resolveRecurringExport } from "./recurring-calendar-file";

it.each([
  [
    "2026-11-01T07:00:00Z",
    "1:30am",
    "2026-11-01",
    "2026-11-01T06:30:00Z",
    ["2026-11-08", "2026-11-15", "2026-11-22"],
  ],
  [
    "2026-11-01T07:00:00Z",
    "1:30am",
    "2026-11-01",
    "2026-11-01T07:30:00Z",
    ["2026-11-08", "2026-11-15"],
  ],
  [
    "2026-03-08T08:00:00Z",
    "2:30am",
    "2026-03-08",
    "2026-03-08T07:30:00Z",
    ["2026-03-15", "2026-03-22", "2026-03-29"],
  ],
  [
    "2026-03-08T08:00:00Z",
    "2:30am",
    "2026-03-08",
    "2026-03-08T08:30:00Z",
    ["2026-03-15", "2026-03-22"],
  ],
] as const)(
  "resolves excluded %s / %s count position via %s / %s",
  (reference, clock, date, instant, expected) => {
    const context = { timezone: "America/Chicago", reference };
    const input = `Call Sam every Sunday at ${clock} for 3 occurrences except ${date}`;
    let result = interpretDate(input, context);
    let selection: ClarificationSelection | undefined;
    const metadata = {
      ...context,
      stamp: reference,
      uid: "11111111-2222-4333-8444-555555555555",
      title: "Call Sam",
    };
    for (const id of ["count:exclusions:consume", `recurrence:${date}:start:${instant}`]) {
      if (result.status !== "needs-clarification" || !result.clarification)
        throw Error(JSON.stringify(result));
      expect(prepareRecurringCalendarFile(result, metadata).ok).toBe(false);
      expect(result.clarification.choices.some((choice) => choice.id === id)).toBe(true);
      selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
      result = interpretDate(input, { ...context, selection });
    }
    if (result.status !== "resolved" || result.value.kind !== "recurrence")
      throw Error(JSON.stringify(result));
    expect(result.event?.text).toBe("Call Sam");
    expect(input.slice(result.source.span.start, result.source.span.end)).toBe(result.source.text);
    expect(result.value.rule.clockOverrides).toHaveLength(1);
    const plan = resolveRecurringExport(result, reference);
    if (!plan?.ok) throw Error(JSON.stringify(plan));
    expect(plan.occurrences.map((row) => row.start.result.local.slice(0, 10))).toEqual(expected);
    const file = prepareRecurringCalendarFile(result, metadata);
    if (!file.ok) throw Error(file.reason);
    expect(file.eventCount).toBe(expected.length);
    expect(file.text).not.toContain(`DTSTART:${date.replaceAll("-", "")}`);
    expect(file.text).toContain("Excluded dates use count slots");
    expect(
      interpretDate(input.replace("3 occurrences", "4 occurrences"), { ...context, selection })
        .status,
    ).toBe("needs-clarification");
  },
);
it("reopens a conflicting excluded clock answer", () => {
  const context = { timezone: "America/Chicago", reference: "2026-11-01T07:00:00Z" };
  const text = "every Sunday at 1:30am for 3 occurrences except 2026-11-01";
  const first = interpretDate(text, context);
  if (first.status !== "needs-clarification" || !first.clarification)
    throw Error("Missing question");
  const result = interpretDate(text, {
    ...context,
    selection: {
      contextKey: first.clarification.contextKey,
      id: "recurrence:2026-11-01:start:2026-11-01T07:30:00Z",
      previous: ["count:exclusions:consume", "recurrence:2026-11-01:start:2026-11-01T06:30:00Z"],
    },
  });
  expect(result).toMatchObject({
    status: "needs-clarification",
    clarification: { question: expect.stringContaining("Excluded date") },
  });
});
