import { expect, it } from "vite-plus/test";
import { interpretDate } from "./interpret-date";
import { calculateDate } from "./date-parser";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const input = "no plus 2 weeks minus 3 days + 5 hours";
const corrected = "now plus 2 weeks minus 3 days + 5 hours";

it("keeps the strict calculator contract unchanged", () => {
  expect(calculateDate(input, context).ok).toBe(false);
  expect(calculateDate(corrected, context).ok).toBe(true);
});

function correction() {
  const prompt = interpretDate(input, context);
  if (prompt.status !== "needs-clarification" || !prompt.clarification)
    throw new Error("Expected a correction choice");
  expect(prompt.clarification.question).toBe(`Did you mean “${corrected}”?`);
  expect(prompt.clarification.choices).toEqual([
    { id: "spelling:now", label: `Use “${corrected}”`, expression: corrected },
  ]);
  return { contextKey: prompt.clarification.contextKey, id: "spelling:now" };
}

it("offers a specific correction without calculating or proposing an event title", () => {
  correction();
});

it("calculates the complete confirmed expression from the captured instant", () => {
  const selection = correction();
  const result = interpretDate(input, { ...context, selection });
  const expected = interpretDate(corrected, context);
  if (result.status !== "resolved" || result.value.kind !== "point")
    throw new Error("Expected a point after confirmation");
  expect(result.value).toEqual(expected.status === "resolved" ? expected.value : undefined);
  expect(result.value.calculation.result.iso).toBe("2026-09-23T21:00:00.000Z");
  expect(result.value.calculation.anchor.iso).toBe("2026-09-12T16:00:00.000Z");
  expect(result.event).toBeUndefined();
  expect(result.source).toEqual({ text: input, span: { start: 0, end: input.length } });
  expect(result.selectedChoice).toContain("now");
  expect(result.apiReplay).toBe(false);
});

it.each(["input", "reference", "timezone", "choice"])(
  "requires confirmation again when %s changes",
  (change) => {
    const selection = correction();
    const result = interpretDate(change === "input" ? `${input} ` : input, {
      ...context,
      ...(change === "reference" ? { reference: "2026-09-12T17:00:00Z" } : {}),
      ...(change === "timezone" ? { timezone: "UTC" } : {}),
      selection: change === "choice" ? { ...selection, id: "event:title" } : selection,
    });
    expect(result.status).toBe("needs-clarification");
  },
);

it("retains ordinary event-title confirmation instead of treating titles as typos", () => {
  const result = interpretDate("No Plus review tomorrow", context);
  if (result.status !== "needs-clarification" || !result.clarification)
    throw new Error("Expected an event title choice");
  expect(result.clarification.choices[0].id).toBe("event:title");
});

it("does not offer a correction for an invalid complete expression", () => {
  const result = interpretDate("no plus 2 weeks nonsense Friday", context);
  expect(result.status).not.toBe("resolved");
  if (result.status !== "resolved")
    expect(result.clarification?.choices.some((choice) => choice.id === "spelling:now")).not.toBe(
      true,
    );
});
