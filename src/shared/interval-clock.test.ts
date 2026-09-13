import { expect, it } from "vite-plus/test";
import { interpretDate, type Interpretation } from "./interpret-date";
import { appendSelection, type ClarificationSelection } from "./clarify-numeric-date";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
function choose(result: Interpretation, index: number, previous?: ClarificationSelection) {
  if (result.status === "resolved" || !result.clarification) throw new Error("Missing choice");
  return appendSelection(previous, {
    contextKey: result.clarification.contextKey,
    id: result.clarification.choices[index].id,
  })!;
}
it("resolves a repeated start without changing the end or original event text", () => {
  const input = "Remind me to call Sam Jones November 1, 2026 1:30am-3am";
  const first = interpretDate(input, context);
  const selection = choose(first, 1);
  const result = interpretDate(input, { ...context, selection });
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw new Error("Missing interval");
  expect(result.value.start.result.iso).toBe("2026-11-01T07:30:00.000Z");
  expect(result.value.end.result.iso).toBe("2026-11-01T09:00:00.000Z");
  expect(result.event?.text).toBe("call Sam Jones");
  expect(result.value.start.anchorDescription).toContain("explicitly selected start");
  expect(result.apiReplay).toBe(false);
  expect(interpretDate(input + " ", { ...context, selection }).status).toBe("needs-clarification");
  expect(
    interpretDate(input, { ...context, reference: "2026-09-13T16:00:00Z", selection }).status,
  ).toBe("needs-clarification");
});
it("resolves both repeated endpoints through distinct context-bound choices", () => {
  const input = "November 1, 2026 1:10am-1:50am";
  const first = interpretDate(input, context);
  const start = choose(first, 0);
  const second = interpretDate(input, { ...context, selection: start });
  const end = choose(second, 1, start);
  const result = interpretDate(input, { ...context, selection: end });
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw new Error("Missing interval");
  expect(result.value.start.result.iso).toBe("2026-11-01T06:10:00.000Z");
  expect(result.value.end.result.iso).toBe("2026-11-01T07:50:00.000Z");
  expect(result.value.selectedClocks).toHaveLength(2);
});
it("rejects reversed selected instants without silently adding a day", () => {
  const input = "November 1, 2026 1:10am-1:50am";
  const start = choose(interpretDate(input, context), 1);
  const end = choose(interpretDate(input, { ...context, selection: start }), 0, start);
  const result = interpretDate(input, { ...context, selection: end });
  expect(result).toMatchObject({
    status: "needs-clarification",
    error: { message: "End: These choices put the end at or before the start." },
  });
});
it("keeps a gap replacement from manufacturing an overnight range", () => {
  const input = "March 8, 2026 2:30am-3am";
  const first = interpretDate(input, context);
  const later = interpretDate(input, { ...context, selection: choose(first, 1) });
  expect(later.status).toBe("needs-clarification");
  const earlier = interpretDate(input, { ...context, selection: choose(first, 0) });
  if (earlier.status !== "resolved" || earlier.value.kind !== "interval")
    throw new Error("Missing earlier interval");
  expect(earlier.value.start.result.iso).toBe("2026-03-08T07:30:00.000Z");
  expect(earlier.value.end.result.iso).toBe("2026-03-08T08:00:00.000Z");
  expect(earlier.value.overnight).toBe(false);
});
it("offers a destination-date fold for an overnight end", () => {
  const input = "October 31, 2026 10pm-1:30am";
  const first = interpretDate(input, context);
  const result = interpretDate(input, { ...context, selection: choose(first, 1) });
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw new Error("Missing overnight interval");
  expect(result.value.end.result.iso).toBe("2026-11-01T07:30:00.000Z");
});
it("does not resolve ambiguous arithmetic by choosing only its anchor", () => {
  expect(
    interpretDate("for 1 day from November 1, 2026 at 1:30am plus 1 day", context).status,
  ).not.toBe("resolved");
});

it.each(["2026-03-07 2:30am-2:30am", "2026-10-31 1:30am-1:30am", "2026-11-01 1:30am-1:30am"])(
  "keeps clock and next-date confirmations separate: %s",
  (input) => {
    let result = interpretDate(input, context);
    let selection: ClarificationSelection | undefined;
    for (let step = 0; step < 3 && result.status !== "resolved"; step++) {
      selection = choose(result, 0, selection);
      result = interpretDate(input, { ...context, selection });
    }
    if (result.status !== "resolved" || result.value.kind !== "interval")
      throw new Error("Unfinished interval decisions");
    expect(result.value.end.result.timestamp).toBeGreaterThan(result.value.start.result.timestamp);
    expect(result.value.selectedClocks?.length).toBeGreaterThan(0);
    expect(result.assumptions.some((s) => s.includes("next date"))).toBe(true);
  },
);
it("keeps the written end date when the whole start date was skipped", () => {
  const input = "December 30, 2011 9am-10am";
  const options = { timezone: "Pacific/Apia", reference: "2011-12-28T12:00:00Z" };
  const first = interpretDate(input, options);
  const start = choose(first, 0);
  const second = interpretDate(input, { ...options, selection: start });
  expect(second.status).toBe("needs-clarification");
  const end = choose(second, 1, start);
  const result = interpretDate(input, { ...options, selection: end });
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw new Error("Missing interval");
  expect(result.value.start.result.local.slice(0, 10)).toBe("2011-12-29");
  expect(result.value.end.result.local.slice(0, 10)).toBe("2011-12-31");
});
