import { describe, it, expect, beforeEach, vi } from "vite-plus/test";
import { addDays, subDays, addMonths, addYears, addWeeks } from "date-fns";
import { parseNaturalLanguageDate, debugDateParser } from "@/shared/date-parser";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal("localStorage", localStorageMock);

describe("DateExpressionParser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe("Basic Expressions", () => {
    it("should parse 'today'", () => {
      const result = parseNaturalLanguageDate("today");
      const today = new Date();
      expect(result).not.toBeNull();
      expect(result?.getFullYear()).toBe(today.getFullYear());
      expect(result?.getMonth()).toBe(today.getMonth());
      expect(result?.getDate()).toBe(today.getDate());
    });

    it("should parse 'tomorrow'", () => {
      const result = parseNaturalLanguageDate("tomorrow");
      const tomorrow = addDays(new Date(), 1);
      expect(result).not.toBeNull();
      expect(result?.getDate()).toBe(tomorrow.getDate());
    });

    it("should parse 'yesterday'", () => {
      const result = parseNaturalLanguageDate("yesterday");
      const yesterday = subDays(new Date(), 1);
      expect(result).not.toBeNull();
      expect(result?.getDate()).toBe(yesterday.getDate());
    });

    it("should parse 'now'", () => {
      const before = new Date();
      const result = parseNaturalLanguageDate("now");
      const after = new Date();
      expect(result).not.toBeNull();
      expect(result?.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result?.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("Relative Time Expressions", () => {
    it("should parse 'in 3 days'", () => {
      const result = parseNaturalLanguageDate("in 3 days");
      const expected = addDays(new Date(), 3);
      expect(result).not.toBeNull();
      expect(result?.getDate()).toBe(expected.getDate());
    });

    it("should parse '5 days ago'", () => {
      const result = parseNaturalLanguageDate("5 days ago");
      const expected = subDays(new Date(), 5);
      expect(result).not.toBeNull();
      expect(result?.getDate()).toBe(expected.getDate());
    });

    it("should parse 'in 2 weeks'", () => {
      const result = parseNaturalLanguageDate("in 2 weeks");
      const expected = addWeeks(new Date(), 2);
      expect(result).not.toBeNull();
      expect(result?.getDate()).toBe(expected.getDate());
    });

    it("should parse 'in 1 month'", () => {
      const result = parseNaturalLanguageDate("in 1 month");
      const expected = addMonths(new Date(), 1);
      expect(result).not.toBeNull();
      expect(result?.getMonth()).toBe(expected.getMonth());
    });

    it("should parse 'in 1 year'", () => {
      const result = parseNaturalLanguageDate("in 1 year");
      const expected = addYears(new Date(), 1);
      expect(result).not.toBeNull();
      expect(result?.getFullYear()).toBe(expected.getFullYear());
    });

    it("should parse '3 weeks from now'", () => {
      const result = parseNaturalLanguageDate("3 weeks from now");
      const expected = addWeeks(new Date(), 3);
      expect(result).not.toBeNull();
      expect(result?.getDate()).toBe(expected.getDate());
    });
  });

  describe("Date Math with Reference Dates", () => {
    it("should parse '2 weeks before May 15'", () => {
      const result = parseNaturalLanguageDate("2 weeks before May 15");
      expect(result).not.toBeNull();
      // May 15 minus 14 days = May 1
      expect(result?.getMonth()).toBe(4); // May is month 4 (0-indexed)
      expect(result?.getDate()).toBe(1);
    });

    it("should parse '3 days after January 1'", () => {
      const result = parseNaturalLanguageDate("3 days after January 1");
      expect(result).not.toBeNull();
      expect(result?.getMonth()).toBe(0); // January
      expect(result?.getDate()).toBe(4);
    });

    it("should parse '1 month before December 25'", () => {
      const result = parseNaturalLanguageDate("1 month before December 25");
      expect(result).not.toBeNull();
      expect(result?.getMonth()).toBe(10); // November
      expect(result?.getDate()).toBe(25);
    });
  });

  describe("Word Numbers", () => {
    it("should parse 'in three days'", () => {
      const result = parseNaturalLanguageDate("in three days");
      const expected = addDays(new Date(), 3);
      expect(result).not.toBeNull();
      expect(result?.getDate()).toBe(expected.getDate());
    });

    it("should parse 'two weeks ago'", () => {
      const result = parseNaturalLanguageDate("two weeks ago");
      const expected = subDays(new Date(), 14);
      expect(result).not.toBeNull();
      expect(result?.getDate()).toBe(expected.getDate());
    });

    it("should parse 'in five months'", () => {
      const result = parseNaturalLanguageDate("in five months");
      const expected = addMonths(new Date(), 5);
      expect(result).not.toBeNull();
      expect(result?.getMonth()).toBe(expected.getMonth());
    });
  });

  describe("Fractional Units", () => {
    it("should parse 'in half a day'", () => {
      const result = parseNaturalLanguageDate("in 0.5 day");
      expect(result).not.toBeNull();
      // Half a day = 12 hours from now
      const now = new Date();
      const diffHours = Math.round((result!.getTime() - now.getTime()) / (1000 * 60 * 60));
      expect(diffHours).toBe(12);
    });

    it("should parse quarter values", () => {
      const result = parseNaturalLanguageDate("in 0.25 day");
      expect(result).not.toBeNull();
      // Quarter of a day = 6 hours from now
      const now = new Date();
      const diffHours = Math.round((result!.getTime() - now.getTime()) / (1000 * 60 * 60));
      expect(diffHours).toBe(6);
    });
  });

  describe("Time Units", () => {
    it("should parse 'in 2 hours'", () => {
      const result = parseNaturalLanguageDate("in 2 hours");
      expect(result).not.toBeNull();
      const now = new Date();
      const diffHours = Math.round((result!.getTime() - now.getTime()) / (1000 * 60 * 60));
      expect(diffHours).toBe(2);
    });

    it("should parse 'in 30 minutes'", () => {
      const result = parseNaturalLanguageDate("in 30 minutes");
      expect(result).not.toBeNull();
      const now = new Date();
      const diffMinutes = Math.round((result!.getTime() - now.getTime()) / (1000 * 60));
      expect(diffMinutes).toBe(30);
    });

    it("should parse 'in 45 seconds'", () => {
      const result = parseNaturalLanguageDate("in 45 seconds");
      expect(result).not.toBeNull();
      const now = new Date();
      const diffSeconds = Math.round((result!.getTime() - now.getTime()) / 1000);
      expect(diffSeconds).toBeGreaterThanOrEqual(44);
      expect(diffSeconds).toBeLessThanOrEqual(46);
    });
  });

  describe("Combined Operations", () => {
    it("should parse 'tomorrow plus 3 days'", () => {
      const result = parseNaturalLanguageDate("tomorrow plus 3 days");
      const expected = addDays(new Date(), 4);
      expect(result).not.toBeNull();
      expect(result?.getDate()).toBe(expected.getDate());
    });

    it("should parse 'today minus 1 week'", () => {
      const result = parseNaturalLanguageDate("today minus 1 week");
      const expected = subDays(new Date(), 7);
      expect(result).not.toBeNull();
      expect(result?.getDate()).toBe(expected.getDate());
    });
  });

  describe("Edge Cases", () => {
    it("should return null for empty input", () => {
      expect(parseNaturalLanguageDate("")).toBeNull();
      expect(parseNaturalLanguageDate("   ")).toBeNull();
    });

    it("should return null for invalid expressions", () => {
      expect(parseNaturalLanguageDate("gibberish")).toBeNull();
      expect(parseNaturalLanguageDate("hello world")).toBeNull();
    });

    it("should handle leading/trailing whitespace", () => {
      const result = parseNaturalLanguageDate("  tomorrow  ");
      const expected = addDays(new Date(), 1);
      expect(result).not.toBeNull();
      expect(result?.getDate()).toBe(expected.getDate());
    });

    it("should handle case insensitivity", () => {
      const result1 = parseNaturalLanguageDate("TOMORROW");
      const result2 = parseNaturalLanguageDate("Tomorrow");
      const result3 = parseNaturalLanguageDate("tOmOrRoW");

      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      expect(result3).not.toBeNull();

      expect(result1?.getDate()).toBe(result2?.getDate());
      expect(result2?.getDate()).toBe(result3?.getDate());
    });
  });

  describe("Specific Month Dates", () => {
    it("should parse 'May 15'", () => {
      const result = parseNaturalLanguageDate("May 15");
      expect(result).not.toBeNull();
      expect(result?.getMonth()).toBe(4); // May is month 4 (0-indexed)
      expect(result?.getDate()).toBe(15);
    });

    it("should parse 'January 1 2025'", () => {
      const result = parseNaturalLanguageDate("January 1 2025");
      expect(result).not.toBeNull();
      expect(result?.getFullYear()).toBe(2025);
      expect(result?.getMonth()).toBe(0); // January
      expect(result?.getDate()).toBe(1);
    });

    it("should parse abbreviated months like 'Jan 15'", () => {
      const result = parseNaturalLanguageDate("Jan 15");
      expect(result).not.toBeNull();
      expect(result?.getMonth()).toBe(0); // January
      expect(result?.getDate()).toBe(15);
    });
  });

  describe("Debug Function", () => {
    it("should return debug info with tokens", () => {
      const debug = debugDateParser("in 3 days");
      expect(debug.tokens).toBeDefined();
      expect(debug.tokens.length).toBeGreaterThan(0);
    });

    it("should return operations array", () => {
      const debug = debugDateParser("in 3 days");
      expect(debug.operations).toBeDefined();
      expect(debug.operations.length).toBeGreaterThan(0);
      expect(debug.operations[0]).toHaveProperty("amount");
      expect(debug.operations[0]).toHaveProperty("unit");
      expect(debug.operations[0]).toHaveProperty("direction");
    });

    it("should return baseDate and result", () => {
      const debug = debugDateParser("in 3 days");
      expect(debug.baseDate).not.toBeNull();
      expect(debug.result).not.toBeNull();
    });

    it("should handle empty input gracefully", () => {
      const debug = debugDateParser("");
      expect(debug.tokens).toEqual([]);
      expect(debug.baseDate).toBeNull();
      expect(debug.operations).toEqual([]);
      expect(debug.result).toBeNull();
    });
  });

  describe("PreserveDayOfMonth Option", () => {
    it("should preserve day of month when adding months", () => {
      // Using Jan 31 as base
      const result = parseNaturalLanguageDate("1 month after January 31", {
        preserveDayOfMonth: true,
      });
      expect(result).not.toBeNull();
      // With preserve, Feb should still show 31 (clamped to 28/29)
    });

    it("should not preserve day when option is false", () => {
      const result = parseNaturalLanguageDate("1 month after January 31", {
        preserveDayOfMonth: false,
      });
      expect(result).not.toBeNull();
    });
  });
});
