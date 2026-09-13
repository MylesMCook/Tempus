import { expect, it } from "vite-plus/test";
import { interpretDate } from "./interpret-date";
import { calculateDate } from "./date-parser";
import { appendSelection } from "./clarify-numeric-date";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
it.each([
  ["November 1, 2026 at 1:30 am", ["2026-11-01T06:30:00Z", "2026-11-01T07:30:00Z"]],
  ["March 8, 2026 at 2:30 am", ["2026-03-08T07:30:00Z", "2026-03-08T08:30:00Z"]],
] as const)("requires an explicit clock choice for %s", (input, instants) => {
  const prompt = interpretDate(input, context);
  if (prompt.status !== "needs-clarification" || !prompt.clarification)
    throw new Error("Missing clock choices");
  expect(prompt.clarification.choices.map((choice) => choice.id)).toEqual(instants);
  expect(prompt.clarification.choices.every((choice) => choice.label.includes("UTC-"))).toBe(true);
  for (const id of instants) {
    const selected = interpretDate(input, {
      ...context,
      selection: { contextKey: prompt.clarification.contextKey, id },
    });
    if (selected.status !== "resolved" || selected.value.kind !== "point")
      throw new Error("Missing point");
    expect(Date.parse(selected.value.calculation.result.iso)).toBe(Date.parse(id));
    expect(selected.apiReplay).toBe(false);
    expect(selected.source.text).toBe(input);
    expect(calculateDate(input, context).ok).toBe(false);
  }
});

it("preserves a numeric date decision before choosing a clock", () => {
  const input = "Remind me to call Sam 03/08/2026 at 2:30 am";
  const date = interpretDate(input, context);
  if (date.status === "resolved" || !date.clarification) throw new Error("Missing date choices");
  const first = { contextKey: date.clarification.contextKey, id: "2026-03-08" };
  const clock = interpretDate(input, { ...context, selection: first });
  if (clock.status === "resolved" || !clock.clarification) throw new Error("Missing clock choices");
  const selection = appendSelection(first, {
    contextKey: clock.clarification.contextKey,
    id: "2026-03-08T08:30:00Z",
  });
  const resolved = interpretDate(input, { ...context, selection });
  if (resolved.status !== "resolved" || resolved.value.kind !== "point")
    throw new Error("Missing point");
  expect(resolved.value.calculation.result.iso).toBe("2026-03-08T08:30:00.000Z");
  expect(input.slice(resolved.event!.span.start, resolved.event!.span.end)).toBe("call Sam");
  expect(input.slice(resolved.source.span.start, resolved.source.span.end)).toBe(
    "03/08/2026 at 2:30 am",
  );
  expect(interpretDate(input, { ...context, timezone: "UTC", selection }).status).toBe(
    "needs-clarification",
  );
});

it("handles a half-hour DST transition without assuming a one-hour gap", () => {
  const result = interpretDate("October 4, 2026 at 2:15 am", {
    ...context,
    timezone: "Australia/Lord_Howe",
  });
  if (result.status === "resolved" || !result.clarification) throw new Error("Missing choices");
  const ids = result.clarification.choices.map((choice) => Date.parse(choice.id));
  expect(ids[1] - ids[0]).toBe(30 * 60_000);
});

it("rejects stale or invented clock choices and does not discard operations", () => {
  const input = "November 1, 2026 at 1:30 am";
  const result = interpretDate(input, context);
  if (result.status === "resolved" || !result.clarification) throw new Error("Missing choices");
  const selection = { contextKey: result.clarification.contextKey, id: "2026-11-01T06:30:00Z" };
  expect(
    interpretDate(input, { ...context, reference: "2026-09-13T16:00:00Z", selection }).status,
  ).toBe("needs-clarification");
  expect(
    interpretDate(input, { ...context, selection: { ...selection, id: "2026-11-01T09:00:00Z" } })
      .status,
  ).toBe("needs-clarification");
  const math = interpretDate("October 31, 2026 at 1:30 am plus 1 day", context);
  expect(math.status).toBe("needs-clarification");
  if (math.status !== "resolved") {
    expect(math.clarification?.choices).toHaveLength(2);
    expect(math.clarification?.choices.every((choice) => choice.id.startsWith("arithmetic:"))).toBe(
      true,
    );
  }
});
