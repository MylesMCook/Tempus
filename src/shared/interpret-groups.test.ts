import { expect, it } from "vite-plus/test";
import { interpretGroups } from "./interpret-groups";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
it("preserves every group, interval and source span", () => {
  const text = "Sat Sun 1pm-8pm Mon 10pm-12am";
  const result = interpretGroups(text, context);
  if (!result?.ok) throw new Error("Missing groups");
  expect(result.occurrences.map((row) => [row.start.result.iso, row.end.result.iso])).toEqual([
    ["2026-09-12T18:00:00.000Z", "2026-09-13T01:00:00.000Z"],
    ["2026-09-13T18:00:00.000Z", "2026-09-14T01:00:00.000Z"],
    ["2026-09-15T03:00:00.000Z", "2026-09-15T05:00:00.000Z"],
  ]);
  for (const row of result.occurrences)
    expect(text.slice(row.source.span.start, row.source.span.end)).toBe(row.source.text);
  expect(result.kind).toBe("collection");
});
it.each(["Saturday Sunday from 1pm to 8pm; Monday 10pm-midnight", "Sat 1pm-8pm, Sun 2pm-3pm"])(
  "accepts complete groups: %s",
  (text) => {
    expect(interpretGroups(text, context)?.ok).toBe(true);
  },
);
it.each([
  "Sat 1pm-8pm",
  "every Sat Sun 1pm-8pm",
  "Sat Sun 1pm-8pmMon 10pm-12am",
  "Sat Sun 1pm-8pm;",
])("does not accept partial or unrelated input: %s", (text) => {
  expect(interpretGroups(text, context)).toBeNull();
});
it.each(["Sat Sat 1pm-8pm", "Sat Sun 25:00-26:00", "Sat 1pm-8pm Sun 10pm-10pm"])(
  "rejects invalid or duplicated groups: %s",
  (text) => {
    expect(interpretGroups(text, context)?.ok).toBe(false);
  },
);
it("rejects the entire collection when one clock needs clarification", () => {
  const result = interpretGroups("Sat Sun 1:30am-3am", {
    ...context,
    reference: "2026-10-31T05:00:00Z",
  });
  expect(result?.ok).toBe(false);
  if (result && !result.ok) expect(result.error.code).toBe("ambiguous-time");
});

it.each(["Sat Sun 1pm-8pm except Sunday", "Sat Sun 1pm-8pm and tomorrow"])(
  "reports an incomplete collection: %s",
  (text) => {
    const result = interpretGroups(text, context);
    expect(result?.ok).toBe(false);
    if (result && !result.ok) {
      expect(result.error.message).toContain("Complete every weekday range");
      expect(result.clockPrompt).toBeUndefined();
    }
  },
);
