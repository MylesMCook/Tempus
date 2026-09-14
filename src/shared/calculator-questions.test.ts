import { describe, expect, it } from "vite-plus/test";
import { parse } from "./sdk";
import { calculateDate } from "./date-parser";
import { parseExpression } from "./date-engine/grammar";

const options = { timezone: "America/Chicago", reference: "2026-09-13T15:00:00Z" };

describe("calculator questions", () => {
  it.each([
    ["What time was it 2 hours and 15 minutes ago?", "2026-09-13T12:45:00.000Z"],
    ["What time will it be in 90 minutes?", "2026-09-13T16:30:00.000Z"],
    ["What date is January 31 2027 plus 1 month plus 1 month?", "2027-03-28T05:00:00.000Z"],
    ["What is one and a half weeks ago?", "2026-09-03T03:00:00.000Z"],
    ["Calculate 0.01 days", "2026-09-13T15:14:24.000Z"],
  ])("evaluates %s through the calculator and public parser", (input, expected) => {
    const result = parse(input, options);
    expect(result.status).toBe("resolved");
    if (result.status !== "resolved" || result.value.kind !== "point")
      throw new Error("Expected point");
    expect(result.input).toBe(input);
    expect(result.event).toBeUndefined();
    expect(result.value.calculation.result.iso).toBe(expected);
    expect(result.value.calculation.expression).toBe(input);
    expect(result.value.calculation.steps.length).toBeGreaterThan(0);
    expect(calculateDate(input, options)).toEqual(result.value.calculation);
  });

  it("retains original token spans and written-order clamping steps", () => {
    const input = "  What date is January 31 2027 plus 1 month plus 1 month?";
    const plan = parseExpression(input);
    for (const token of plan.tokens) expect(input.slice(token.start, token.end)).toBe(token.text);
    const result = calculateDate(input, options);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.steps.map((step) => step.after.local.slice(0, 10))).toEqual([
      "2027-02-28",
      "2027-03-28",
    ]);
  });

  it.each([
    "What time was it 2 hours and 15 minutes ago if the meeting happened?",
    "What time will it be in 90 minutes unless I cancel?",
    "Calculate tomorrow but not Friday",
    "What is tomorrow or Friday?",
    "What time will it be in 2 hours in Tokyo?",
    "What time was it in 2 hours?",
    "What time will it be 2 hours ago?",
    "What time was it minus 2 hours ago?",
  ])("does not silently remove meaning from %s", (input) => {
    expect(calculateDate(input, options).ok).toBe(false);
    expect(parse(input, options).status).not.toBe("resolved");
  });
});
