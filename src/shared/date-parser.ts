import {
  AmbiguousLocalTime,
  zonedLocal,
  zonedInstant,
  type ZonedDate,
} from "./date-engine/zoned-date.js";
import { TimezoneDataUnavailable } from "./date-engine/timezone-database.js";
import { Temporal } from "@js-temporal/polyfill";
import { parseExpression } from "./date-engine/grammar.js";
import {
  CalculationFailure,
  fail,
  type Anchor,
  type Calculation,
  type DateSnapshot,
  type Operation,
  type CalculationStep,
} from "./date-engine/types.js";
export type {
  Calculation,
  CalculationSuccess,
  CalculationStep,
  DateSnapshot,
} from "./date-engine/types.js";

const DAY_MS = 86_400_000n;
const elapsedFactors = {
  hour: 3_600_000n,
  minute: 60_000n,
  second: 1000n,
  millisecond: 1n,
} as const;
const weekdayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function snapshot(date: ZonedDate): DateSnapshot {
  if (date.year < 1 || date.year > 9999)
    fail(
      "range",
      "The result is outside the supported date range.",
      "Use dates between years 0001 and 9999.",
    );
  return {
    iso: date.toInstant().toString({ smallestUnit: "millisecond" }),
    local: date.toPlainDateTime().toString({ smallestUnit: "millisecond" }),
    offset: date.offset,
    timestamp: date.epochMilliseconds,
  };
}

function zoned(local: Temporal.PlainDateTime, timezone: string): ZonedDate {
  try {
    return zonedLocal(local, timezone);
  } catch (error) {
    if (!(error instanceof AmbiguousLocalTime)) throw error;
    fail(
      "ambiguous-time",
      "That local time is skipped or occurs twice in this timezone.",
      "Choose a different clock time. For elapsed time across a clock change, use hours instead of calendar days.",
    );
  }
}

function resolveAnchor(
  anchor: Anchor,
  reference: ZonedDate,
  time: string | undefined,
  resolve = zoned,
) {
  const today = reference.toPlainDate();
  let date = today;
  let description = "";
  switch (anchor.kind) {
    case "relative":
      if (anchor.value === "now" && !time)
        return { date: reference, description: "Start at the captured reference time." };
      date = today.add({
        days:
          anchor.value === "tomorrow"
            ? 1
            : anchor.value === "yesterday"
              ? -1
              : anchor.value === "day-after-tomorrow"
                ? 2
                : anchor.value === "day-before-yesterday"
                  ? -2
                  : 0,
      });
      description = `Use ${anchor.value === "now" ? "today" : anchor.value.replaceAll("-", " ")} in ${reference.timeZoneId}.`;
      break;
    case "date":
      try {
        date = Temporal.PlainDate.from(
          { year: anchor.year ?? today.year, month: anchor.month, day: anchor.day },
          { overflow: "reject" },
        );
      } catch {
        fail(
          "date",
          "That calendar date does not exist.",
          "Check the day, month, and leap year; for example, February 30 is never valid.",
        );
      }
      description =
        anchor.year === undefined
          ? `Use the named date in the reference year, ${today.year}.`
          : "Use the exact calendar date.";
      break;
    case "weekday": {
      const delta = anchor.week
        ? (anchor.direction === "next" ? 7 : anchor.direction === "last" ? -7 : 0) +
          anchor.day -
          today.dayOfWeek
        : anchor.direction === "this"
          ? (anchor.day - today.dayOfWeek + 7) % 7
          : anchor.direction === "next"
            ? (anchor.day - today.dayOfWeek + 7) % 7 || 7
            : -((today.dayOfWeek - anchor.day + 7) % 7 || 7);
      date = today.add({ days: delta });
      description =
        anchor.direction === "this" && !anchor.week
          ? `Use the next ${weekdayNames[anchor.day - 1]}, including today.`
          : anchor.week
            ? `Use ${weekdayNames[anchor.day - 1]} in ${anchor.direction} week. Weeks start on Monday.`
            : `Use the ${anchor.direction === "next" ? "next" : "previous"} ${weekdayNames[anchor.day - 1]}, excluding today.`;
      break;
    }
    case "day-number": {
      if (anchor.day < 1 || anchor.day > 31)
        fail(
          "date",
          "A day number must be between 1 and 31.",
          "Use a named date such as “May 15” for a particular month.",
        );
      let month = today.with({ day: 1 });
      let found: Temporal.PlainDate | undefined;
      for (let i = 0; i < 12; i++) {
        if (anchor.day <= month.daysInMonth) {
          const candidate = month.with({ day: anchor.day });
          if (Temporal.PlainDate.compare(candidate, today) >= 0) {
            found = candidate;
            break;
          }
        }
        month = month.add({ months: 1 });
      }
      if (!found) fail("date", "Couldn’t find that day.", "Use an explicit calendar date.");
      date = found;
      description = `Use the next calendar occurrence of day ${anchor.day}, including today.`;
    }
  }
  let clock: Temporal.PlainTime;
  try {
    clock = Temporal.PlainTime.from(time ?? "00:00", { overflow: "reject" });
  } catch {
    fail(
      "date",
      "That clock time is invalid.",
      "Use hours 00–23, minutes/seconds 00–59, and at most three decimal places for seconds.",
    );
  }
  return {
    date: resolve(date.toPlainDateTime(clock), reference.timeZoneId),
    description: `${description} ${time ? `Set the clock to ${clock.toString()}.` : "Start at midnight."}`,
  };
}

function applyOperation(before: ZonedDate, operation: Operation, resolve = zoned) {
  const { numerator, denominator } = operation.amount;
  const details: string[] = [];
  const warnings: string[] = [];
  const sign = operation.sign;
  if (numerator > 1_000_000_000n * denominator)
    fail(
      "range",
      "That time change is too large.",
      "Use an amount no larger than one billion per step.",
      operation.span,
    );
  let after = before;
  if (operation.unit === "month" || operation.unit === "year") {
    const whole = numerator / denominator;
    let remainder = numerator % denominator;
    let months = 0n;
    if (operation.unit === "year") {
      months = (remainder * 12n) / denominator;
      remainder = (remainder * 12n) % denominator;
    }
    const count = Number(whole) * sign;
    const calendar = (
      date: ZonedDate,
      change: { years?: number; months?: number; days?: number },
    ) => {
      const after = resolve(
        date.toPlainDateTime().add(change, { overflow: "constrain" }),
        date.timeZoneId,
      );
      if ((change.years || change.months) && after.day !== date.day)
        details.push(
          `Day ${date.day} does not exist in the destination month; clamp to day ${after.day}.`,
        );
      return after;
    };
    if (count)
      after = calendar(after, operation.unit === "month" ? { months: count } : { years: count });
    if (months) {
      after = calendar(after, { months: Number(months) * sign });
      details.push(
        `Convert the year fraction into ${months} whole calendar month${months === 1n ? "" : "s"}.`,
      );
    }
    if (remainder) {
      // Compatibility with the previous calculator: fractional months use 30.436875
      // days; the remaining year fraction uses 365.25 days/year, after whole months.
      const dayNumerator = remainder * (operation.unit === "month" ? 30_436875n : 36525n);
      const dayDenominator = denominator * (operation.unit === "month" ? 1_000000n : 1200n);
      const days = (2n * dayNumerator + dayDenominator) / (2n * dayDenominator);
      if (days) after = calendar(after, { days: Number(days) * sign });
      const warning = `Approximation: the remaining ${operation.unit} fraction becomes ${days} calendar day${days === 1n ? "" : "s"}, rounded to the nearest day using ${operation.unit === "month" ? "30.436875 days/month" : "365.25 days/year"}.`;
      warnings.push(warning);
      details.push(warning);
    }
    details.push("Calendar change, applied to this step’s starting date.");
  } else if (operation.unit === "day" || operation.unit === "week") {
    const daysNumerator = numerator * (operation.unit === "week" ? 7n : 1n);
    const wholeDays = daysNumerator / denominator;
    const remainder = daysNumerator % denominator;
    const msNumerator = remainder * DAY_MS;
    if (msNumerator % denominator !== 0n)
      fail(
        "precision",
        "This fraction is smaller than the supported precision.",
        "Use a duration that resolves to a whole number of milliseconds.",
        operation.span,
      );
    if (wholeDays !== 0n)
      after = resolve(
        before.toPlainDateTime().add({ days: Number(wholeDays) * sign }),
        before.timeZoneId,
      );
    const milliseconds = Number(msNumerator / denominator) * sign;
    if (milliseconds) after = after.addElapsed({ milliseconds });
    details.push(
      `${wholeDays} calendar day${wholeDays === 1n ? "" : "s"}${milliseconds ? ` and ${Math.abs(milliseconds).toLocaleString("en-US")} elapsed milliseconds` : ""}. No rounding.`,
    );
  } else {
    const msNumerator = numerator * elapsedFactors[operation.unit];
    if (msNumerator % denominator !== 0n)
      fail(
        "precision",
        "This fraction is smaller than the supported precision.",
        "Use a duration that resolves to a whole number of milliseconds.",
        operation.span,
      );
    const milliseconds = Number(msNumerator / denominator) * sign;
    if (!Number.isSafeInteger(milliseconds))
      fail(
        "range",
        "That duration is too large.",
        "Use a smaller elapsed duration.",
        operation.span,
      );
    after = before.addElapsed({ milliseconds });
    details.push(
      `${Math.abs(milliseconds).toLocaleString("en-US")} elapsed milliseconds. No rounding.`,
    );
  }
  if (before.offset !== after.offset)
    details.push(`The timezone offset changes from ${before.offset} to ${after.offset}.`);
  return { after, details, warnings };
}

/** Pure calculation: no clock reads, browser state, network, or host-zone assumptions. */
export function calculateDate(
  expression: string,
  options: { timezone: string; reference: string },
): Calculation {
  return calculateWithClockResolver(expression, options, zoned);
}

/** Internal scheduling entry point. The strict calculator always uses rejection.
 * Callers must obtain explicit clock selections and retain their provenance.
 */
export function calculateWithClockResolver(
  expression: string,
  options: { timezone: string; reference: string },
  resolve: typeof zoned,
): Calculation {
  try {
    const plan = parseExpression(expression);
    let instant: Temporal.Instant;
    try {
      instant = Temporal.Instant.from(options.reference);
      if (instant.epochNanoseconds % 1_000_000n !== 0n)
        fail(
          "reference",
          "Reference time has unsupported precision.",
          "Use an ISO instant with at most millisecond precision.",
        );
    } catch (error) {
      if (error instanceof CalculationFailure) throw error;
      fail(
        "reference",
        "The reference time needs an explicit UTC offset.",
        "Use an ISO instant such as 2026-01-26T13:30:00Z.",
      );
    }
    let reference: ZonedDate;
    try {
      reference = zonedInstant(instant, options.timezone);
    } catch (error) {
      if (error instanceof TimezoneDataUnavailable) throw error;
      fail(
        "timezone",
        "That timezone is not recognized.",
        "Use an IANA timezone such as America/Chicago or UTC.",
      );
    }
    snapshot(reference);
    const anchor = resolveAnchor(plan.anchor, reference, plan.time, resolve);
    const start = snapshot(anchor.date);
    let current = anchor.date;
    let currentSnapshot = start;
    const steps: CalculationStep[] = [];
    const warnings: string[] = [];
    for (const operation of plan.operations) {
      const before = { ...currentSnapshot };
      const {
        after,
        details,
        warnings: stepWarnings,
      } = applyOperation(current, operation, resolve);
      warnings.push(...stepWarnings);
      currentSnapshot = snapshot(after);
      steps.push({ source: operation.source, before, after: currentSnapshot, details });
      current = after;
    }
    if (
      (plan.questionDirection === "future" &&
        current.epochMilliseconds < reference.epochMilliseconds) ||
      (plan.questionDirection === "past" && current.epochMilliseconds > reference.epochMilliseconds)
    )
      fail(
        "syntax",
        "The question and calculation point in different directions.",
        "Check whether you want a past or future date, then edit the question or the calculation.",
      );
    return {
      ok: true,
      engineVersion: 2,
      expression: expression.trim(),
      timezone: reference.timeZoneId,
      reference: instant.toString({ smallestUnit: "millisecond" }),
      normalized: plan.tokens.map((token) => token.value).join(" "),
      anchor: start,
      anchorDescription: anchor.description,
      steps,
      warnings: [...new Set(warnings)],
      result: { ...currentSnapshot },
    };
  } catch (error) {
    return {
      ok: false,
      engineVersion: 2,
      error:
        error instanceof TimezoneDataUnavailable
          ? {
              code: "timezone",
              message: error.message,
              hint: "Choose a date covered by the recorded timezone history.",
            }
          : error instanceof CalculationFailure
            ? error.issue
            : {
                code: "range",
                message: "That calculation exceeds the supported date range.",
                hint: "Use dates between years 0001 and 9999 and smaller time changes.",
              },
    };
  }
}
