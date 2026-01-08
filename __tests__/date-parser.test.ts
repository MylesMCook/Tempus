import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { debugDateParser, parseNaturalLanguageDate } from "@/app/lib/date-parser";

describe("DateExpressionParser", () => {
  beforeEach(() => {
    // Use fake timers and set a fixed date for consistent testing
    vi.useFakeTimers();
    // Set to Wednesday, January 15, 2025, 12:00:00 UTC
    vi.setSystemTime(new Date("2025-01-15T12:00:00.000Z"));

    // Mock localStorage
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("parseNaturalLanguageDate", () => {
    describe("relative dates", () => {
      it("should parse 'now' to current date and time", () => {
        const result = parseNaturalLanguageDate("now");
        expect(result).toBeInstanceOf(Date);
        expect(result?.toISOString()).toBe("2025-01-15T12:00:00.000Z");
      });

      it("should parse 'today' to start of current day", () => {
        const result = parseNaturalLanguageDate("today");
        expect(result).toBeInstanceOf(Date);
        // today returns midnight local time
        expect(result?.getFullYear()).toBe(2025);
        expect(result?.getMonth()).toBe(0); // January
        expect(result?.getDate()).toBe(15);
      });

      it("should parse 'yesterday' correctly", () => {
        const result = parseNaturalLanguageDate("yesterday");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getDate()).toBe(14);
      });

      it("should parse 'tomorrow' correctly", () => {
        const result = parseNaturalLanguageDate("tomorrow");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getDate()).toBe(16);
      });
    });

    describe("relative time expressions", () => {
      it("should parse 'in 3 days'", () => {
        const result = parseNaturalLanguageDate("in 3 days");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getDate()).toBe(18);
      });

      it("should parse '2 weeks from now'", () => {
        const result = parseNaturalLanguageDate("2 weeks from now");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getDate()).toBe(29);
      });

      it("should parse '3 days ago'", () => {
        const result = parseNaturalLanguageDate("3 days ago");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getDate()).toBe(12);
      });

      it("should parse '1 month ago'", () => {
        const result = parseNaturalLanguageDate("1 month ago");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getMonth()).toBe(11); // December
        expect(result?.getFullYear()).toBe(2024);
      });

      it("should parse '1 year from now'", () => {
        const result = parseNaturalLanguageDate("1 year from now");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getFullYear()).toBe(2026);
      });
    });

    describe("weekday expressions", () => {
      // Current date is Wednesday, January 15, 2025
      it("should parse 'next friday' as the Friday after next", () => {
        const result = parseNaturalLanguageDate("next friday");
        expect(result).toBeInstanceOf(Date);
        // Next Friday from Wed Jan 15 should be Jan 24 (skipping Jan 17)
        expect(result?.getDate()).toBe(24);
        expect(result?.getDay()).toBe(5); // Friday
      });

      it("should parse 'last monday' as the previous Monday", () => {
        const result = parseNaturalLanguageDate("last monday");
        expect(result).toBeInstanceOf(Date);
        // Last Monday from Wed Jan 15 should be Jan 13
        expect(result?.getDate()).toBe(13);
        expect(result?.getDay()).toBe(1); // Monday
      });

      it("should parse standalone weekday as upcoming occurrence", () => {
        const result = parseNaturalLanguageDate("friday");
        expect(result).toBeInstanceOf(Date);
        // The upcoming Friday from Wed Jan 15 should be Jan 17
        expect(result?.getDate()).toBe(17);
        expect(result?.getDay()).toBe(5); // Friday
      });
    });

    describe("date math expressions", () => {
      it("should parse 'today plus 2 weeks'", () => {
        const result = parseNaturalLanguageDate("today plus 2 weeks");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getDate()).toBe(29);
      });

      it("should parse 'tomorrow minus 3 days'", () => {
        const result = parseNaturalLanguageDate("tomorrow minus 3 days");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getDate()).toBe(13);
      });

      it("should parse compound operations like '2 weeks plus 3 days'", () => {
        const result = parseNaturalLanguageDate("2 weeks plus 3 days");
        expect(result).toBeInstanceOf(Date);
        // 2 weeks (14 days) + 3 days = 17 days from now
        // Jan 15 + 17 = Feb 1
        expect(result?.getDate()).toBe(1);
        expect(result?.getMonth()).toBe(1); // February
      });
    });

    describe("fractional time units", () => {
      it("should parse '1.5 days from now'", () => {
        const result = parseNaturalLanguageDate("1.5 days from now");
        expect(result).toBeInstanceOf(Date);
        // 1.5 days = 1 day + 12 hours
        // Starting at Jan 15 12:00, + 1.5 days = Jan 17 00:00
        expect(result?.getDate()).toBe(17);
        expect(result?.getHours()).toBe(0);
      });

      it("should parse '2.5 weeks from now'", () => {
        const result = parseNaturalLanguageDate("2.5 weeks from now");
        expect(result).toBeInstanceOf(Date);
        // 2.5 weeks = 17.5 days
        // Jan 15 + 17.5 days = Feb 2 (with some hours)
        expect(result?.getMonth()).toBe(1); // February
      });

      it("should parse 'half day from now'", () => {
        const result = parseNaturalLanguageDate("0.5 day from now");
        expect(result).toBeInstanceOf(Date);
        // 0.5 days = 12 hours
        // Starting at Jan 15 12:00, + 12 hours = Jan 16 00:00
        expect(result?.getDate()).toBe(16);
        expect(result?.getHours()).toBe(0);
      });
    });

    describe("advanced expressions with before/after", () => {
      it("should parse '6 months before sep 14'", () => {
        const result = parseNaturalLanguageDate("6 months before sep 14");
        expect(result).toBeInstanceOf(Date);
        // Sep 14 - 6 months = Mar 14
        expect(result?.getMonth()).toBe(2); // March
        expect(result?.getDate()).toBe(14);
      });

      it("should parse '2 weeks after dec 25'", () => {
        const result = parseNaturalLanguageDate("2 weeks after dec 25");
        expect(result).toBeInstanceOf(Date);
        // Dec 25 + 2 weeks = Jan 8
        expect(result?.getMonth()).toBe(0); // January
        expect(result?.getDate()).toBe(8);
      });

      it("should parse '3 days before next friday'", () => {
        const result = parseNaturalLanguageDate("3 days before next friday");
        expect(result).toBeInstanceOf(Date);
        // Next Friday from Jan 15 (Wed) = Jan 24
        // Jan 24 - 3 days = Jan 21
        expect(result?.getDate()).toBe(21);
      });
    });

    describe("word numbers", () => {
      it("should parse 'two days from now'", () => {
        const result = parseNaturalLanguageDate("two days from now");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getDate()).toBe(17);
      });

      it("should parse 'three weeks ago'", () => {
        const result = parseNaturalLanguageDate("three weeks ago");
        expect(result).toBeInstanceOf(Date);
        // Jan 15 - 21 days = Dec 25, 2024
        expect(result?.getMonth()).toBe(11); // December
        expect(result?.getDate()).toBe(25);
      });
    });

    describe("month and day expressions", () => {
      it("should parse 'may 1' correctly", () => {
        const result = parseNaturalLanguageDate("may 1");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getMonth()).toBe(4); // May
        expect(result?.getDate()).toBe(1);
      });

      it("should parse 'december 25' correctly", () => {
        const result = parseNaturalLanguageDate("december 25");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getMonth()).toBe(11); // December
        expect(result?.getDate()).toBe(25);
      });

      it("should parse abbreviated months like 'jan 1'", () => {
        const result = parseNaturalLanguageDate("jan 1");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getMonth()).toBe(0); // January
        expect(result?.getDate()).toBe(1);
      });
    });

    describe("time unit expressions", () => {
      it("should parse hours", () => {
        const result = parseNaturalLanguageDate("in 5 hours");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getHours()).toBe(17); // 12 + 5
      });

      it("should parse minutes", () => {
        const result = parseNaturalLanguageDate("in 30 minutes");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getMinutes()).toBe(30);
      });

      it("should parse seconds", () => {
        const result = parseNaturalLanguageDate("in 45 seconds");
        expect(result).toBeInstanceOf(Date);
        expect(result?.getSeconds()).toBe(45);
      });
    });

    describe("edge cases and error handling", () => {
      it("should return null for empty string", () => {
        const result = parseNaturalLanguageDate("");
        expect(result).toBeNull();
      });

      it("should return null for whitespace only", () => {
        const result = parseNaturalLanguageDate("   ");
        expect(result).toBeNull();
      });

      it("should return null for unrecognized input", () => {
        const result = parseNaturalLanguageDate("gibberish xyz");
        expect(result).toBeNull();
      });

      it("should handle null/undefined gracefully", () => {
        // @ts-expect-error - testing null input
        expect(parseNaturalLanguageDate(null)).toBeNull();
        // @ts-expect-error - testing undefined input
        expect(parseNaturalLanguageDate(undefined)).toBeNull();
      });

      it("should handle standalone day number", () => {
        const result = parseNaturalLanguageDate("20");
        expect(result).toBeInstanceOf(Date);
        // Day 20 this month (future)
        expect(result?.getDate()).toBe(20);
      });
    });

    describe("preserveDayOfMonth option", () => {
      it("should preserve day of month when option is true", () => {
        // Set date to Jan 15
        vi.setSystemTime(new Date("2025-01-15T12:00:00.000Z"));

        const result = parseNaturalLanguageDate("1 month from now", {
          preserveDayOfMonth: true,
        });
        expect(result).toBeInstanceOf(Date);
        expect(result?.getMonth()).toBe(1); // February
        expect(result?.getDate()).toBe(15); // Day preserved
      });

      it("should not preserve day of month when option is false", () => {
        // Set date to Jan 15
        vi.setSystemTime(new Date("2025-01-15T12:00:00.000Z"));

        const result = parseNaturalLanguageDate("1 month from now", {
          preserveDayOfMonth: false,
        });
        expect(result).toBeInstanceOf(Date);
        expect(result?.getMonth()).toBe(1); // February
      });
    });
  });

  describe("debugDateParser", () => {
    it("should return tokens, baseDate, operations, and result", () => {
      const result = debugDateParser("2 days from now");

      expect(result).toHaveProperty("tokens");
      expect(result).toHaveProperty("baseDate");
      expect(result).toHaveProperty("operations");
      expect(result).toHaveProperty("result");

      expect(Array.isArray(result.tokens)).toBe(true);
      expect(result.baseDate).toBeInstanceOf(Date);
      expect(Array.isArray(result.operations)).toBe(true);
      expect(result.result).toBeInstanceOf(Date);
    });

    it("should correctly tokenize input", () => {
      const result = debugDateParser("3 weeks ago");

      expect(result.tokens).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: "number", value: "3" }),
          expect.objectContaining({ type: "unit", value: "week" }),
          expect.objectContaining({ type: "modifier", value: "ago" }),
        ])
      );
    });

    it("should parse operations correctly", () => {
      const result = debugDateParser("2 weeks plus 3 days");

      expect(result.operations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ amount: 2, unit: "week", direction: 1 }),
          expect.objectContaining({ amount: 3, unit: "day", direction: 1 }),
        ])
      );
    });

    it("should return empty result for invalid input", () => {
      const result = debugDateParser("");

      expect(result.tokens).toEqual([]);
      expect(result.baseDate).toBeNull();
      expect(result.operations).toEqual([]);
      expect(result.result).toBeNull();
    });
  });
});
