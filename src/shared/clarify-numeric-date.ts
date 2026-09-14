import { Temporal } from "@js-temporal/polyfill";
import { retainDecisions } from "./clarification-dependencies.js";

export const MAX_SELECTION_HISTORY = 64;

let numericDateFormatter: Intl.DateTimeFormat | undefined;

export type ClarificationChoice = { id: string; label: string; expression: string };
export type ClarificationSelection = { contextKey: string; id: string; previous?: string[] };
/** Runtime boundary shared by parsing and calendar preparation. Sparse histories are invalid. */
export function isClarificationSelection(value: unknown): value is ClarificationSelection {
  if (!value || typeof value !== "object") return false;
  const selection = value as Partial<ClarificationSelection>;
  return (
    typeof selection.contextKey === "string" &&
    typeof selection.id === "string" &&
    (selection.previous === undefined ||
      (Array.isArray(selection.previous) &&
        selection.previous.length <= MAX_SELECTION_HISTORY &&
        Array.from(selection.previous).every((id) => typeof id === "string")))
  );
}
/** Preserve the legacy occurrence-only helper; arithmetic invalidation belongs to appendSelection. */
export function retainOccurrenceDecisions(history: string[], next: string): string[] {
  return retainDecisions(history, next);
}
export function appendSelection(
  previous: ClarificationSelection | undefined,
  next: ClarificationSelection | undefined,
): ClarificationSelection | undefined {
  if (!next || previous?.contextKey !== next.contextKey) return next;
  const history = retainDecisions([...(previous.previous ?? []), previous.id], next.id, true);
  return {
    ...next,
    previous: [...new Set(history)].slice(-MAX_SELECTION_HISTORY),
  };
}

export function interpretationContextKey(
  input: string,
  options: { timezone: string; reference: string },
): string {
  return JSON.stringify([input, options.timezone, options.reference]);
}

/** Calendar-valid alternatives only. Clock resolution happens after a date-order choice. */
export function numericDateChoices(text: string): ClarificationChoice[] | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(\s+(?:at|for)\s+.+)?$/i.exec(text);
  if (!match) return null;
  const [, first, second, year, time = ""] = match;
  const choices: ClarificationChoice[] = [];
  for (const [month, day] of [
    [first, second],
    [second, first],
  ]) {
    try {
      const date = Temporal.PlainDate.from(
        { year: Number(year), month: Number(month), day: Number(day) },
        { overflow: "reject" },
      );
      if (date.year < 1 || choices.some((choice) => choice.id === date.toString())) continue;
      choices.push({
        id: date.toString(),
        expression: `${date.toString()}${time}`,
        label: (numericDateFormatter ??= new Intl.DateTimeFormat("en-US", {
          timeZone: "UTC",
          month: "long",
          day: "numeric",
          year: "numeric",
        })).format(new Date(`${date.toString()}T12:00:00Z`)),
      });
    } catch {
      /* An impossible calendar date is not an alternative. */
    }
  }
  return choices;
}
