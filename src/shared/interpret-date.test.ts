import { describe, expect, it } from "vite-plus/test";
import { interpretDate } from "./interpret-date";
import { calculateDate } from "./date-parser";

const options = { reference: "2026-09-12T16:00:00Z", timezone: "America/Chicago" };
describe("bounded sentence interpretation", () => {
  it("preserves all reminder groups and absolute source offsets", () => {
    const text = "  Remind me to call Sam Sat Sun 1pm-8pm Mon 10pm-12am!";
    const result = interpretDate(text, options);
    if (result.status !== "resolved" || result.value.kind !== "collection")
      throw new Error("Missing collection");
    expect(result.value.occurrences).toHaveLength(3);
    expect(result.value.occurrences[2].end!.result.iso).toBe("2026-09-15T05:00:00.000Z");
    for (const row of result.value.occurrences)
      expect(text.slice(row.source.span.start, row.source.span.end)).toBe(row.source.text);
    expect(text.slice(result.event!.span.start, result.event!.span.end)).toBe("call Sam");
    expect(result.apiReplay).toBe(false);
    expect(calculateDate(text, options).ok).toBe(false);
  });
  it.each([
    "Sat Sun 1pm-8pm except holidays",
    "Remind me to call Sam Sat Sun 1pm-8pm and Tuesday",
    "Do not schedule Sat Sun 1pm-8pm",
  ])("does not discard group qualifiers: %s", (text) => {
    expect(interpretDate(text, options).status).not.toBe("resolved");
  });
  it("preserves the entire recurring reminder, including excluded dates", () => {
    const text =
      "  Remind me to call Sam every Monday from 8 pm to 10 pm starting 2026-09-14 until 2026-10-05 except 2026-09-21!";
    const result = interpretDate(text, options);
    if (result.status !== "resolved" || result.value.kind !== "recurrence")
      throw new Error("Expected recurrence");
    expect(result.value.occurrences.map((row) => row.start.result.iso)).toEqual([
      "2026-09-15T01:00:00.000Z",
      "2026-09-29T01:00:00.000Z",
      "2026-10-06T01:00:00.000Z",
    ]);
    expect(result.value.truncated).toBe(false);
    expect(text.slice(result.source.span.start, result.source.span.end)).toBe(result.source.text);
    expect(text.slice(result.event!.span.start, result.event!.span.end)).toBe("call Sam");
    expect(result.apiReplay).toBe(false);
    expect(calculateDate(text, options).ok).toBe(false);
  });
  it.each([
    "Remind me to call Sam every Monday at noon except holidays",
    "Remind me to call Sam every Monday at noon unless it rains",
    "Do not remind me to call Sam every Monday at noon",
    "every Monday at noon and Friday at 2 pm",
    "Remind me to call Sam every Sunday at 1:30 am starting 2026-11-01",
  ])("does not return a partial recurrence: %s", (text) => {
    expect(interpretDate(text, options).status).not.toBe("resolved");
  });
  it("retains a finite schedule with no remaining occurrences as an empty preview", () => {
    const result = interpretDate(
      "every Monday at noon starting 2026-09-14 until 2026-09-14 except 2026-09-14",
      options,
    );
    expect(result).toMatchObject({
      status: "resolved",
      value: { kind: "recurrence", occurrences: [], truncated: false },
    });
  });
  it.each([
    [
      "set OOO for 3 days from today",
      "OOO",
      "2026-09-12T05:00:00.000Z",
      "2026-09-15T05:00:00.000Z",
    ],
    [
      "  Remind me to call Sam for 3 days from today! ",
      "call Sam",
      "2026-09-12T05:00:00.000Z",
      "2026-09-15T05:00:00.000Z",
    ],
    [
      "The meeting is on September 14, 2026 from 9 am to 11 am.",
      "meeting",
      "2026-09-14T14:00:00.000Z",
      "2026-09-14T16:00:00.000Z",
    ],
  ])("preserves the complete event interval for %s", (text, event, start, end) => {
    const result = interpretDate(text, options);
    expect(result.status).toBe("resolved");
    if (result.status !== "resolved" || result.value.kind !== "interval")
      throw new Error("Expected interval");
    expect(result.event?.text).toBe(event);
    expect(text.slice(result.event!.span.start, result.event!.span.end)).toBe(event);
    expect(text.slice(result.source.span.start, result.source.span.end)).toBe(result.source.text);
    expect(result.value.start.result.iso).toBe(start);
    expect(result.value.end.result.iso).toBe(end);
    expect(calculateDate(text, options).ok).toBe(false);
  });
  it.each([
    "set OOO for 3 days from today except Sunday",
    "The meeting is Friday 10pm-12am and Saturday noon",
    "Do not set OOO for 3 days from today",
    "Remind me to call Sam for 3 days from today nonsense",
  ])("does not discard interval qualifiers in %s", (text) => {
    expect(interpretDate(text, options).status).not.toBe("resolved");
  });
  it("requests clarification for an equal range and rejects stale synthesized spans", () => {
    expect(interpretDate("Friday 10pm-10pm", options).status).toBe("needs-clarification");
    const result = interpretDate("The meeting is Friday 25:00-26:00", options);
    expect(result.status).toBe("unsupported");
    if (result.status !== "resolved") expect(result.error.span).toBeUndefined();
  });
  it.each([
    "Remind me to call Sam tomorrow at noon",
    "  Please remind me to email Jo tomorrow at noon!  ",
    "Can we talk tomorrow at noon?",
    "Could we meet tomorrow at noon?",
    "The meeting is on tomorrow at noon.",
    "Remind me to pick up groceries tomorrow at noon",
  ])("keeps source spans and resolves %s", (text) => {
    const result = interpretDate(text, options);
    expect(result.status).toBe("resolved");
    if (result.status !== "resolved" || result.value.kind !== "point")
      throw new Error("Expected a point");
    expect(result.value.calculation.result.iso).toBe("2026-09-13T17:00:00.000Z");
    expect(text.slice(result.source.span.start, result.source.span.end)).toBe(result.source.text);
    expect(result.event).toBeDefined();
    expect(text.slice(result.event!.span.start, result.event!.span.end)).toBe(result.event!.text);
  });
  it.each([
    "Remind me to call Sam tomorrow at noon and Friday at 2 pm",
    "Remind me to call Sam tomorrow at noon actually Friday",
    "Remind me to not call Sam tomorrow at noon",
    "Do not schedule anything tomorrow",
    "Remind me to call Sam tomorrow unless it rains",
    "Remind me to call Sam tomorrow and cancel Friday",
    "Remind me to call Sam tomorrow except Saturday",
    "Remind me to call Sam tomorrow or Friday",
    "Remind me to call Sam tomorrow nonsense",
    "Remind me to call Sam in three days for two hours",
    "Remind me to call Sam every Monday",
    "Remind me to call Sam between tomorrow and Friday",
    "Remind me to call Sam weekly on Monday",
    "Remind me to call May tomorrow at noon",
    "Remind me to call 5551234 tomorrow at noon",
    "Remind me to call Sam three days ago tomorrow",
    "Remind me to call Sam tomorrow at noon extra",
  ])("does not return a partial date for %s", (text) => {
    expect(interpretDate(text, options).status).not.toBe("resolved");
  });
  it("keeps strict arithmetic and API v2 behavior", () => {
    const text = "jan 30 2026 plus 1 month plus 2 days";
    const result = interpretDate(text, options);
    expect(result.status).toBe("resolved");
    if (result.status === "resolved" && result.value.kind === "point")
      expect(result.value.calculation).toEqual(calculateDate(text, options));
    expect(calculateDate("Remind me to call Sam tomorrow at noon", options).ok).toBe(false);
  });
  it("offsets errors into the original sentence", () => {
    const text = "  Remind me to call Sam tomorrow nonsense";
    const result = interpretDate(text, options);
    expect(result.status).toBe("unsupported");
    if (result.status === "resolved") throw new Error("Unexpected point");
    expect(text.slice(result.error.span!.start, result.error.span!.end)).toBe("nonsense");
  });
  it("keeps invalid zones and repeated clock times unresolved", () => {
    const text = "Remind me to call Sam nov 1 2026 at 1:30 am";
    expect(interpretDate(text, options).status).toBe("needs-clarification");
    expect(interpretDate(text, { ...options, timezone: "Bad/Zone" }).status).toBe("unsupported");
  });
});

it("preserves the complete multi-weekday reminder and schedule", () => {
  const input = "  Remind me to call Sam every Wednesday and Monday at noon.";
  const result = interpretDate(input, {
    timezone: "America/Chicago",
    reference: "2026-09-12T16:00:00Z",
  });
  if (result.status !== "resolved" || result.value.kind !== "recurrence")
    throw new Error("Missing complete recurrence");
  expect(result.value.rule.weekdays).toEqual([1, 3]);
  expect(result.value.occurrences.map((row) => row.start.result.iso)).toEqual([
    "2026-09-14T17:00:00.000Z",
    "2026-09-16T17:00:00.000Z",
    "2026-09-21T17:00:00.000Z",
  ]);
  expect(input.slice(result.source.span.start, result.source.span.end)).toBe(
    "every Wednesday and Monday at noon",
  );
  expect(result.event?.text).toBe("call Sam");
});

it("explains unsupported recurrence exclusions without a calculator syntax error", () => {
  const result = interpretDate("every Monday and Wednesday at noon except holidays", {
    timezone: "America/Chicago",
    reference: "2026-09-12T16:00:00Z",
  });
  expect(result.status).toBe("unsupported");
  if (result.status !== "resolved") expect(result.error.hint).toContain("exact excluded dates");
});
