import { expect, it } from "vite-plus/test";
import { interpretDate, type Interpretation } from "./interpret-date";
import { appendSelection, type ClarificationSelection } from "./clarify-numeric-date";
const context = { timezone: "America/Chicago", reference: "2026-10-31T12:00:00Z" };
it.each(["at 1:30am", "from 1:30am to 3am", "at 1:30am for 1 hour", "from midnight to 1:30am"])(
  "does not ask about past occurrence clocks: %s",
  (clock) => {
    const result = interpretDate(`every Sunday ${clock} until 2026-11-08`, {
      timezone: "America/Chicago",
      reference: "2026-11-01T08:00:00Z",
    });
    if (result.status !== "resolved" || result.value.kind !== "recurrence")
      throw new Error(JSON.stringify(result));
    expect(result.value.occurrences).toHaveLength(1);
    expect(result.value.occurrences[0].start.result.local.slice(0, 10)).toBe("2026-11-08");
    expect(result.value.rule.clockOverrides).toBeUndefined();
  },
);
it.each(["2026-11-01T07:00:00Z", "2026-11-01T07:30:00Z"])(
  "still asks when a candidate start is upcoming or exactly now: %s",
  (reference) => {
    expect(
      interpretDate("every Sunday at 1:30am", { timezone: "America/Chicago", reference }).status,
    ).toBe("needs-clarification");
  },
);
it("skips a nonexistent start only when both replacements are past", () => {
  const options = { timezone: "America/Sao_Paulo", reference: "2018-11-04T04:00:00Z" };
  const result = interpretDate("daily at midnight until 2018-11-06", options);
  if (result.status !== "resolved" || result.value.kind !== "recurrence")
    throw new Error(JSON.stringify(result));
  expect(result.value.occurrences.map((row) => row.start.result.iso)).toEqual([
    "2018-11-05T02:00:00.000Z",
    "2018-11-06T02:00:00.000Z",
  ]);
  expect(
    interpretDate("daily at midnight", { ...options, reference: "2018-11-04T02:30:00Z" }).status,
  ).toBe("needs-clarification");
});
function choose(result: Interpretation, index: number, previous?: ClarificationSelection) {
  if (result.status === "resolved" || !result.clarification) throw new Error("Missing choice");
  return appendSelection(previous, {
    contextKey: result.clarification.contextKey,
    id: result.clarification.choices[index].id,
  });
}
it("changes only the selected repeated occurrence and retains event text", () => {
  const input = "Remind me to call Sam every Sunday at 1:30am";
  const first = interpretDate(input, context);
  const selection = choose(first, 1);
  const result = interpretDate(input, { ...context, selection });
  if (result.status !== "resolved" || result.value.kind !== "recurrence")
    throw new Error("Missing schedule");
  expect(result.value.occurrences.map((row) => row.start.result.iso)).toEqual([
    "2026-11-01T07:30:00.000Z",
    "2026-11-08T07:30:00.000Z",
    "2026-11-15T07:30:00.000Z",
  ]);
  expect(result.value.rule.clockOverrides).toHaveLength(1);
  expect(result.value.rule.clockOverrides?.[0].date).toBe("2026-11-01");
  expect(result.event?.text).toBe("call Sam");
  expect(interpretDate(input + " ", { ...context, selection }).status).toBe("needs-clarification");
  expect(
    interpretDate(input, { ...context, reference: "2026-10-30T12:00:00Z", selection }).status,
  ).toBe("needs-clarification");
});
it("does not shift later weekly clocks after a skipped-time replacement", () => {
  const input = "every Sunday at 2:30am";
  const options = { ...context, reference: "2026-03-07T12:00:00Z" };
  const result = interpretDate(input, {
    ...options,
    selection: choose(interpretDate(input, options), 1),
  });
  if (result.status !== "resolved" || result.value.kind !== "recurrence")
    throw new Error("Missing schedule");
  expect(result.value.occurrences.map((row) => row.start.result.local.slice(0, 19))).toEqual([
    "2026-03-08T03:30:00",
    "2026-03-15T02:30:00",
    "2026-03-22T02:30:00",
  ]);
});
it("asks separately for range endpoints and refuses reversed selections", () => {
  const input = "every Sunday from 1:10am to 1:50am";
  const start = choose(interpretDate(input, context), 1);
  const next = interpretDate(input, { ...context, selection: start });
  const reversed = interpretDate(input, { ...context, selection: choose(next, 0, start) });
  expect(reversed.status).toBe("needs-clarification");
  const result = interpretDate(input, { ...context, selection: choose(next, 1, start) });
  if (result.status !== "resolved" || result.value.kind !== "recurrence")
    throw new Error("Missing schedule");
  expect(result.value.rule.clockOverrides).toHaveLength(2);
  expect(result.value.occurrences[0].start.result.iso).toBe("2026-11-01T07:10:00.000Z");
  expect(result.value.occurrences[0].end?.result.iso).toBe("2026-11-01T07:50:00.000Z");
});
it("does not ask about excluded ambiguous occurrences", () => {
  const result = interpretDate("every Sunday at 1:30am except 2026-11-01", context);
  expect(result.status).toBe("resolved");
});

it("does not reuse a choice after timezone changes or for another occurrence", () => {
  const input = "every Sunday at 1:30am";
  const first = interpretDate(input, context);
  const selection = choose(first, 1);
  expect(interpretDate(input, { ...context, timezone: "America/New_York", selection }).status).toBe(
    "needs-clarification",
  );
  if (!selection) throw new Error("Missing selection");
  expect(
    interpretDate(input, {
      ...context,
      selection: { ...selection, id: selection.id.replace("2026-11-01:start", "2026-11-08:start") },
    }).status,
  ).toBe("needs-clarification");
});
