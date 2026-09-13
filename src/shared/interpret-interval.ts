import { zonedInstant } from "./date-engine/zoned-date.js";
import { Temporal } from "@js-temporal/polyfill";
import { calculateDate, type CalculationSuccess } from "./date-parser.js";
import { calculateScheduleDate } from "./calculate-schedule-date.js";
import { parseExpression } from "./date-engine/grammar.js";
import type { CalculationIssue } from "./date-engine/types.js";
import { numericDateChoices } from "./clarify-numeric-date.js";
import { clockChoices } from "./clarify-clock.js";

type Endpoint = "start" | "end";
type ClockPrompt = NonNullable<ReturnType<typeof clockChoices>> & { endpoint: Endpoint };

export type IntervalCandidate =
  | {
      ok: true;
      kind: "interval";
      start: CalculationSuccess;
      end: CalculationSuccess;
      allDay: boolean;
      endExclusive: true;
      overnight: boolean;
      selectedClocks?: string[];
    }
  | { ok: false; error: CalculationIssue; equalEndpoints?: true; clockPrompt?: ClockPrompt };

const clock = String.raw`(?:\d{1,2}(?::\d{2})?\s*[ap]m|\d{1,2}:\d{2}|noon|midnight)`;
const range = new RegExp(`^(.+?)\\s+(?:from\\s+)?(${clock})\\s*(?:to|[-–])\\s*(${clock})$`, "i");
const duration = /^for\s+(\d+)\s+(days?|weeks?|hours?|minutes?|seconds?)\s+from\s+(.+)$/i;
const trailingDuration = /^(.+?)\s+for\s+(\d+)\s+(days?|weeks?|hours?|minutes?|seconds?)$/i;

/** Recognize the exact duration phrase without rewriting the caller's source text. */
export function normalizeHalfHour(text: string): string {
  return text.replace(
    /\bfor\s+half\s+an\s+hour(?=\s+(?:from|starting|until|except)\s|$)/i,
    "for 30 minutes",
  );
}

const issue = (message: string, hint: string): IntervalCandidate => ({
  ok: false,
  error: { code: "syntax", message, hint },
});

/** Internal resolver; null means this is not a complete supported interval form. */
export function interpretInterval(
  text: string,
  options: {
    timezone: string;
    reference: string;
    equalEndpoints?: "next-day";
    dateSelections?: Partial<Record<Endpoint, string>>;
    clockSelections?: Partial<Record<Endpoint, string>>;
    dateEndPolicy?: string;
    timeSelections?: Partial<Record<Endpoint, string>>;
  },
): IntervalCandidate | null {
  if (text.length > 200) return null;
  const selectedClocks: string[] = [];
  const prompts: Partial<Record<Endpoint, ClockPrompt>> = {};
  const endpoint = (
    expression: string,
    name: Endpoint,
  ): CalculationSuccess | Extract<IntervalCandidate, { ok: false }> => {
    const result = calculateScheduleDate(expression, options);
    if (result.ok || result.error.code !== "ambiguous-time") return result;
    const prompt = clockChoices(expression, options);
    if (!prompt) return result;
    const clockPrompt = { ...prompt, endpoint: name };
    prompts[name] = clockPrompt;
    const selected = prompt.choices.find((choice) => choice.id === options.clockSelections?.[name]);
    if (!selected) return { ...result, clockPrompt };
    const chosen = calculateDate("now", { timezone: options.timezone, reference: selected.id });
    if (!chosen.ok) return chosen;
    selectedClocks.push(`${name === "start" ? "Start" : "End"}: ${selected.label}`);
    return {
      ...chosen,
      anchorDescription: `Use the explicitly selected ${name}: ${selected.label}`,
    };
  };
  const datedRange = /^from\s+(.+?)\s+(?:to|until)\s+(.+)$/i.exec(text);
  if (datedRange) {
    const resolved: CalculationSuccess[] = [];
    const timed: boolean[] = [];
    const expressions: string[] = [];
    const writtenTimes: (string | undefined)[] = [];
    for (const [index, name] of (["start", "end"] as const).entries()) {
      let expression = datedRange[index + 1];
      if (/^\d{1,2}\/\d{1,2}\/\d{4}(?:\s|$)/.test(expression)) {
        const choices = numericDateChoices(expression);
        if (!choices?.length)
          return issue(
            "A range endpoint is not a valid date.",
            "Write a complete date and time for both endpoints.",
          );
        const choice =
          choices.length === 1
            ? choices[0]
            : choices.find((value) => value.id === options.dateSelections?.[name]);
        if (!choice)
          return {
            ok: false,
            error: {
              code: "syntax",
              message: "Which date did you mean?",
              hint: "Choose this endpoint’s date.",
            },
            clockPrompt: {
              endpoint: name,
              question: "Which date did you mean?",
              choices: choices.map((value) => ({ ...value, id: `date:${value.id}` })),
            },
          };
        expression = choice.expression;
        if (choices.length > 1)
          selectedClocks.push(`${name === "start" ? "Start" : "End"} date: ${choice.label}`);
      }
      const value = endpoint(expression, name);
      if (!value.ok) return value;
      if (value.steps.length)
        return issue(
          "Use one date and time for each endpoint.",
          "Calculate endpoint arithmetic separately first.",
        );
      const plan = parseExpression(expression);
      expressions.push(expression);
      writtenTimes.push(plan.time);
      timed.push(
        Boolean(plan.time) || (plan.anchor.kind === "relative" && plan.anchor.value === "now"),
      );
      resolved.push(value);
    }
    const allDay = timed.every((value) => !value);
    if (timed[0] !== timed[1]) {
      const index = timed[0] ? 1 : 0;
      const name: Endpoint = index === 0 ? "start" : "end";
      const written = writtenTimes[1 - index];
      const choices = [
        ...(written && written !== "00:00:00"
          ? [
              {
                id: "time:written",
                label: `Use ${written.replace(/:00$/, "")}, matching the written time`,
                expression: `${expressions[index]} at ${written}`,
              },
            ]
          : []),
        {
          id: "time:midnight",
          label: "Use midnight at the start of this date",
          expression: `${expressions[index]} at midnight`,
        },
      ];
      const chosen = choices.find((choice) => choice.id === options.timeSelections?.[name]);
      if (!chosen)
        return {
          ok: false,
          error: {
            code: "syntax",
            message: "What time belongs on this date?",
            hint: "Choose a time here, or write a different time in the original input. The other endpoint stays unchanged.",
          },
          clockPrompt: { endpoint: name, question: "What time belongs on this date?", choices },
        };
      selectedClocks.push(`${name === "start" ? "Start" : "End"}: ${chosen.label}`);
      const value = endpoint(chosen.expression, name);
      if (!value.ok) return value;
      resolved[index] = value;
    }
    const [start, writtenEnd] = resolved;
    let end = writtenEnd;
    if (allDay) {
      const endDate = Temporal.PlainDate.from(writtenEnd.result.local.slice(0, 10));
      const choices = [
        {
          id: "boundary:exclusive",
          label: `End before ${endDate.toString()} begins`,
          expression: text,
        },
        {
          id: "boundary:inclusive",
          label: `Include all of ${endDate.toString()}`,
          expression: text,
        },
      ];
      const chosen = choices.find((choice) => choice.id === options.dateEndPolicy);
      if (!chosen)
        return {
          ok: false,
          error: {
            code: "syntax",
            message: "Should the last date be included?",
            hint: "Choose which dates belong in this all-day range.",
          },
          clockPrompt: { endpoint: "end", question: "Should the last date be included?", choices },
        };
      if (chosen.id === "boundary:inclusive") {
        const next = endDate.add({ days: 1 });
        if (next.year > 9999)
          return issue(
            "The exclusive end is outside the supported years.",
            "Use a last included date before December 31, 9999.",
          );
        const boundary = calculateScheduleDate(next.toString(), options);
        if (!boundary.ok) return boundary;
        end = boundary;
      }
      selectedClocks.push(chosen.label);
    }
    if (end.result.timestamp <= start.result.timestamp)
      return issue(
        "The end must follow the start.",
        "Correct the written dates or times. Neither endpoint has been moved.",
      );
    return {
      ok: true,
      kind: "interval",
      start,
      end,
      allDay,
      endExclusive: true,
      overnight: false,
      ...(selectedClocks.length ? { selectedClocks } : {}),
    };
  }
  const durationText = normalizeHalfHour(text);
  const trailing = trailingDuration.exec(durationText);
  const span =
    duration.exec(durationText) ??
    (trailing ? [trailing[0], trailing[2], trailing[3], trailing[1]] : null);
  if (span) {
    const [, amount, unit, anchor] = span;
    if (!Number.isSafeInteger(Number(amount)) || Number(amount) < 1 || Number(amount) > 1_000_000)
      return issue(
        "That interval length is outside the supported range.",
        "Use 1 to 1,000,000 units.",
      );
    // An anchor cannot contain another duration or operation. Date-only anchors use midnight.
    const start = endpoint(anchor, "start");
    if (!start.ok) return start;
    if (start.steps.length)
      return issue(
        "Use one start date for this interval.",
        "Calculate date arithmetic separately first.",
      );
    let end: CalculationSuccess | Extract<IntervalCandidate, { ok: false }> = calculateDate(
      `now plus ${amount} ${unit}`,
      {
        ...options,
        reference: start.result.iso,
      },
    );
    const plan = parseExpression(anchor);
    const allDay =
      /^(?:day|week)/i.test(unit) &&
      !plan.time &&
      !(plan.anchor.kind === "relative" && plan.anchor.value === "now");
    if (allDay) {
      const endDate = Temporal.PlainDate.from(start.result.local.slice(0, 10)).add({
        days: Number(amount) * (/^week/i.test(unit) ? 7 : 1),
      });
      end = calculateScheduleDate(endDate.toString(), options);
    }
    if (!end.ok && end.error.code === "ambiguous-time" && !allDay && /^(?:day|week)/i.test(unit)) {
      // Calendar duration determines the civil endpoint first. Ask about that endpoint only;
      // never replace the duration with elapsed hours or reselect the start.
      const civil = calculateDate(`now plus ${amount} ${unit}`, {
        timezone: "UTC",
        reference: `${start.result.local}Z`,
      });
      if (!civil.ok) return civil;
      const local = civil.result.local;
      end = endpoint(`${local.slice(0, 10)} at ${local.slice(11)}`, "end");
    }
    if (!end.ok) return end;
    if (end.result.timestamp <= start.result.timestamp)
      return issue(
        "The selected end must follow the start.",
        "Choose another endpoint or edit the duration.",
      );
    return {
      ok: true,
      kind: "interval",
      start,
      end,
      allDay,
      endExclusive: true,
      overnight: false,
      ...(selectedClocks.length ? { selectedClocks } : {}),
    };
  }

  if (/\bfor\b/i.test(text))
    return issue(
      "How long should this event last?",
      "Use a positive whole number and seconds, minutes, hours, days or weeks, such as “tomorrow at noon for 30 minutes”.",
    );
  const match = range.exec(text);
  if (!match) return null;
  const [, anchor, startClock, endClock] = match;
  const startExpression = `${anchor} at ${startClock}`;
  const start = endpoint(startExpression, "start");
  if (!start.ok) return start;
  // Keep one explicit date anchor. Never reduce an arithmetic expression to its first date.
  if (start.steps.length)
    return issue("Use one date before the time range.", "For example: “Friday 10pm-12am”.");
  // A gap replacement can change the actual start clock or even civil date.
  // Keep the written range's calendar structure when deriving the other endpoint.
  let writtenStart = start.result.local;
  if (prompts.start) {
    const localReference = zonedInstant(options.reference, options.timezone)
      .toPlainDateTime()
      .toString();
    const civil = calculateScheduleDate(startExpression, {
      timezone: "UTC",
      reference: `${localReference}Z`,
    });
    if (!civil.ok) return civil;
    writtenStart = civil.result.local;
  }
  // Only the clock is needed to determine the end date. Resolve timezone/DST on that date below.
  let endTime: string;
  try {
    endTime = parseExpression(`2000-01-01 at ${endClock}`).time!;
  } catch {
    // Preserve the evaluator's existing structured diagnostics for invalid clocks.
    const clockOnly = calculateDate(`2000-01-01 at ${endClock}`, { ...options, timezone: "UTC" });
    if (!clockOnly.ok) return clockOnly;
    endTime = clockOnly.result.local.slice(11);
  }
  const order = Temporal.PlainTime.compare(
    Temporal.PlainTime.from(endTime),
    Temporal.PlainDateTime.from(writtenStart).toPlainTime(),
  );
  if (order === 0 && options.equalEndpoints !== "next-day")
    return {
      ok: false,
      equalEndpoints: true,
      error: {
        code: "syntax",
        message: "Do you mean a full day?",
        hint: "Confirm that the end is on the next date, or edit the time range.",
      },
    };
  const endDate = Temporal.PlainDate.from(writtenStart.slice(0, 10)).add({
    days: order <= 0 ? 1 : 0,
  });
  const end = endpoint(`${endDate.toString()} at ${endClock}`, "end");
  if (!end.ok) return end;
  if (end.result.timestamp <= start.result.timestamp)
    return {
      ok: false,
      error: {
        code: "ambiguous-time",
        message: "These choices put the end at or before the start.",
        hint: "Choose another clock occurrence, restart the choices, or edit the range. The end date has not been moved.",
      },
      ...((prompts.end ?? prompts.start) ? { clockPrompt: prompts.end ?? prompts.start } : {}),
    };
  return {
    ok: true,
    kind: "interval",
    start,
    end,
    allDay: false,
    endExclusive: true,
    overnight: order <= 0,
    ...(selectedClocks.length ? { selectedClocks } : {}),
  };
}
