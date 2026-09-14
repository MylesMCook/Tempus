import { describe, expect, it } from "vite-plus/test";
import { parse } from "./sdk";
import { calculateDate } from "./date-parser";
import { parseExpression } from "./date-engine/grammar";
const reference = "2026-01-26T19:30:00.000Z";
const options = { timezone: "America/Chicago", reference };
function result(expression: string, opts = options) {
  const calculation = calculateDate(expression, opts);
  if (!calculation.ok) throw new Error(JSON.stringify(calculation.error));
  return calculation;
}

import { oracleCases } from "./date-engine/oracle-fixtures";
import { compatibilityCases } from "./date-engine/compatibility-fixtures";
import { examples, featuredExamples } from "../features/parser/examples";

describe("Phoenix independent date oracles", () => {
  it("keeps returned snapshots independent when a consumer annotates one", () => {
    const calculation = result("today plus 2 days plus 1 month");
    const expected = structuredClone(calculation);
    calculation.steps[0].before.local = "consumer annotation";
    calculation.steps[1].before.iso = "consumer annotation";
    calculation.result.timestamp = 0;
    expect(calculation.anchor).toEqual(expected.anchor);
    expect(calculation.steps[0].after).toEqual(expected.steps[0].after);
    expect(calculation.steps[1].after).toEqual(expected.steps[1].after);
    const point = result("now");
    const anchor = { ...point.anchor };
    point.result.local = "consumer annotation";
    expect(point.anchor).toEqual(anchor);
    expect(result("today plus 2 days plus 1 month")).toEqual(expected);
  });
  it.each(oracleCases)("%s → %s", (phrase, expected) => {
    const calculation = result(phrase);
    expect(calculation.result.iso).toBe(expected);
    expect(calculation.steps.at(-1)?.after ?? calculation.anchor).toEqual(calculation.result);
    calculation.steps.forEach((step, index) =>
      expect(step.before).toEqual(index ? calculation.steps[index - 1].after : calculation.anchor),
    );
  });
  it("exposes written operation order in the parsed plan", () => {
    expect(
      parseExpression("today plus 2 days plus 1 month").operations.map((op) => op.unit),
    ).toEqual(["day", "month"]);
  });
});

describe("No guessed or rounded answers", () => {
  it.each([
    "",
    "gibberish",
    "today nonsense",
    "in",
    "in 3",
    "today plus",
    "2 days before",
    "today tomorrow",
    "today plus 2",
    "1/0 days",
    "12/25/2026",
    "feb 30 2026",
    "feb 29 2025",
    "jan 0",
    "jan 1.5",
    "2026-13-01",
    "2026-01-32",
    "0",
    "32",
    "2 days before 31",
    "in 2 days ago",
    "today at 24:00",
    "today at 12:60",
    "today at 23:59:60",
    "today at 12:30:60.001",
    "today at 3",
    "today at 0 pm",
    "today at 12:30:00.0001",
    "today + -3 days",
    "in two hundred hundred days",
  ])("rejects %s", (phrase) => {
    expect(calculateDate(phrase, options)).toMatchObject({
      ok: false,
      engineVersion: 2,
      error: { message: expect.any(String), hint: expect.any(String) },
    });
  });
  it.each(["0.333333333 days", "0.0001 seconds"])(
    "rejects ambiguous or sub-millisecond precision: %s",
    (phrase) => {
      expect(calculateDate(phrase, options)).toMatchObject({
        ok: false,
        error: { code: "precision" },
      });
    },
  );
  it.each(["in 999999999 years", "today" + " ".repeat(200), "today " + "plus 1 day ".repeat(21)])(
    "bounds %s",
    (phrase) => {
      expect(calculateDate(phrase, options).ok).toBe(false);
    },
  );
  it("pinpoints unused input", () => {
    expect(calculateDate("today nonsense", options)).toMatchObject({
      ok: false,
      error: { span: { start: 6, end: 14 } },
    });
  });
  it("rejects invalid timezones and references", () => {
    expect(calculateDate("now", { ...options, timezone: "Bad/Zone" })).toMatchObject({
      ok: false,
      error: { code: "timezone" },
    });
    expect(calculateDate("now", { ...options, reference: "2026-01-26T12:00" })).toMatchObject({
      ok: false,
      error: { code: "reference" },
    });
    expect(
      calculateDate("now", { ...options, reference: "2026-01-26T12:00:00.0001Z" }),
    ).toMatchObject({ ok: false, error: { code: "reference" } });
  });
});

describe("Timezone and DST semantics", () => {
  it.each([
    ["America/Chicago", "2026-01-26T06:00:00.000Z"],
    ["Asia/Tokyo", "2026-01-26T15:00:00.000Z"],
    ["UTC", "2026-01-26T00:00:00.000Z"],
    ["Asia/Kathmandu", "2026-01-26T18:15:00.000Z"],
  ])("today uses %s", (timezone, expected) =>
    expect(result("today", { timezone, reference }).result.iso).toBe(expected),
  );
  it.each([
    ["2026-03-07T17:00:00Z", "in 1 day", "2026-03-08T16:00:00.000Z"],
    ["2026-03-07T17:00:00Z", "in 24 hours", "2026-03-08T17:00:00.000Z"],
    ["2026-10-31T16:00:00Z", "in 1 day", "2026-11-01T17:00:00.000Z"],
    ["2026-10-31T16:00:00Z", "in 24 hours", "2026-11-01T16:00:00.000Z"],
  ])("%s %s", (ref, phrase, expected) =>
    expect(result(phrase, { timezone: "America/New_York", reference: ref }).result.iso).toBe(
      expected,
    ),
  );
  it.each(["2026-03-08 at 02:30", "2026-11-01 at 01:30", "2026-03-07 at 02:30 plus 1 day"])(
    "rejects an ambiguous or skipped local time: %s",
    (phrase) => {
      expect(calculateDate(phrase, { ...options, timezone: "America/New_York" })).toMatchObject({
        ok: false,
        error: { code: "ambiguous-time" },
      });
    },
  );
  it("rejects a skipped calendar date", () =>
    expect(calculateDate("2011-12-30", { ...options, timezone: "Pacific/Apia" })).toMatchObject({
      ok: false,
      error: { code: "ambiguous-time" },
    }));
  it("retains a known instant in the repeated hour for a zero-day change", () => {
    expect(
      result("in 0 days", { timezone: "America/New_York", reference: "2026-11-01T06:30:00Z" })
        .result.iso,
    ).toBe("2026-11-01T06:30:00.000Z");
  });
});

it("covers every advertised example with an independent expected result", () => {
  const covered = new Set<string>(
    [...oracleCases, ...compatibilityCases].map(([phrase]) => phrase),
  );
  for (const phrase of Object.entries(examples)
    .filter(([category]) => category !== "Schedules")
    .flatMap(([, phrases]) => phrases))
    expect(covered.has(phrase), phrase).toBe(true);
});

it("keeps empty-state chips inside the advertised catalog", () => {
  const catalog = new Set(Object.values(examples).flat());
  expect(featuredExamples.length).toBeGreaterThanOrEqual(5);
  expect(featuredExamples.length).toBeLessThanOrEqual(8);
  expect(new Set(featuredExamples).size).toBe(featuredExamples.length);
  for (const phrase of featuredExamples) expect(catalog.has(phrase), phrase).toBe(true);
});

it("keeps timezone validation isolated across reuse and more than 64 zones", () => {
  const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
  const first = calculateDate("tomorrow at noon", context);
  for (const timezone of Intl.supportedValuesOf("timeZone").slice(0, 70)) {
    const result = calculateDate("now", { ...context, timezone });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.iso).toBe("2026-09-12T16:00:00.000Z");
  }
  expect(calculateDate("tomorrow at noon", context)).toEqual(first);
  for (const timezone of ["Invalid/Zone", "+05:00", "", "x".repeat(65)])
    expect(calculateDate("now", { ...context, timezone })).toMatchObject({
      ok: false,
      error: { code: "timezone" },
    });
  expect(
    calculateDate("tomorrow at noon", { ...context, reference: "2026-09-13T16:00:00Z" }),
  ).not.toEqual(first);
  expect(calculateDate("November 1, 2026 at 1:30 am", context)).toMatchObject({
    ok: false,
    error: { code: "ambiguous-time" },
  });
});

it("checks the advertised scheduling examples through the public interpreter", () => {
  expect(examples.Schedules).toEqual([
    "tomorrow from 2pm to 4pm",
    "every Monday at noon for 5 occurrences",
    "Call Sam tomorrow at noon",
  ]);
  expect(parse(examples.Schedules[0], options)).toMatchObject({
    status: "resolved",
    value: {
      kind: "interval",
      start: { result: { iso: "2026-01-27T20:00:00.000Z" } },
      end: { result: { iso: "2026-01-27T22:00:00.000Z" } },
    },
  });
  expect(parse(examples.Schedules[1], options)).toMatchObject({
    status: "resolved",
    value: {
      kind: "recurrence",
      occurrences: [
        { start: { result: { iso: "2026-02-02T18:00:00.000Z" } } },
        { start: { result: { iso: "2026-02-09T18:00:00.000Z" } } },
        { start: { result: { iso: "2026-02-16T18:00:00.000Z" } } },
      ],
    },
  });
  expect(parse(examples.Schedules[2], options)).toMatchObject({
    status: "resolved",
    event: { text: "Call Sam" },
    value: { kind: "point", calculation: { result: { iso: "2026-01-27T18:00:00.000Z" } } },
  });
});
