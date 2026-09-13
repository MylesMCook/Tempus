import { zonedInstant, startOfZonedDay } from "./date-engine/zoned-date.js";
import { Temporal } from "@js-temporal/polyfill";
import { calculateDate, type Calculation } from "./date-parser.js";
import { parseExpression } from "./date-engine/grammar.js";

export const DATE_START_POLICY =
  "This date uses its first valid local time as a day boundary; no appointment time was supplied.";

/** Scheduling weekdays can include today; strict calculator/API v2 rules stay unchanged. */
export function calculateScheduleDate(
  expression: string,
  options: { timezone: string; reference: string },
): Calculation {
  let strict = calculateDate(expression, options);
  if (!strict.ok && strict.error.code !== "ambiguous-time") return strict;
  const plan = parseExpression(expression);
  if (
    !strict.ok &&
    !plan.time &&
    !plan.operations.length &&
    !(plan.anchor.kind === "relative" && plan.anchor.value === "now")
  ) {
    const reference = zonedInstant(options.reference, options.timezone);
    const civil = calculateDate(expression, {
      timezone: "UTC",
      reference: `${reference.toPlainDateTime().toString()}Z`,
    });
    if (!civil.ok) return civil;
    const date = Temporal.PlainDate.from(civil.result.local.slice(0, 10));
    const boundary = startOfZonedDay(date, options.timezone);
    if (!boundary.toPlainDate().equals(date)) return strict;
    const snapshot = {
      iso: boundary.toInstant().toString({ smallestUnit: "millisecond" }),
      local: boundary.toPlainDateTime().toString({ smallestUnit: "millisecond" }),
      offset: boundary.offset,
      timestamp: boundary.epochMilliseconds,
    };
    strict = {
      ...civil,
      timezone: options.timezone,
      reference: Temporal.Instant.from(options.reference).toString({ smallestUnit: "millisecond" }),
      anchor: snapshot,
      result: snapshot,
      anchorDescription: DATE_START_POLICY,
      warnings: [DATE_START_POLICY],
    };
  }
  if (
    plan.anchor.kind !== "weekday" ||
    plan.operations.length ||
    /^(?:next|last|this)\b/i.test(expression.trim())
  )
    return strict;
  const reference = zonedInstant(options.reference, options.timezone);
  if (plan.anchor.day !== reference.dayOfWeek) return strict;
  const today = calculateScheduleDate(`this ${expression.trim()}`, options);
  if (!today.ok) return today;
  return !plan.time || today.result.timestamp >= reference.epochMilliseconds ? today : strict;
}
