import { calculateDate, calculateWithClockResolver } from "./date-parser.js";
import { parseExpression } from "./date-engine/grammar.js";
import { AmbiguousLocalTime, zonedLocal } from "./date-engine/zoned-date.js";
import { describeZonedInstant } from "./date-engine/format-zoned.js";
import { fail } from "./date-engine/types.js";
import type { ClarificationChoice } from "./clarify-numeric-date.js";

export function clarifyArithmetic(
  expression: string,
  options: { timezone: string; reference: string },
  selections: string[],
) {
  const strict = calculateDate(expression, options);
  if (
    strict.ok ||
    strict.error.code !== "ambiguous-time" ||
    !parseExpression(expression).operations.length
  )
    return null;
  let prompt: { question: string; choices: ClarificationChoice[] } | undefined;
  const decisions: string[] = [];
  const labels: string[] = [];
  let index = 0;
  const calculation = calculateWithClockResolver(expression, options, (local, timezone) => {
    const position = index++;
    try {
      return zonedLocal(local, timezone);
    } catch (error) {
      if (!(error instanceof AmbiguousLocalTime)) throw error;
    }
    const dates = [zonedLocal(local, timezone, "earlier"), zonedLocal(local, timezone, "later")];
    const choices = dates.map((date) => ({
      id: `arithmetic:${position}:${local.toString()}:${date.toInstant().toString()}`,
      expression,
      label: `${describeZonedInstant(date.epochMilliseconds, timezone)} (UTC${date.offset})`,
    }));
    const matching = choices.filter((choice) => selections.includes(choice.id));
    const selected = matching.length === 1 ? choices.indexOf(matching[0]) : -1;
    if (selected < 0) {
      prompt = {
        question: "Which clock time should the calculation use before continuing?",
        choices,
      };
      fail(
        "ambiguous-time",
        prompt.question,
        "Choose a clock time to continue the remaining arithmetic.",
      );
    }
    decisions.push(
      `At ${local.toString()}, you selected ${choices[selected].label}. Remaining operations retain their written order.`,
    );
    labels.push(choices[selected].label);
    return dates[selected];
  });
  return {
    calculation: calculation.ok
      ? { ...calculation, warnings: [...calculation.warnings, ...decisions] }
      : calculation,
    prompt,
    decisions,
    labels,
  };
}
