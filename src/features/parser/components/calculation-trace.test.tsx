import { expect, it } from "vite-plus/test";
import { renderToStaticMarkup } from "react-dom/server";
import { parse } from "@/shared/sdk";
import type { Calculation } from "@/shared/date-parser";
import { CalculationTrace } from "./calculation-trace";

function pointCalculation(expression: string): Extract<Calculation, { ok: true }> {
  const result = parse(expression, {
    timezone: "America/Chicago",
    reference: "2026-09-14T16:00:00Z",
  });
  if (result.status !== "resolved" || result.value.kind !== "point") {
    throw new Error(`Expected resolved point for ${expression}`);
  }
  return result.value.calculation;
}

function headingBefore(html: string, label: string): string {
  const index = html.indexOf(`>${label}<`);
  if (index < 0) throw new Error(`Missing ${label}`);
  return html.slice(Math.max(0, index - 280), index);
}

it("gives each CalculationTrace a unique inputs heading id", () => {
  const html = renderToStaticMarkup(
    <>
      <CalculationTrace calculation={pointCalculation("September 14 2026")} />
      <CalculationTrace calculation={pointCalculation("September 21 2026")} />
    </>,
  );
  const labelledBy = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map((match) => match[1]);
  expect(labelledBy).toHaveLength(2);
  expect(labelledBy[0]).not.toBe(labelledBy[1]);
  expect(html).toContain(`id="${labelledBy[0]}"`);
  expect(html).toContain(`id="${labelledBy[1]}"`);
  expect(html).not.toContain('id="calculation-inputs-heading"');
});

it("marks the starting date as current when there are no steps", () => {
  const calculation = pointCalculation("September 14 2026");
  expect(calculation.steps).toHaveLength(0);
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  expect(html).toContain("The starting date is the result.");
  expect(headingBefore(html, "Starting date")).toContain("bg-primary");
  expect(headingBefore(html, "Starting date")).not.toContain("bg-muted-foreground");
});

it("keeps calculation steps closed until opened", () => {
  const html = renderToStaticMarkup(
    <CalculationTrace calculation={pointCalculation("today plus 2 weeks minus 3 days")} />,
  );
  expect(html).toContain("Show calculation steps");
  expect(html).toContain("Calculation inputs");
  const detailsTags = html.match(/<details\b[^>]*>/g) ?? [];
  expect(detailsTags.length).toBeGreaterThan(0);
  expect(detailsTags.every((tag) => !/\sopen(?:[\s>=]|$)/.test(tag))).toBe(true);
});

it("keeps the starting date a non-current marker when later steps exist", () => {
  const calculation = pointCalculation("6 months before September 14 2026");
  expect(calculation.steps.length).toBeGreaterThan(0);
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  expect(headingBefore(html, "Starting date")).toContain("bg-muted-foreground");
  expect(headingBefore(html, "Starting date")).not.toContain("bg-primary");
});
