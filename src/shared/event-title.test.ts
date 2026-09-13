import { expect, it } from "vite-plus/test";
import { interpretDate } from "./interpret-date";
import { appendSelection, type ClarificationSelection } from "./clarify-numeric-date";
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
