import { zonedInstant, zonedLocal } from "./date-engine/zoned-date.js";
import { describeZonedInstant } from "./date-engine/format-zoned.js";
import { Temporal } from "@js-temporal/polyfill";
import { calculateScheduleDate } from "./calculate-schedule-date.js";
import { parseExpression } from "./date-engine/grammar.js";
import type { ClarificationChoice } from "./clarify-numeric-date.js";

export function clockChoices(
  expression: string,
  options: { timezone: string; reference: string },
): { question: string; choices: ClarificationChoice[] } | null {
  const failed = calculateScheduleDate(expression, options);
  if (failed.ok || failed.error.code !== "ambiguous-time") return null;
  const plan = parseExpression(expression);
  // Operation-level ambiguity needs its own step choice; never resolve the anchor and discard math.
  if (plan.operations.length || !plan.time) return null;
  const reference = zonedInstant(options.reference, options.timezone);
  // UTC is a civil-time workspace here, not the user's timezone. It resolves the same anchor date
  // without applying a DST default to the requested clock.
  const civil = calculateScheduleDate(expression, {
    timezone: "UTC",
    reference: `${reference.toPlainDateTime().toString()}Z`,
  });
  if (!civil.ok) return null;
  const local = Temporal.PlainDateTime.from(civil.result.local);
  const earlier = zonedLocal(local, options.timezone, "earlier");
  const later = zonedLocal(local, options.timezone, "later");
  if (earlier.epochNanoseconds === later.epochNanoseconds) return null;
  const repeated = earlier.toPlainDateTime().equals(local) && later.toPlainDateTime().equals(local);
  return {
    question: repeated
      ? "Which occurrence of this time?"
      : "That clock time does not exist. Which time should replace it?",
    choices: [earlier, later].map((date, index) => ({
      id: date.toInstant().toString(),
      expression,
      label: `${repeated ? (index === 0 ? "First: " : "Second: ") : "Use "}${describeZonedInstant(date.epochMilliseconds, options.timezone)} (UTC${date.offset})`,
    })),
  };
}
