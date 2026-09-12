import { describe, expect, it } from "vite-plus/test";
import { calculateDate } from "./date-parser";
import { buildParseResponse } from "./parse-api";
import { compatibilityCases } from "./date-engine/compatibility-fixtures";
const options = { timezone: "America/Chicago", reference: "2026-01-26T19:30:00.000Z" };
describe("natural-language compatibility", () => {
  it.each(compatibilityCases)("%s → %s", (expression, expected) => {
    const result = calculateDate(expression, options);
    expect(result).toMatchObject({ ok: true, result: { iso: expected } });
    expect(buildParseResponse({ expression, ...options })).toMatchObject({
      status: 200,
      body: { date: expected },
    });
    if (result.ok) expect(result.steps.at(-1)?.after ?? result.anchor).toEqual(result.result);
  });
  it.each([
    "today nonsense",
    "3 weeks ago garbage",
    "one hundred hundred days",
    "two twenty days",
    "last 3 weeks",
    "a few days ago",
    "several months ago",
    "14/09/2026",
    "3 weeks tomorrow",
    "one and a half",
    "2 days and",
    "2 years one million thousand days",
  ])("does not guess %s", (expression) =>
    expect(calculateDate(expression, options).ok).toBe(false),
  );
  it("labels fractional-month approximation in both result and trace", () => {
    const result = calculateDate("1.5 months ago", options);
    expect(result).toMatchObject({
      ok: true,
      warnings: [expect.stringContaining("Approximation:")],
    });
    if (result.ok) expect(result.steps[0].details).toContain(result.warnings[0]);
  });
  it("converts half years exactly to calendar months", () =>
    expect(calculateDate("0.5 years", options)).toMatchObject({ ok: true, warnings: [] }));
});

it("warns when a tiny calendar fraction rounds to zero", () => {
  const result = calculateDate("0.000001 months", options);
  expect(result).toMatchObject({
    ok: true,
    result: { iso: options.reference },
    warnings: [expect.stringContaining("0 calendar days")],
  });
});
it("converts rational year fractions without floating-point drift", () => {
  expect(calculateDate("1/3 year", options)).toMatchObject({
    ok: true,
    result: { iso: "2026-05-26T18:30:00.000Z" },
    warnings: [],
  });
});
