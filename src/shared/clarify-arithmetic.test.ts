import { expect, it } from "vite-plus/test";
import { interpretDate } from "./interpret-date";
import { calculateDate } from "./date-parser";
import { appendSelection, type ClarificationSelection } from "./clarify-numeric-date";
const options = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };

it.each([
  ["October 31, 2026 at 1:30am plus 1 day plus 2 hours", 0, "2026-11-01T08:30:00.000Z"],
  ["October 31, 2026 at 1:30am plus 1 day plus 2 hours", 1, "2026-11-01T09:30:00.000Z"],
  ["March 7, 2026 at 2:30am plus 1 day plus 2 hours", 0, "2026-03-08T09:30:00.000Z"],
  ["March 7, 2026 at 2:30am plus 1 day plus 2 hours", 1, "2026-03-08T10:30:00.000Z"],
  ["March 7, 2026 at 2:30am plus 1.5 days plus 2 hours", 0, "2026-03-08T21:30:00.000Z"],
  ["March 7, 2026 at 2:30am plus 1.5 days plus 2 hours", 1, "2026-03-08T22:30:00.000Z"],
] as const)("continues all arithmetic for %s, choice %s", (input, index, expected) => {
  const first = interpretDate(input, options);
  if (first.status !== "needs-clarification" || !first.clarification)
    throw new Error("Missing choices");
  const selection = {
    contextKey: first.clarification.contextKey,
    id: first.clarification.choices[index].id,
  };
  const next = interpretDate(input, { ...options, selection });
  if (next.status !== "resolved" || next.value.kind !== "point")
    throw new Error("Unresolved selection");
  expect(next.value.calculation.result.iso).toBe(expected);
  expect(next.value.calculation.steps).toHaveLength(2);
  expect(next.value.calculation.warnings.join(" ")).toContain("you selected");
  expect(next.source.text).toBe(input);
  expect(next.apiReplay).toBe(false);
  expect(calculateDate(input, options)).toMatchObject({
    ok: false,
    error: { code: "ambiguous-time" },
  });
  expect(interpretDate(input.replace("2 hours", "3 hours"), { ...options, selection }).status).toBe(
    "needs-clarification",
  );
});

it("does not silently choose between conflicting selections for one clock", () => {
  const input = "October 31, 2026 at 1:30am plus 1 day plus 2 hours";
  const result = interpretDate(input, options);
  if (result.status !== "needs-clarification" || !result.clarification)
    throw new Error("Missing choices");
  const [first, second] = result.clarification.choices;
  const next = interpretDate(input, {
    ...options,
    selection: {
      contextKey: result.clarification.contextKey,
      id: second.id,
      previous: [first.id],
    },
  });
  expect(next.status).toBe("needs-clarification");
  if (next.status !== "needs-clarification" || !next.clarification)
    throw new Error("Missing recovery choices");
  const recovered = interpretDate(input, {
    ...options,
    selection: appendSelection(
      { contextKey: result.clarification.contextKey, id: second.id, previous: [first.id] },
      { contextKey: next.clarification.contextKey, id: second.id },
    ),
  });
  expect(recovered.status).toBe("resolved");
  if (recovered.status === "resolved" && recovered.value.kind === "point")
    expect(recovered.value.calculation.result.iso).toBe("2026-11-01T09:30:00.000Z");
});

it("requires each ambiguous calendar step and preserves previous decisions", () => {
  const input = "November 1, 2026 at 1:30am plus 371 days plus 2 hours";
  let selection: ClarificationSelection | undefined;
  for (let i = 0; i < 2; i++) {
    const result = interpretDate(input, { ...options, selection });
    if (result.status !== "needs-clarification" || !result.clarification)
      throw new Error("Missing sequential choice");
    selection = appendSelection(selection, {
      contextKey: result.clarification.contextKey,
      id: result.clarification.choices[1].id,
    });
  }
  const result = interpretDate(input, { ...options, selection });
  if (result.status !== "resolved" || result.value.kind !== "point")
    throw new Error("Missing final result");
  expect(result.value.calculation.result.iso).toBe("2027-11-07T09:30:00.000Z");
  expect(result.value.calculation.steps).toHaveLength(2);
  expect(
    result.value.calculation.warnings.filter((text) => text.includes("you selected")),
  ).toHaveLength(2);
  expect(
    interpretDate(input, { ...options, reference: "2026-09-13T16:00:00Z", selection }).status,
  ).toBe("needs-clarification");
  const initial = interpretDate(input, options);
  if (initial.status !== "needs-clarification" || !initial.clarification)
    throw new Error("Missing initial choice");
  const changed = appendSelection(selection, {
    contextKey: initial.clarification.contextKey,
    id: initial.clarification.choices[0].id,
  });
  const resumed = interpretDate(input, { ...options, selection: changed });
  expect(resumed.status).toBe("needs-clarification");
  if (resumed.status !== "resolved")
    expect(resumed.clarification?.choices[0].id).toContain("arithmetic:1:");
});
