import { expect, it } from "vite-plus/test";
import { renderToStaticMarkup } from "react-dom/server";
import { parse } from "@/shared/sdk";
import type { Calculation } from "@/shared/date-parser";
import { CalculationTrace } from "./calculation-trace";

function pointCalculation(
  expression: string,
  reference = "2026-09-14T16:00:00Z",
): Extract<Calculation, { ok: true }> {
  const result = parse(expression, {
    timezone: "America/Chicago",
    reference,
  });
  if (result.status !== "resolved" || result.value.kind !== "point") {
    throw new Error(`Expected resolved point for ${expression}`);
  }
  return result.value.calculation;
}

function timestamp(date: { local: string; offset: string }) {
  return `${date.local.replace("T", " ").replace(/\.000$/, "")} ${date.offset}`;
}

it("explains friday next week from the reference before showing the selected Friday", () => {
  const calculation = pointCalculation("friday next week", "2026-10-15T17:00:00Z");
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  const ladder = html.slice(0, html.indexOf("</ol>"));
  expect(ladder.indexOf("Reference time")).toBeGreaterThan(-1);
  expect(ladder.indexOf("Thu, Oct 15, 2026")).toBeGreaterThan(-1);
  expect(ladder.indexOf("Fri, Oct 23, 2026")).toBeGreaterThan(ladder.indexOf("Thu, Oct 15, 2026"));
  expect(ladder).not.toContain("Starting date");
  expect(ladder).not.toContain("Select the date");
  expect(ladder).not.toContain("Start at midnight");
  expect(ladder).toContain("Result");
  expect(html).toContain(calculation.anchorDescription);
});

it.each([
  ["today", true, "12:00 AM CDT"],
  ["today at midnight", false, "12:00 AM CDT"],
  ["now", false, "11:00 AM CDT"],
  ["friday next week", true, "12:00 AM CDT"],
])("uses result precision for the readable clocks in %s", (expression, dateOnly, clock) => {
  const calculation = pointCalculation(expression);
  const html = renderToStaticMarkup(
    <CalculationTrace calculation={calculation} dateOnly={dateOnly} />,
  );
  const ladder = html.slice(0, html.indexOf("</ol>"));
  expect(ladder.includes(clock)).toBe(!dateOnly);
  expect(ladder).toContain(`dateTime="${calculation.reference}"`);
  expect(ladder).toContain(`dateTime="${calculation.anchor.iso}"`);
  expect(html).toContain(calculation.anchorDescription);
  expect(html).toContain(timestamp(calculation.anchor));
  expect(ladder).not.toContain("Select the date");
});

it("walks through readable date checkpoints in calculation order", () => {
  const calculation = pointCalculation("today plus 2 weeks minus 3 days");
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  const ladder = html.slice(0, html.indexOf("</ol>"));
  const checkpoints = [
    "Mon, Sep 14, 2026",
    "Add 2 weeks",
    "Mon, Sep 28, 2026",
    "Subtract 3 days",
    "Fri, Sep 25, 2026",
  ];
  let previous = -1;
  for (const checkpoint of checkpoints) {
    const position = ladder.indexOf(checkpoint);
    expect(position).toBeGreaterThan(previous);
    previous = position;
  }
  expect(ladder).toContain(">Result<");
});

it("keeps clock precision comparable across every checkpoint", () => {
  const calculation = pointCalculation("March 7 2026 at noon plus 23.5005 hours");
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  const ladder = html.slice(0, html.indexOf("</ol>"));
  expect(ladder).toContain("Sat, Mar 7, 2026");
  expect(ladder).toContain("12:00 PM");
  expect(ladder).toContain("12:30:01.800 PM");
});

it("distinguishes the two occurrences of the repeated autumn clock hour", () => {
  const calculation = pointCalculation("now plus 1 hour", "2026-11-01T06:30:00Z");
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  const ladder = html.slice(0, html.indexOf("</ol>"));
  expect(ladder).toContain("1:30 AM CDT");
  expect(ladder).toContain("1:30 AM CST");
  expect(ladder).toContain("Elapsed: 1 hour");
  expect(ladder).toContain(calculation.anchor.iso);
  expect(ladder).toContain(calculation.result.iso);
});

it("gives each debug panel and JSON region unique heading references", () => {
  const html = renderToStaticMarkup(
    <>
      <CalculationTrace calculation={pointCalculation("September 14 2026")} />
      <CalculationTrace calculation={pointCalculation("September 21 2026")} />
    </>,
  );
  const labelledBy = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map((match) => match[1]);
  expect(labelledBy).toHaveLength(4);
  expect(new Set(labelledBy).size).toBe(4);
  for (const id of labelledBy) expect(html).toContain(`id="${id}"`);
  expect(html).not.toContain('id="calculation-inputs-heading"');
});

it("marks the starting date as current when there are no steps", () => {
  const calculation = pointCalculation("September 14 2026");
  expect(calculation.steps).toHaveLength(0);
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  expect(html).toContain("Your phrase gives the result directly, with no arithmetic adjustments.");
  const selected = html.slice(
    html.indexOf('aria-label="Calculation steps"'),
    html.indexOf("</ol>"),
  );
  expect(selected).toContain("bg-primary");
  expect(selected).not.toContain("ring-muted-foreground/50");
});

it("keeps calculation steps closed until opened", () => {
  const html = renderToStaticMarkup(
    <CalculationTrace calculation={pointCalculation("today plus 2 weeks minus 3 days")} />,
  );
  expect(html).toContain("Show calculation steps");
  expect(html).toContain("Debug calculation");
  const detailsTags = html.match(/<details\b[^>]*>/g) ?? [];
  expect(detailsTags.length).toBeGreaterThan(0);
  expect(detailsTags.every((tag) => !/\sopen(?:[\s>=]|$)/.test(tag))).toBe(true);
});

it("keeps the starting date a non-current marker when later steps exist", () => {
  const calculation = pointCalculation("6 months before September 14 2026");
  expect(calculation.steps.length).toBeGreaterThan(0);
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  const anchor = html.slice(html.indexOf('aria-label="Calculation steps"'), html.indexOf("</li>"));
  expect(anchor).toContain("ring-muted-foreground/50");
  expect(anchor).not.toContain("bg-primary");
});

it("labels each step from and to the recorded instants", () => {
  const calculation = pointCalculation("today plus 2 weeks minus 3 days");
  expect(calculation.steps).toHaveLength(2);
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  expect(html.match(/>Read as</g)).toHaveLength(1);
  expect(html).toContain(`>${calculation.normalized}</p>`);
  expect(html).not.toContain('aria-label="Recognized parts"');
  expect(html).not.toContain("Typed as");
  expect(html).toContain("Reference time:");
  expect(html).toContain(calculation.timezone);
  expect(html).toContain(">From </dt>");
  expect(html).toContain(">To </dt>");
  for (const step of calculation.steps) {
    expect(html).toContain(timestamp(step.before));
    expect(html).toContain(timestamp(step.after));
  }
});

it("keeps clamp notes beside labeled from and to endpoints", () => {
  const calculation = pointCalculation("January 31 2027 plus 1 month");
  expect(calculation.steps.length).toBeGreaterThan(0);
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  expect(html).toContain(">From </dt>");
  expect(html).toContain(timestamp(calculation.steps[0].before));
  expect(html).toContain(timestamp(calculation.steps[0].after));
  expect(html).toContain("Clamped.");
});

it("shows the exact engine input separately from the normalized phrase", () => {
  const html = renderToStaticMarkup(
    <CalculationTrace calculation={pointCalculation("today plus 2 weeks.")} />,
  );
  expect(html).toContain(">today plus 2 weeks.</pre>");
  expect(html).not.toContain("Typed as");
  expect(html).toContain(">today plus 2 weeks</p>");
});

it("preserves engine-input whitespace and counts the displayed characters", () => {
  const calculation = pointCalculation("today   plus 2 weeks");
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  expect(html).toContain(`>${calculation.expression}</pre>`);
  expect(html).toContain(`Engine input · ${Array.from(calculation.expression).length} characters`);
  expect(html).toContain("whitespace-pre-wrap");
});

it("marks repeated clamp details in both walkthrough and debug", () => {
  const calculation = pointCalculation("January 31 2026 plus 1 month");
  const detail = calculation.steps[0].details.find((value) => value.includes("clamp to day"));
  expect(detail).toBeDefined();
  calculation.steps[0].details.push(detail!);
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  expect(html.match(/>Clamped\.<\/div>/g)).toHaveLength(4);
});

it.each([
  ["today", "0 milliseconds"],
  ["today plus 2 weeks minus 3 days", "264 hours"],
  ["March 8 2026 at noon minus 1 day", "-23 hours"],
  ["now plus 0.5 seconds", "500 milliseconds"],
])("summarizes the exact signed duration for %s", (expression, elapsed) => {
  const calculation = pointCalculation(expression);
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  expect(html).toContain("Total elapsed time</dt><dd>" + elapsed);
  expect(html).toContain("Result (UTC)</dt><dd");
  expect(html).toContain(`Local time (${calculation.timezone})`);
  expect(html).toContain("Weekday");
  if (!calculation.steps.length) expect(html).toContain("No adjustments recorded.");
  else expect(html).toContain("Elapsed time: ");
});

it("shows the captured reference first while retaining exact UTC", () => {
  const calculation = pointCalculation("today plus 2 weeks minus 3 days");
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  const start = html.slice(0, html.indexOf('aria-label="Calculation steps"'));
  expect(start).toContain("Reference time");
  expect(start).toContain(`dateTime="${calculation.reference}"`);
  expect(start).toContain("Sep 14, 2026 at 11:00 AM");
  expect(html).toContain("Sep 14, 2026 11:00:00.000 -05:00");
  expect(html).toContain(calculation.reference);
  expect(html).toContain(calculation.result.iso);
});

it.each([
  ["March 7 2026 at noon plus 1 day", "23 hours"],
  ["March 7 2026 at noon plus 24 hours", "24 hours"],
  ["October 31 2026 at noon plus 1 day", "25 hours"],
  ["March 8 2026 at noon minus 1 day", "-23 hours"],
  ["March 7 2026 at noon plus 23.5005 hours", "23 hours 30 minutes 1 second 800 milliseconds"],
])("explains elapsed time for %s without changing exact endpoints", (expression, elapsed) => {
  const calculation = pointCalculation(expression);
  const before = JSON.stringify(calculation);
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  expect(html).toContain(`Elapsed: ${elapsed}`);
  for (const step of calculation.steps) {
    expect(html).toContain(timestamp(step.before));
    expect(html).toContain(timestamp(step.after));
    for (const detail of step.details) expect(html).toContain(detail);
  }
  expect(JSON.stringify(calculation)).toBe(before);
});

it("adds no elapsed line when neither step changes offset", () => {
  const html = renderToStaticMarkup(
    <CalculationTrace calculation={pointCalculation("today plus 2 weeks minus 3 days")} />,
  );
  expect(html).not.toContain("Elapsed:");
});

it("highlights the actual approximation and preserves its conversion and rounding rule", () => {
  const calculation = pointCalculation("January 1 2026 plus 0.5 months");
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  expect(html).toContain("Approximated.");
  expect(html).toContain('role="note"');
  expect(html).toContain("bg-warning/5");
  for (const warning of calculation.warnings) expect(html).toContain(warning);
  expect(html).toContain("30.436875 days/month");
  expect(html).toContain("rounded to the nearest day");
});

it("explains the clamped starting point for the following month step", () => {
  const calculation = pointCalculation("January 31 2026 plus 1 month plus 1 month");
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  expect(html).toContain("Clamped.");
  expect(html).toContain("Starts from step 1");
  expect(html).toContain(timestamp(calculation.steps[0].after));
  expect(html).toContain(timestamp(calculation.steps[1].before));
  expect(html).toContain(timestamp(calculation.result));
  expect(calculation.result.local).toContain("2026-03-28");
  const ladder = html.slice(0, html.indexOf("</ol>"));
  expect(ladder).not.toContain("Calendar change, applied to this step");
});

it("keeps the walkthrough and nested debug view closed", () => {
  const html = renderToStaticMarkup(
    <CalculationTrace calculation={pointCalculation("today plus 2 weeks minus 3 days")} />,
  );
  expect(html).toContain("Debug calculation");
  expect(html).toContain("Raw calculation JSON");
  const detailsTags = html.match(/<details\b[^>]*>/g) ?? [];
  expect(detailsTags).toHaveLength(2);
  expect(detailsTags.every((tag) => !/\sopen(?:[\s>=]|$)/.test(tag))).toBe(true);
});

it("restores the detailed debug stages using the actual calculation fields", () => {
  const calculation = pointCalculation("January 31 2026 plus 1 month plus 1 month");
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  for (const label of [
    "Calculation summary",
    "Expression analysis",
    "Starting date",
    "Final calculation",
    "Raw calculation JSON",
    "Engine version",
    "Epoch milliseconds",
    "UTC offset",
    "Warnings",
  ])
    expect(html).toContain(label);
  for (const date of [
    calculation.anchor,
    ...calculation.steps.flatMap((step) => [step.before, step.after]),
    calculation.result,
  ]) {
    expect(html).toContain(timestamp(date));
    expect(html).toContain(date.iso);
    expect(html).toContain(String(date.timestamp));
  }
  for (const step of calculation.steps)
    for (const detail of step.details) expect(html).toContain(detail);
  expect(html).toContain("None");
  expect(html).not.toContain("Tokenization");
  expect(html).not.toContain("Parse Time");
});

it("keeps the existing failure explanation without showing successful debug data", () => {
  const calculation: Calculation = {
    ok: false,
    engineVersion: 2,
    error: { code: "syntax", message: "Cannot read this phrase.", hint: "Try a calendar date." },
  };
  const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} />);
  expect(html).toContain("Cannot read this phrase. Try a calendar date.");
  expect(html).not.toContain("Debug calculation");
  expect(html).not.toContain("Calculation summary");
});

it.each(["today", "today plus 2 weeks minus 3 days"])(
  "keeps the date-only note beside the final result for %s",
  (expression) => {
    const calculation = pointCalculation(expression);
    const html = renderToStaticMarkup(<CalculationTrace calculation={calculation} dateOnly />);
    const steps = html.slice(html.indexOf('aria-label="Calculation steps"'), html.indexOf("</ol>"));
    const result = steps.slice(steps.indexOf(">Result<"));
    expect(result.indexOf("Date only; no time of day was requested.")).toBeGreaterThan(
      result.indexOf(`dateTime="${calculation.result.iso}"`),
    );
    expect(html.match(/Date only; no time of day was requested\./g)).toHaveLength(1);
    expect(steps).not.toContain("Date from your phrase");
    expect(html).not.toContain("Selection rules and exact timestamps are in Debug calculation.");
  },
);
