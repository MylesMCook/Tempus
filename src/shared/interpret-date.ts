import { calculateDate, type Calculation } from "./date-parser";
import type { CalculationIssue, Span } from "./date-engine/types";

type Source = { text: string; span: Span };
export type Interpretation =
  | {
      interpretationVersion: 1;
      status: "resolved";
      value: { kind: "point"; calculation: Extract<Calculation, { ok: true }> };
      source: Source;
      event?: Source;
      assumptions: string[];
    }
  | {
      interpretationVersion: 1;
      status: "needs-clarification" | "no-expression" | "unsupported";
      error: CalculationIssue;
    };

const temporalStart =
  /\b(?:today|tomorrow|yesterday|next|last|this|in|on|at|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|days?|weeks?|months?|years?|hours?|minutes?|seconds?|\d+)\b/i;

/** A bounded sentence recognizer. This does not extract arbitrary dates from prose. */
export function interpretDate(
  input: string,
  options: { timezone: string; reference: string },
): Interpretation {
  const unresolved = (
    status: Exclude<Interpretation["status"], "resolved">,
    message: string,
    hint: string,
  ): Interpretation => ({
    interpretationVersion: 1,
    status,
    error: { code: "syntax", message, hint },
  });
  const fromCalculation = (
    calculation: Calculation,
    start: number,
    text: string,
    event?: Source,
  ): Interpretation => {
    if (!calculation.ok)
      return {
        interpretationVersion: 1,
        status: calculation.error.code === "ambiguous-time" ? "needs-clarification" : "unsupported",
        error: {
          ...calculation.error,
          ...(calculation.error.span
            ? {
                span: {
                  start: start + calculation.error.span.start,
                  end: start + calculation.error.span.end,
                },
              }
            : {}),
        },
      };
    return {
      interpretationVersion: 1,
      status: "resolved",
      value: { kind: "point", calculation },
      source: { text, span: { start, end: start + text.length } },
      ...(event ? { event } : {}),
      assumptions: event ? ["The event text is a label only; no reminder has been created."] : [],
    };
  };
  const strict = calculateDate(input, options);
  const leading = input.length - input.trimStart().length;
  if (strict.ok) return fromCalculation(strict, leading, input.trim());
  if (input.length > 200) return fromCalculation(strict, 0, input);
  const text = input
    .trim()
    .replace(/[.!?]+$/, "")
    .trimEnd();
  if (!text) return unresolved("no-expression", "Enter a date phrase.", "Try “tomorrow at noon”.");
  if (/\b(?:not|never|cancel|cancelled|canceled)\b|\bdon['’]t\b/i.test(text)) {
    return unresolved(
      "no-expression",
      "No date selected from this instruction.",
      "It contains a cancellation or negative instruction. Enter only the date you want to calculate.",
    );
  }
  if (/\b(?:actually|instead|unless|except|if|or|reschedule)\b/i.test(text)) {
    return unresolved(
      "needs-clarification",
      "Which date do you want?",
      "Corrections and conditions are not supported yet. Enter one date phrase.",
    );
  }
  if (/\b(?:every|each|daily|weekly|monthly|yearly)\b/i.test(text)) {
    return unresolved(
      "unsupported",
      "Repeating schedules are not supported yet.",
      "Enter one date, such as “next Monday at 8 pm”.",
    );
  }
  // Punctuation is the only text removed from an otherwise strict expression.
  const punctuated = calculateDate(text, options);
  if (punctuated.ok) return fromCalculation(punctuated, leading, text);

  let dateStart: number | undefined;
  let event: Source | undefined;
  const reminder = /^(?:please\s+)?remind me to\s+/i.exec(text);
  if (reminder) {
    const rest = text.slice(reminder[0].length);
    if (!/^(?:call|email|text|visit|pay|buy|send|submit|pick up)\s+/i.test(rest)) {
      return unresolved(
        "unsupported",
        "This reminder form is not supported yet.",
        "Try “Remind me to call Sam tomorrow at noon”, or enter just the date.",
      );
    }
    const task =
      /^((?:call|email|text|visit|pay|buy|send|submit|pick up)\s+([\p{L}][\p{L}'’-]*))\s+(.+)$/iu.exec(
        rest,
      );
    if (task && !temporalStart.test(task[2])) {
      const label = task[1];
      dateStart = text.length - task[3].length;
      event = {
        text: label,
        span: {
          start: leading + reminder[0].length,
          end: leading + reminder[0].length + label.length,
        },
      };
    }
  } else {
    const meeting = /^(?:the\s+)?meeting is\s+/i.exec(text);
    const question = /^(?:can|could) we (talk|meet)\s+/i.exec(text);
    const prefix = meeting ?? question;
    if (prefix) {
      dateStart = prefix[0].length;
      const label = meeting ? "meeting" : question![1];
      const index = text.toLowerCase().indexOf(label.toLowerCase());
      event = {
        text: text.slice(index, index + label.length),
        span: { start: leading + index, end: leading + index + label.length },
      };
    }
  }
  if (dateStart === undefined) return fromCalculation(strict, 0, input);
  let date = text.slice(dateStart);
  // The highlighted/evaluated phrase starts after an optional "on" connector.
  const on = /^on\s+/i.exec(date);
  if (on) {
    dateStart += on[0].length;
    date = date.slice(on[0].length);
  }
  return fromCalculation(calculateDate(date, options), leading + dateStart, date, event);
}
