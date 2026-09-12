import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { debugDateParser, parseNaturalLanguageDate } from "./date-parser";
import { buildParseResponse } from "./parse-api";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 0, 26, 13, 30)); // Monday, local time
});
afterEach(() => vi.useRealTimers());

function dateParts(expression: string, preserveDayOfMonth = true) {
  const date = parseNaturalLanguageDate(expression, { preserveDayOfMonth });
  return (
    date && [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
    ]
  );
}

describe("Parser correctness audit", () => {
  it.each([
    ["1 month after jan 31 2026", [2026, 2, 28, 0, 0]],
    ["1 year after feb 29 2024", [2025, 2, 28, 0, 0]],
    ["next friday", [2026, 1, 30, 13, 30]],
    ["friday next week", [2026, 2, 6, 13, 30]],
    ["3 days before next friday", [2026, 1, 27, 13, 30]],
    ["2 days from today", [2026, 1, 28, 0, 0]],
    ["2 days before tomorrow", [2026, 1, 25, 0, 0]],
    ["in half a day", [2026, 1, 27, 1, 30]],
  ])("calculates %s exactly", (expression, expected) => {
    expect(dateParts(expression as string)).toEqual(expected);
  });

  it.each([
    "feb 30 2026",
    "jan 0",
    "jan 1.5",
    "today nonsense",
    "in",
    "in 3",
    "today plus",
    "2 days before",
    "today tomorrow",
    "in twenty one days",
    "1/0 days",
    "12/25/2026",
    "in 999999999 years",
    "last month",
  ])("rejects incomplete or unsupported input: %s", (expression) => {
    expect(parseNaturalLanguageDate(expression)).toBeNull();
    expect(buildParseResponse({ expression }).status).toBe(400);
  });

  it("records sorted operations and preserves each intermediate result", () => {
    const trace = debugDateParser("jan 30 2026 plus 2 days plus 1 month", {
      preserveDayOfMonth: true,
    });
    expect(trace.steps.map((s) => s.operation.unit)).toEqual(["month", "day"]);
    expect(trace.steps[0].after).toEqual(new Date(2026, 1, 28));
    expect(trace.steps[1].before).toEqual(trace.steps[0].after);
    expect(trace.result).toEqual(new Date(2026, 2, 2));
    expect(trace.steps[1].after).toEqual(trace.result);
  });

  it("debug and normal results agree for both month settings", () => {
    for (const preserveDayOfMonth of [true, false]) {
      const options = { preserveDayOfMonth };
      const input = "jan 31 2026 plus 1 month plus 1 month";
      expect(debugDateParser(input, options).result).toEqual(
        parseNaturalLanguageDate(input, options),
      );
    }
    expect(dateParts("jan 31 2026 plus 1 month plus 1 month", true)).toEqual([2026, 3, 31, 0, 0]);
    expect(dateParts("jan 31 2026 plus 1 month plus 1 month", false)).toEqual([2026, 3, 28, 0, 0]);
  });

  it("keeps fractional conversion visible in actual timestamps", () => {
    const trace = debugDateParser("today plus 1.5 days");
    expect(trace.steps[0].after.getTime() - trace.steps[0].before.getTime()).toBe(36 * 3600000);
  });
});

describe("Advertised examples", () => {
  it.each([
    ["now", [2026, 1, 26, 13, 30]],
    ["today", [2026, 1, 26, 0, 0]],
    ["tomorrow", [2026, 1, 27, 0, 0]],
    ["yesterday", [2026, 1, 25, 0, 0]],
    ["next friday", [2026, 1, 30, 13, 30]],
    ["last monday", [2026, 1, 19, 13, 30]],
    ["in 3 days", [2026, 1, 29, 13, 30]],
    ["2 weeks from now", [2026, 2, 9, 13, 30]],
    ["3 months ago", [2025, 10, 26, 13, 30]],
    ["1 year from now", [2027, 1, 26, 13, 30]],
    ["5 days ago", [2026, 1, 21, 13, 30]],
    ["today plus 2 weeks", [2026, 2, 9, 0, 0]],
    ["tomorrow minus 3 days", [2026, 1, 24, 0, 0]],
    ["2 weeks plus 3 days", [2026, 2, 12, 13, 30]],
    ["1 month minus 1 week", [2026, 2, 19, 13, 30]],
    ["6 months plus 2 weeks", [2026, 8, 9, 13, 30]],
    ["1.5 days from now", [2026, 1, 28, 1, 30]],
    ["2.5 weeks ago", [2026, 1, 9, 1, 30]],
    ["6.5 months from today", [2026, 8, 10, 0, 0]],
    ["0.5 years from now", [2026, 7, 26, 13, 30]],
    ["today plus 0.25 years", [2026, 4, 26, 0, 0]],
    ["6 months before sep 14", [2026, 3, 14, 0, 0]],
    ["2 weeks after dec 25", [2027, 1, 8, 0, 0]],
    ["3 days before next friday", [2026, 1, 27, 13, 30]],
    ["1 month after last monday", [2026, 2, 19, 13, 30]],
    ["2.5 weeks before may 1", [2026, 4, 13, 12, 0]],
    ["friday next week", [2026, 2, 6, 13, 30]],
  ])("produces the expected calendar result for %s", (expression, expected) => {
    expect(dateParts(expression as string)).toEqual(expected);
    const trace = debugDateParser(expression as string, { preserveDayOfMonth: true });
    expect(trace.result).toEqual(
      parseNaturalLanguageDate(expression as string, { preserveDayOfMonth: true }),
    );
    expect(
      buildParseResponse({ expression: expression as string, preserveDayOfMonth: "true" }).status,
    ).toBe(200);
  });
});

describe("Calendar and request boundaries", () => {
  it("uses calendar days across daylight saving changes", () => {
    for (const base of [new Date(2026, 2, 7, 12), new Date(2026, 9, 31, 12)]) {
      vi.setSystemTime(base);
      const calendar = parseNaturalLanguageDate("in 1 day")!;
      const elapsed = parseNaturalLanguageDate("in 24 hours")!;
      expect(calendar.getHours()).toBe(12);
      expect(calendar.getDate()).toBe(base.getDate() === 31 ? 1 : 8);
      expect(elapsed.getTime() - base.getTime()).toBe(24 * 3600000);
      expect(calendar.getTime() - base.getTime()).toBe(
        24 * 3600000 + (calendar.getTimezoneOffset() - base.getTimezoneOffset()) * 60000,
      );
    }
  });
  it("does not roll a bare day into an unrelated date", () => {
    vi.setSystemTime(new Date(2026, 1, 1, 12));
    expect(dateParts("31")).toEqual([2026, 3, 31, 0, 0]);
  });
  it("bounds direct parser input as well as HTTP input", () => {
    expect(parseNaturalLanguageDate("today" + " ".repeat(201))).toBeNull();
    expect(debugDateParser("today" + " ".repeat(201)).result).toBeNull();
  });
});

it("honors subtraction inside offsets before a reference date", () => {
  expect(dateParts("2 days minus 1 day before may 1")).toEqual([2026, 4, 30, 0, 0]);
});

it.each(["2 days before 31", "31 plus 2 days", "in 2 days ago"])(
  "rejects ambiguous numeric anchors or direction: %s",
  (expression) => {
    expect(parseNaturalLanguageDate(expression)).toBeNull();
  },
);

it("applies ago to the net relative offset", () => {
  expect(dateParts("2 days minus 1 day ago")).toEqual([2026, 1, 25, 13, 30]);
});
