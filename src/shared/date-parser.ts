import {
  addDays,
  addMonths,
  addYears,
  subDays,
  subMonths,
  subYears,
  nextFriday,
  nextMonday,
  nextSaturday,
  nextSunday,
  nextThursday,
  nextTuesday,
  nextWednesday,
  previousFriday,
  previousMonday,
  previousSaturday,
  previousSunday,
  previousThursday,
  previousTuesday,
  previousWednesday,
  setDate,
  getDaysInMonth,
  startOfWeek,
  addHours,
  subHours,
  addMinutes,
  subMinutes,
  addSeconds,
  subSeconds,
  addMilliseconds,
  subMilliseconds,
} from "date-fns";

interface Token {
  type:
    | "number"
    | "unit"
    | "modifier"
    | "relative"
    | "weekday"
    | "month"
    | "operator"
    | "text"
    | "ordinal";
  value: string;
}

interface TimeOperation {
  amount: number;
  unit: string;
  direction: 1 | -1;
}

export interface DebugParseResult {
  tokens: Token[];
  baseDate: Date | null;
  baseDescription?: string;
  operations: TimeOperation[];
  steps: { operation: TimeOperation; before: Date; after: Date }[];
  result: Date | null;
  error?: string;
}

// Get the setting from localStorage if available
function getPreserveDayOfMonthSetting(): boolean {
  if (typeof window === "undefined") return true;

  try {
    const settings = localStorage.getItem("parserSettings");
    if (settings) {
      const parsed = JSON.parse(settings);
      return typeof parsed?.preserveDayOfMonth === "boolean" ? parsed.preserveDayOfMonth : true;
    }
  } catch (e) {
    console.error("Error reading settings:", e);
  }

  return true; // Default to true if setting not found
}

// Constants for time conversions
const DAYS_PER_MONTH = 30.436875; // Average days per month
const DAYS_PER_YEAR = 365.25; // Average days per year including leap years
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;

class DateExpressionParser {
  private now = new Date();
  private baseDescription = "";
  // Add this property to the class
  private preserveDayOfMonthOverride: boolean | null = null;

  // Add this method to the class
  setPreserveDayOfMonth(value: boolean): void {
    this.preserveDayOfMonthOverride = value;
  }

  // Update the getPreserveDayOfMonth method to use the override if set
  private getPreserveDayOfMonth(): boolean {
    if (this.preserveDayOfMonthOverride !== null) {
      return this.preserveDayOfMonthOverride;
    }
    return getPreserveDayOfMonthSetting();
  }

  private readonly monthMap: Record<string, number> = {
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12,
  };

  private readonly weekdayMap: Record<string, (date: Date) => Date> = {
    sunday: nextSunday,
    monday: nextMonday,
    tuesday: nextTuesday,
    wednesday: nextWednesday,
    thursday: nextThursday,
    friday: nextFriday,
    saturday: nextSaturday,
  };

  private readonly previousWeekdayMap: Record<string, (date: Date) => Date> = {
    sunday: previousSunday,
    monday: previousMonday,
    tuesday: previousTuesday,
    wednesday: previousWednesday,
    thursday: previousThursday,
    friday: previousFriday,
    saturday: previousSaturday,
  };

  private readonly numberWords: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
    hundred: 100,
    thousand: 1000,
    million: 1000000,
    half: 0.5,
    quarter: 0.25,
  };

  private parseReferenceDate(tokens: Token[]): Date | null {
    // Find the month token
    const monthToken = tokens.find((t) => t.type === "month");
    if (!monthToken) return null;

    // Find the month index to look for day and year tokens
    const monthIndex = tokens.findIndex((t) => t.type === "month");
    const dayToken = tokens[monthIndex + 1];
    const yearToken = tokens[monthIndex + 2];

    // Validate day token
    if (!dayToken || dayToken.type !== "number") return null;

    const month = this.monthMap[monthToken.value];
    const day = Number.parseFloat(dayToken.value);

    // Check for year token, if not found use current year
    const year =
      yearToken && yearToken.type === "number"
        ? Number.parseFloat(yearToken.value)
        : new Date(this.now).getFullYear();

    if (!month || !Number.isInteger(day) || !Number.isInteger(year) || day < 1 || day > 31)
      return null;
    const result = new Date(0);
    result.setFullYear(year, month - 1, day);
    result.setHours(0, 0, 0, 0);
    return result.getFullYear() === year &&
      result.getMonth() === month - 1 &&
      result.getDate() === day
      ? result
      : null;
  }

  private getRelativeDate(input: string): Date | null {
    const now = new Date(this.now);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (input.toLowerCase()) {
      case "now":
        return now; // Return current date and time
      case "today":
        return today;
      case "yesterday":
        return subDays(today, 1);
      case "tomorrow":
        return addDays(today, 1);
      default:
        return null;
    }
  }

  private getNextWeekday(weekday: string, baseDate: Date = new Date(this.now)): Date {
    const weekdayFn = this.weekdayMap[weekday];
    if (!weekdayFn) return baseDate;

    return weekdayFn(baseDate);
  }

  private getPreviousWeekday(weekday: string, baseDate: Date = new Date(this.now)): Date {
    const weekdayFn = this.previousWeekdayMap[weekday];
    if (!weekdayFn) return baseDate;

    // Get the previous occurrence of the weekday
    let prevDate = weekdayFn(baseDate);

    // If the previous occurrence is today, we need to go back one more week
    // to get to "last" weekday
    const daysDiff = Math.ceil((baseDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 0) {
      prevDate = subDays(prevDate, 7);
    }

    return prevDate;
  }

  private tokenize(input: string): Token[] {
    if (!input?.trim()) return [];

    const processed = input
      .toLowerCase()
      // Replace word numbers with their numeric values
      .replace(
        /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|half|quarter)\b/g,
        (match) => this.numberWords[match]?.toString() || match,
      )
      .replace(/\b(0\.5|0\.25) a (?=day|week|month|year|hour|minute|second)/g, "$1 ")
      // Handle fractions like "1/2" or "1/4"
      .replace(/(\d+)\/(\d+)/g, (_, numerator, denominator) => {
        return (Number.parseFloat(numerator) / Number.parseFloat(denominator)).toString();
      })
      .replace(/(\d+)(st|nd|rd|th)/g, (_, num) => num)
      .replace(/[,;]/g, " ")
      .replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/g, (_, month, day, year) => `${month} ${day} ${year}`)
      .replace(/(\d{1,2})-(\d{1,2})-(\d{4})/g, "$1 $2 $3")
      .replace(/\+/g, " plus ")
      .replace(/-/g, " minus ")
      .trim()
      .replace(/\s+/g, " ");

    const tokens = processed
      .split(" ")
      .filter(Boolean)
      .map((word): Token => {
        // Match both integer and decimal numbers
        if (/^-?\d+(\.\d+)?$/.test(word)) {
          return { type: "number", value: word };
        }
        if (/^(days?|weeks?|months?|years?|hours?|minutes?|seconds?)$/.test(word)) {
          return { type: "unit", value: word.replace(/s$/, "") };
        }
        if (
          ["minus", "from", "plus", "in", "and", "before", "after", "ago", "next", "last"].includes(
            word,
          )
        ) {
          return { type: "modifier", value: word };
        }
        if (["now", "today", "yesterday", "tomorrow"].includes(word)) {
          return { type: "relative", value: word };
        }
        if (Object.keys(this.weekdayMap).includes(word)) {
          return { type: "weekday", value: word };
        }
        if (this.monthMap[word]) {
          return { type: "month", value: word };
        }
        return { type: "text", value: word };
      });

    return tokens;
  }

  private isSupportedExpression(tokens: Token[]): boolean {
    const phrase = tokens.map((token) => token.value).join(" ");
    const number = String.raw`\d+(?:\.\d+)?`;
    const weekdays = Object.keys(this.weekdayMap).join("|");
    const months = Object.keys(this.monthMap).join("|");
    const anchor = `(?:now|today|tomorrow|yesterday|(?:(?:next|last) )?(?:${weekdays})|(?:${weekdays}) (?:next|last) week|(?:${months}) \\d+(?: \\d+)?)`;
    const amount = `${number} (?:year|month|week|day|hour|minute|second)`;
    const offsets = `${amount}(?: (?:plus|minus|and) ${amount})*`;
    return new RegExp(
      `^(?:\\d+|${anchor}|${anchor} (?:plus|minus) ${offsets}|in ${offsets}|${offsets}(?: ago)?|${offsets} (?:before|after|from) ${anchor})$`,
    ).test(phrase);
  }

  private findBaseDate(tokens: Token[]): Date | null {
    // Check for reference date patterns (e.g., "may 1")
    const monthIndex = tokens.findIndex((t) => t.type === "month");
    if (monthIndex !== -1 && tokens[monthIndex + 1]?.type === "number") {
      this.baseDescription = "Use the named calendar date; an omitted year means the current year.";
      return this.parseReferenceDate(tokens);
    }

    const weekdayIndex = tokens.findIndex((t) => t.type === "weekday");
    if (weekdayIndex !== -1) {
      const nextIndex = tokens.findIndex((t) => t.value === "next");
      const lastWeekdayIndex = tokens.findIndex((t) => t.value === "last");
      const weekday = tokens[weekdayIndex].value;

      const weekModifier = tokens[weekdayIndex + 1]?.value;
      if (
        (weekModifier === "next" || weekModifier === "last") &&
        tokens[weekdayIndex + 2]?.value === "week"
      ) {
        this.baseDescription = `Find ${weekday} in ${weekModifier} week, with Monday as the start of the week. Keep the current time.`;
        const monday = startOfWeek(new Date(this.now), { weekStartsOn: 1 });
        const weekdayNumber = Object.keys(this.weekdayMap).indexOf(weekday);
        const target = addDays(
          monday,
          (weekModifier === "next" ? 7 : -7) + ((weekdayNumber + 6) % 7),
        );
        const now = new Date(this.now);
        target.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
        return target;
      }

      // Handle "last" weekday first as it's more specific
      if (lastWeekdayIndex !== -1 && lastWeekdayIndex < weekdayIndex) {
        this.baseDescription = `Find the most recent ${weekday} before today. Keep the current time.`;
        const prevDate = this.getPreviousWeekday(weekday);
        return prevDate;
      } else if (nextIndex !== -1 && nextIndex < weekdayIndex) {
        // "Next" means the nearest future occurrence, excluding today.
        this.baseDescription = `Find the nearest ${weekday} after today. Keep the current time.`;
        const nextOccurrence = this.getNextWeekday(weekday);
        return nextOccurrence;
      } else {
        this.baseDescription = `Find the nearest ${weekday} after today. Keep the current time.`;
        // If no modifier, treat as upcoming occurrence (this week or next)
        const now = new Date(this.now);
        const weekdayFn = this.weekdayMap[weekday];
        if (!weekdayFn) return now;
        return weekdayFn(now);
      }
    }

    const relativeAnchor = tokens.find((token) => token.type === "relative");
    if (relativeAnchor) {
      this.baseDescription =
        relativeAnchor.value === "now"
          ? "Capture the current date and time."
          : `Use midnight at the start of ${relativeAnchor.value}.`;
      return this.getRelativeDate(relativeAnchor.value);
    }

    // Handle other cases
    const firstToken = tokens[0];
    if (firstToken?.type === "number") {
      // If it's just a number with no unit, we should interpret it as a day of the current month
      if (tokens.length === 1) {
        const now = new Date(this.now);
        const day = Number.parseFloat(firstToken.value);

        // Validate the day number
        if (!Number.isInteger(day) || day < 1 || day > 31) return null;

        this.baseDescription = `Find the next valid occurrence of day ${day}, at midnight.`;
        let result = new Date(now.getFullYear(), now.getMonth(), day);
        let monthOffset = 0;
        while (result < now || result.getDate() !== day) {
          monthOffset += 1;
          result = new Date(now.getFullYear(), now.getMonth() + monthOffset, day);
        }

        return result;
      }

      // Otherwise, use current date as base for operations
      this.baseDescription = "Start at the current date and time.";
      return new Date(this.now);
    }

    // Only validated offset expressions reach this fallback.
    this.baseDescription = "Start at the current date and time.";
    return new Date(this.now);
  }

  private preserveDateOfMonth(originalDate: Date, newDate: Date): Date {
    // Check if we should preserve the day of month based on settings
    if (!this.getPreserveDayOfMonth()) {
      return newDate;
    }

    // Get the original day of month
    const originalDay = originalDate.getDate();

    // Create a new date with the same day of month
    return setDate(newDate, Math.min(originalDay, getDaysInMonth(newDate)));
  }

  private parseTimeOperations(tokens: Token[]): TimeOperation[] {
    const operations: TimeOperation[] = [];
    let currentAmount: number | null = null;

    // Handle "X units before/after" patterns
    const beforeIndex = tokens.findIndex((t) => t.value === "before");
    const afterIndex = tokens.findIndex((t) => t.value === "after");

    if (beforeIndex !== -1 || afterIndex !== -1) {
      const direction: TimeOperation["direction"] = beforeIndex !== -1 ? -1 : 1;
      const splitIndex = beforeIndex !== -1 ? beforeIndex : afterIndex;
      const relevantTokens = tokens.slice(0, splitIndex);
      let operationDirection = direction;

      // Process all number-unit pairs before the before/after token
      for (let i = 0; i < relevantTokens.length; i++) {
        const token = relevantTokens[i];
        if (token.value === "minus") {
          operationDirection = direction === 1 ? -1 : 1;
        } else if (token.value === "plus" || token.value === "and") {
          operationDirection = direction;
        } else if (token.type === "number") {
          currentAmount = Number.parseFloat(token.value);
        } else if (token.type === "unit" && currentAmount !== null) {
          operations.push({
            amount: currentAmount,
            unit: token.value,
            direction: operationDirection,
          });
          currentAmount = null;
        }
      }

      return operations;
    }

    // Handle other patterns
    const defaultDirection: TimeOperation["direction"] = tokens.some((t) => t.value === "ago")
      ? -1
      : 1;
    let currentDirection: TimeOperation["direction"] = defaultDirection;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.value === "minus") {
        currentDirection = defaultDirection === 1 ? -1 : 1;
        continue;
      }
      if (token.value === "plus") {
        currentDirection = defaultDirection;
        continue;
      }
      if (token.type === "number") {
        currentAmount = Number.parseFloat(token.value);
        continue;
      }
      if (token.type === "unit" && currentAmount !== null) {
        operations.push({
          amount: currentAmount,
          unit: token.value,
          direction: currentDirection,
        });
        currentAmount = null;
        currentDirection = defaultDirection;
      }
    }

    return operations;
  }

  private applyOperations(
    baseDate: Date,
    operations: TimeOperation[],
    steps?: DebugParseResult["steps"],
  ): Date {
    let result = new Date(baseDate);

    // Sort operations to apply years first, then months, weeks, and days
    const sortOrder = { year: 0, month: 1, week: 2, day: 3, hour: 4, minute: 5, second: 6 };
    const sortedOperations = [...operations].sort(
      (a, b) =>
        sortOrder[a.unit as keyof typeof sortOrder] - sortOrder[b.unit as keyof typeof sortOrder],
    );

    for (const op of sortedOperations) {
      const before = new Date(result);
      // Handle fractional values by splitting into whole and fractional parts
      const wholePart = Math.floor(op.amount);
      const fractionalPart = op.amount - wholePart;

      switch (op.unit) {
        case "day": {
          // For days, apply the whole part first
          if (wholePart > 0) {
            result = op.direction === 1 ? addDays(result, wholePart) : subDays(result, wholePart);
          }

          // Then handle the fractional part as hours
          if (fractionalPart > 0) {
            const hours = Math.round(fractionalPart * HOURS_PER_DAY);
            result = op.direction === 1 ? addHours(result, hours) : subHours(result, hours);
          }
          break;
        }
        case "week": {
          // For weeks, convert to days
          const totalDays = op.amount * 7;
          const wholeDays = Math.floor(totalDays);
          const fractionalDay = totalDays - wholeDays;

          // Apply whole days
          if (wholeDays > 0) {
            result = op.direction === 1 ? addDays(result, wholeDays) : subDays(result, wholeDays);
          }

          // Apply fractional day as hours
          if (fractionalDay > 0) {
            const hours = Math.round(fractionalDay * HOURS_PER_DAY);
            result = op.direction === 1 ? addHours(result, hours) : subHours(result, hours);
          }
          break;
        }
        case "month": {
          // For months, apply the whole part first
          if (wholePart > 0) {
            // Convert whole months to years if possible
            if (wholePart >= 12) {
              const years = Math.floor(wholePart / 12);
              const remainingMonths = wholePart % 12;

              // Add/subtract years
              result = op.direction === 1 ? addYears(result, years) : subYears(result, years);

              // Add/subtract remaining months
              if (remainingMonths > 0) {
                const monthResult =
                  op.direction === 1
                    ? addMonths(result, remainingMonths)
                    : subMonths(result, remainingMonths);
                result = this.preserveDateOfMonth(baseDate, monthResult);
              }
            } else {
              // For smaller number of months
              const monthResult =
                op.direction === 1 ? addMonths(result, wholePart) : subMonths(result, wholePart);
              result = this.preserveDateOfMonth(baseDate, monthResult);
            }
          }

          // Handle fractional part of months as days
          if (fractionalPart > 0) {
            const days = Math.round(fractionalPart * DAYS_PER_MONTH);
            result = op.direction === 1 ? addDays(result, days) : subDays(result, days);
          }
          break;
        }
        case "year": {
          // For years, apply the whole part first
          if (wholePart > 0) {
            result = op.direction === 1 ? addYears(result, wholePart) : subYears(result, wholePart);
            // Preserve day of month for whole years
            result = this.preserveDateOfMonth(baseDate, result);
          }

          // Handle fractional part of years as months and days
          if (fractionalPart > 0) {
            // Convert fractional years to months
            const months = Math.floor(fractionalPart * 12);
            const remainingFraction = fractionalPart - months / 12;

            // Apply months
            if (months > 0) {
              const monthResult =
                op.direction === 1 ? addMonths(result, months) : subMonths(result, months);
              result = this.preserveDateOfMonth(baseDate, monthResult);
            }

            // Apply remaining fraction as days
            if (remainingFraction > 0) {
              const days = Math.round(remainingFraction * DAYS_PER_YEAR);
              result = op.direction === 1 ? addDays(result, days) : subDays(result, days);
            }
          }
          break;
        }
        case "hour": {
          // For hours, apply the whole part first
          if (wholePart > 0) {
            result = op.direction === 1 ? addHours(result, wholePart) : subHours(result, wholePart);
          }

          // Then handle the fractional part as minutes
          if (fractionalPart > 0) {
            const minutes = Math.round(fractionalPart * MINUTES_PER_HOUR);
            result = op.direction === 1 ? addMinutes(result, minutes) : subMinutes(result, minutes);
          }
          break;
        }
        case "minute": {
          // For minutes, apply the whole part first
          if (wholePart > 0) {
            result =
              op.direction === 1 ? addMinutes(result, wholePart) : subMinutes(result, wholePart);
          }

          // Then handle the fractional part as seconds
          if (fractionalPart > 0) {
            const seconds = Math.round(fractionalPart * SECONDS_PER_MINUTE);
            result = op.direction === 1 ? addSeconds(result, seconds) : subSeconds(result, seconds);
          }
          break;
        }
        case "second": {
          // For seconds, apply the whole part first
          if (wholePart > 0) {
            result =
              op.direction === 1 ? addSeconds(result, wholePart) : subSeconds(result, wholePart);
          }

          // Then handle the fractional part as milliseconds
          if (fractionalPart > 0) {
            const milliseconds = Math.round(fractionalPart * 1000);
            result =
              op.direction === 1
                ? addMilliseconds(result, milliseconds)
                : subMilliseconds(result, milliseconds);
          }
          break;
        }
      }
      steps?.push({ operation: op, before, after: new Date(result) });
    }

    return result;
  }

  parse = (input: string): Date | null => {
    this.now = new Date();
    this.baseDescription = "";
    try {
      if (!input?.trim() || input.length > 200) return null;

      const tokens = this.tokenize(input);
      if (!tokens.length || !this.isSupportedExpression(tokens)) return null;

      const baseDate = this.findBaseDate(tokens);
      if (!baseDate) {
        return null;
      }

      const operations = this.parseTimeOperations(tokens);
      const result = this.applyOperations(baseDate, operations);

      return Number.isFinite(result.getTime()) ? result : null;
    } catch (error) {
      console.error("Error parsing date expression:", error);
      return null;
    }
  };

  // Expose internal methods for debugging
  debug = (input: string): DebugParseResult => {
    this.now = new Date();
    this.baseDescription = "";
    try {
      if (!input?.trim())
        return { tokens: [], baseDate: null, operations: [], steps: [], result: null };

      const tokens = this.tokenize(input);
      if (input.length > 200 || !tokens.length || !this.isSupportedExpression(tokens))
        return {
          tokens,
          baseDate: null,
          operations: [],
          steps: [],
          result: null,
          error: "This phrase is incomplete or unsupported.",
        };

      const baseDate = this.findBaseDate(tokens);
      if (!baseDate) return { tokens, baseDate: null, operations: [], steps: [], result: null };

      const operations = this.parseTimeOperations(tokens);
      const steps: DebugParseResult["steps"] = [];
      const result = this.applyOperations(baseDate, operations, steps);

      return {
        tokens,
        baseDate,
        baseDescription: this.baseDescription,
        operations,
        steps,
        result: Number.isFinite(result.getTime()) ? result : null,
        ...(!Number.isFinite(result.getTime())
          ? { error: "The result is outside the supported date range." }
          : {}),
      };
    } catch (error) {
      console.error("Error in debug:", error);
      return {
        tokens: [],
        baseDate: null,
        operations: [],
        steps: [],
        result: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };
}

const parser = new DateExpressionParser();

// Update the parseNaturalLanguageDate function to accept options
export const parseNaturalLanguageDate = (
  expression: string,
  options?: { preserveDayOfMonth?: boolean },
) => {
  // Override the preserveDayOfMonth setting if provided in options
  if (options?.preserveDayOfMonth !== undefined) {
    // Create a custom parser instance with the provided setting
    const customParser = new DateExpressionParser();
    customParser.setPreserveDayOfMonth(options.preserveDayOfMonth);

    // Parse with custom settings
    return customParser.parse(expression);
  }

  // Use default parser with settings from localStorage
  return parser.parse(expression);
};

export const debugDateParser = (
  expression: string,
  options?: { preserveDayOfMonth?: boolean },
): DebugParseResult => {
  if (options?.preserveDayOfMonth !== undefined) {
    const customParser = new DateExpressionParser();
    customParser.setPreserveDayOfMonth(options.preserveDayOfMonth);
    return customParser.debug(expression);
  }
  return parser.debug(expression);
};
