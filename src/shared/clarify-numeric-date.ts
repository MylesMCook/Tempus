import { Temporal } from "@js-temporal/polyfill";

export const MAX_SELECTION_HISTORY = 64;

let numericDateFormatter: Intl.DateTimeFormat | undefined;

export type ClarificationChoice = { id: string; label: string; expression: string };
export type ClarificationSelection = { contextKey: string; id: string; previous?: string[] };
/** Replacing an occurrence start also invalidates its dependent end choice.
 * Other occurrences remain independent and retain their explicit answers.
 */
export function retainOccurrenceDecisions(history: string[], next: string): string[] {
  const recurrenceBoundary = /^boundary:(starting|until):date:/.exec(next);
  if (recurrenceBoundary)
    return history.filter(
      (id) =>
        !id.startsWith(`boundary:${recurrenceBoundary[1]}:date:`) &&
        !id.startsWith("monthly:") &&
        !id.startsWith("count:") &&
        !id.startsWith("recurrence:"),
    );
  if (/^list:year:\d{4}$/.test(next))
    return history.filter((id) => !id.startsWith("list:") || /^list:\d+:month:/.test(id));
  if (next === "monthly:skip" || next === "monthly:last-day")
    return history.filter(
      (id) =>
        !id.startsWith("monthly:") && !id.startsWith("recurrence:") && !id.startsWith("count:"),
    );
  if (next.startsWith("count:past:"))
    return history.filter((id) => !id.startsWith("count:") && !id.startsWith("recurrence:"));
  if (next.startsWith("count:exclusions:"))
    return history.filter(
      (id) => !id.startsWith("count:exclusions:") && !id.startsWith("recurrence:"),
    );
  const intervalDate = /^interval:(start|end):date:/.exec(next);
  if (next.startsWith("interval:end:boundary:"))
    return history.filter((id) => !id.startsWith("interval:end:boundary:"));
  if (intervalDate)
    return history.filter(
      (id) =>
        !id.startsWith(`interval:${intervalDate[1]}:`) &&
        !(intervalDate[1] === "start" && id.startsWith("interval:end:")),
    );
  const intervalClock = /^interval:(start|end):\d{4}-/.exec(next);
  const intervalTime = /^interval:(start|end):time:/.exec(next);
  if (intervalTime)
    return history.filter(
      (id) =>
        !id.startsWith(`interval:${intervalTime[1]}:`) ||
        id.startsWith(`interval:${intervalTime[1]}:date:`),
    );
  if (intervalClock)
    return history.filter(
      (id) =>
        !id.startsWith(`interval:${intervalClock[1]}:`) ||
        id.startsWith(`interval:${intervalClock[1]}:date:`) ||
        id.startsWith(`interval:${intervalClock[1]}:time:`),
    );
  const listMonth = /^(list:\d+):month:/.exec(next);
  if (listMonth) return history.filter((id) => !id.startsWith(`${listMonth[1]}:`));
  const listYear = /^(list:\d+):year:/.exec(next);
  if (listYear)
    return history.filter(
      (id) => !id.startsWith(`${listYear[1]}:`) || id.startsWith(`${listYear[1]}:month:`),
    );
  const listTime = /^(list:\d+):time:/.exec(next);
  if (listTime)
    return history.filter(
      (id) =>
        !id.startsWith(`${listTime[1]}:`) ||
        id.startsWith(`${listTime[1]}:date:`) ||
        id.startsWith(`${listTime[1]}:year:`) ||
        id.startsWith(`${listTime[1]}:month:`),
    );
  const listDate = /^(list:\d+):date:/.exec(next);
  if (listDate) return history.filter((id) => !id.startsWith(`${listDate[1]}:`));
  const match = /^(recurrence:\d{4}-\d{2}-\d{2}|group:\d+|list:\d+):(start|end):/.exec(next);
  if (!match) return history;
  const [, occurrence, endpoint] = match;
  return history.filter(
    (id) =>
      !id.startsWith(`${occurrence}:${endpoint}:`) &&
      !(
        endpoint === "start" &&
        (id.startsWith(`${occurrence}:end:`) || id === `${occurrence}:end-next-day`)
      ),
  );
}
export function appendSelection(
  previous: ClarificationSelection | undefined,
  next: ClarificationSelection | undefined,
): ClarificationSelection | undefined {
  if (!next || previous?.contextKey !== next.contextKey) return next;
  const arithmeticPosition = /^arithmetic:(\d+):/.exec(next.id)?.[1];
  const history = retainOccurrenceDecisions(
    [...(previous.previous ?? []), previous.id],
    next.id,
  ).filter((id) => {
    const position = /^arithmetic:(\d+):/.exec(id)?.[1];
    // A new answer replaces this arithmetic clock and invalidates downstream
    // clock decisions. Keep earlier steps and unrelated date/interval choices.
    return (
      arithmeticPosition === undefined ||
      position === undefined ||
      Number(position) < Number(arithmeticPosition)
    );
  });
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
