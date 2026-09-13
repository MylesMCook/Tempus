import { nextMonthlyDate, type MonthlyCadence } from "./monthly-date.js";
import { zonedLocal } from "./date-engine/zoned-date.js";
import { Temporal } from "@js-temporal/polyfill";
import { calculateDate, type CalculationSuccess } from "./date-parser.js";
import { CalculationFailure, type CalculationIssue } from "./date-engine/types.js";
import { parseExpression } from "./date-engine/grammar.js";
import { normalizeHalfHour, interpretInterval } from "./interpret-interval.js";
import { clockChoices } from "./clarify-clock.js";
import { calculateScheduleDate } from "./calculate-schedule-date.js";
import { numericDateChoices } from "./clarify-numeric-date.js";

type ClockOverride = { date: string; endpoint: "start" | "end"; instant: string; label: string };
type OccurrencePrompt = NonNullable<ReturnType<typeof clockChoices>>;

const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const weekdayName = `(?:${weekdays.join("|")})s?`;
const weekdayList = `${weekdayName}(?:(?:,\\s*(?:and\\s+)?|\\s+and\\s+)${weekdayName}){0,6}`;
const cadence = `(?:${weekdayList}|days?|weekdays?|weekends?)`;
const weeklyPrefix = new RegExp(`^weekly on (?=${weekdayName}\\b)`, "i");
const pluralPrefix = new RegExp(`^(?:${weekdays.join("|")})s\\b`, "i");
const recurrencePrefix =
  /^(?:every|each|daily|weekly|monthly|yearly|annually|hourly|nightly|quarterly|biweekly|fortnightly|weekdays?|weekends?|alternate|alternating|repeat|repeating|recurring)\b/i;
const isoDate = String.raw`\d{4}-\d{2}-\d{2}`;
const boundaries = String.raw`(?: starting (.+?))?(?: until (.+?))?(?: except (${isoDate}(?:,\s*${isoDate})*))?`;
const missingClock = new RegExp("^every (" + cadence + ")" + boundaries + "$", "i");
const clock = String.raw`(?:\d{1,2}(?::\d{2})?\s*[ap]m|\d{1,2}:\d{2}|noon|midnight)`;
const weekly = new RegExp(
  `^every (${cadence}) (?:(?:at (${clock})(?: for (\\d+) (days?|weeks?|hours?|minutes?|seconds?))?)|(?:from (${clock}) to (${clock})))${boundaries}$`,
  "i",
);

export type RecurrenceCandidate =
  | {
      ok: true;
      kind: "recurrence";
      timezone: string;
      rule: ({ frequency: "weekly"; interval?: number; weekdays: number[] } | MonthlyCadence) & {
        startClock: string;
        endClock?: string;
        duration?: { amount: number; unit: string };
        starting: string;
        until?: string;
        count?: number;
        countExclusions?: "consume" | "replace";
        countPast?: "consume" | "upcoming";
        exceptions: string[];
        clockOverrides?: ClockOverride[];
      };
      occurrences: { start: CalculationSuccess; end?: CalculationSuccess }[];
      truncated: boolean;
      validation: "preview-only";
    }
  | {
      ok: false;
      error: CalculationIssue;
      needsClock?: true;
      clockPrompt?: OccurrencePrompt;
      policyPrompt?: OccurrencePrompt;
    };

type RecurrenceOptions = {
  timezone: string;
  reference: string;
  limit?: number;
  clockDecisions?: string[];
  policyDecisions?: string[];
  complete?: true;
};
type RecurrenceFailure = Extract<RecurrenceCandidate, { ok: false }>;

const invalid = (message: string): RecurrenceFailure => ({
  ok: false,
  error: {
    code: "range",
    message,
    hint: "Use a valid weekly or monthly schedule, 1–100 preview occurrences and at most 10 excluded dates.",
  },
});

function resolveBoundary(
  expression: string,
  endpoint: "starting" | "until",
  options: RecurrenceOptions,
): { ok: true; date: string } | RecurrenceFailure {
  const alternatives = numericDateChoices(expression);
  if (alternatives?.length) {
    const prefix = `boundary:${endpoint}:date:`;
    const answers = [...new Set(options.policyDecisions?.filter((id) => id.startsWith(prefix)))];
    const selected =
      answers.length === 1
        ? alternatives.find((choice) => `${prefix}${choice.id}` === answers[0])
        : undefined;
    if (alternatives.length > 1 && !selected) {
      return {
        ok: false,
        error: {
          code: "syntax",
          message: `Which date does the ${endpoint} boundary mean?`,
          hint: "Choose the date order. The boundary is an inclusive local calendar date.",
        },
        policyPrompt: {
          question: `Which date does the ${endpoint} boundary mean?`,
          choices: alternatives.map((choice) => ({ ...choice, id: `${prefix}${choice.id}` })),
        },
      };
    }
    expression = (selected ?? alternatives[0]).expression;
  }
  try {
    const plan = parseExpression(expression);
    if (
      plan.time ||
      (plan.anchor.kind === "relative" && plan.anchor.value === "now" && !plan.operations.length) ||
      plan.operations.some(
        (operation) => !["day", "week", "month", "year"].includes(operation.unit),
      )
    )
      return invalid(
        `The recurrence ${endpoint} boundary must be a calendar date, not a clock or elapsed time.`,
      );
    const resolved = calculateScheduleDate(expression, options);
    if (!resolved.ok)
      return {
        ok: false,
        error: {
          ...resolved.error,
          message: `Recurrence ${endpoint} boundary: ${resolved.error.message}`,
        },
      };
    return { ok: true, date: resolved.result.local.slice(0, 10) };
  } catch (error) {
    return invalid(
      `The recurrence ${endpoint} boundary is not a supported date${error instanceof CalculationFailure ? `: ${error.issue.message}` : "."}`,
    );
  }
}

/** Resolve one selected date; cadence selection and past-date filtering belong to the caller. */
function resolveOccurrence(
  date: Temporal.PlainDate,
  clocks: {
    pointClock?: string;
    durationAmount?: string;
    durationUnit?: string;
    rangeStart?: string;
    rangeEnd?: string;
  },
  options: RecurrenceOptions,
):
  | {
      ok: true;
      occurrence: { start: CalculationSuccess; end?: CalculationSuccess };
      clockOverrides: ClockOverride[];
    }
  | RecurrenceFailure {
  const { pointClock, durationAmount, durationUnit, rangeStart, rangeEnd } = clocks;
  const dateKey = date.toString();
  const clockOverrides: ClockOverride[] = [];
  const clockSelections: Partial<Record<"start" | "end", string>> = {};
  for (const endpoint of ["start", "end"] as const) {
    const prefix = `recurrence:${dateKey}:${endpoint}:`;
    const decisions = [...new Set(options.clockDecisions?.filter((id) => id.startsWith(prefix)))];
    // Conflicting answers do not establish a clock choice. Ask again.
    if (decisions.length === 1) clockSelections[endpoint] = decisions[0].slice(prefix.length);
  }
  const promptFor = (prompt: OccurrencePrompt, endpoint: "start" | "end") => ({
    question: `${dateKey} ${endpoint}: ${prompt.question}`,
    choices: prompt.choices.map((choice) => ({
      ...choice,
      id: `recurrence:${dateKey}:${endpoint}:${choice.id}`,
    })),
  });
  let point =
    pointClock && !durationAmount
      ? calculateDate(`${date.toString()} at ${pointClock}`, options)
      : undefined;
  if (point && !point.ok && point.error.code === "ambiguous-time") {
    const prompt = clockChoices(`${dateKey} at ${pointClock}`, options);
    if (prompt) {
      const chosen = prompt.choices.find((choice) => choice.id === clockSelections.start);
      if (!chosen) return { ...point, clockPrompt: promptFor(prompt, "start") };
      point = calculateDate("now", { timezone: options.timezone, reference: chosen.id });
      if (point.ok)
        point = {
          ...point,
          anchorDescription: `Use the explicitly selected occurrence on ${dateKey}: ${chosen.label}`,
        };
      clockOverrides.push({
        date: dateKey,
        endpoint: "start",
        instant: chosen.id,
        label: chosen.label,
      });
    }
  }
  const range =
    rangeStart || durationAmount
      ? interpretInterval(
          durationAmount
            ? `${dateKey} at ${pointClock} for ${durationAmount} ${durationUnit}`
            : `${date.toString()} from ${rangeStart} to ${rangeEnd}`,
          {
            ...options,
            clockSelections,
          },
        )
      : undefined;
  if (point && !point.ok) return point;
  if (range && !range.ok)
    return {
      ok: false,
      error: range.error,
      ...(range.clockPrompt
        ? { clockPrompt: promptFor(range.clockPrompt, range.clockPrompt.endpoint) }
        : {}),
    };
  if (range?.ok) {
    for (const endpoint of ["start", "end"] as const) {
      const label = range.selectedClocks?.find((item) =>
        item.startsWith(endpoint === "start" ? "Start:" : "End:"),
      );
      if (label && clockSelections[endpoint])
        clockOverrides.push({
          date: dateKey,
          endpoint,
          instant: clockSelections[endpoint]!,
          label,
        });
    }
  }
  if (!point?.ok && !range?.ok) return invalid("The occurrence could not be resolved completely.");
  const start = point?.ok ? point : range!.ok ? range!.start : undefined;
  if (!start) return invalid("Missing occurrence start.");
  return {
    ok: true,
    occurrence: { start, ...(range?.ok ? { end: range.end } : {}) },
    clockOverrides,
  };
}

/** Bounded weekly preview. This is not a validated calendar export. */
export function interpretRecurrence(
  text: string,
  options: RecurrenceOptions,
): RecurrenceCandidate | null {
  if (text.length > 200) return null;
  let normalized = normalizeHalfHour(text)
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^daily(?= |$)/i, "every day")
    .replace(weeklyPrefix, "every ");
  if (pluralPrefix.test(normalized)) normalized = `every ${normalized}`;
  let interval = 1;
  const counted = /\s+for (\S+) (?:occurrences?|times?)(?= starting | until | except |$)/i.exec(
    normalized,
  );
  const countWords = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
  ];
  const count = counted
    ? /^\d+$/.test(counted[1])
      ? Number(counted[1])
      : countWords.indexOf(counted[1].toLowerCase()) + 1
    : undefined;
  if (counted) {
    if (!count || count > 1000)
      return invalid(
        "Use a whole occurrence count from 1 to 1,000. No count has been rounded or shortened.",
      );
    normalized =
      normalized.slice(0, counted.index) + normalized.slice(counted.index + counted[0].length);
  }
  const spacedWeeks = /^every (\d+) weeks? on /i.exec(normalized);
  const alternateWeekday = new RegExp(`^every other (?=${weekdayName}(?: (?:at|from)\\b|$))`, "i");
  if (spacedWeeks) {
    interval = Number(spacedWeeks[1]);
    if (!Number.isInteger(interval) || interval < 1 || interval > 52)
      return invalid("A repeating weekly interval must be from 1 to 52 weeks.");
    normalized = normalized.replace(/^every \d+ weeks? on /i, "every ");
  } else if (alternateWeekday.test(normalized)) {
    interval = 2;
    normalized = normalized.replace(/^every other /i, "every ");
  }
  const monthly =
    /^every month on (?:the )?(first|second|third|(?:[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?)(?= |$)/i.exec(
      normalized,
    );
  const dayOfMonth = monthly
    ? ({ first: 1, second: 2, third: 3 }[monthly[1].toLowerCase()] ??
      Number.parseInt(monthly[1], 10))
    : undefined;
  if (monthly && /\d/.test(monthly[1])) {
    const written = monthly[1].toLowerCase();
    const suffix = written.replace(/^\d+/, "");
    const day = dayOfMonth!;
    const expected =
      day >= 11 && day <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[day % 10] ?? "th");
    if (suffix && suffix !== expected)
      return invalid("The monthly recurrence day has an invalid ordinal suffix.");
  }
  const match = weekly.exec(monthly ? normalized.replace(monthly[0], "every day") : normalized);
  if (!match) {
    if (!missingClock.test(monthly ? normalized.replace(monthly[0], "every day") : normalized))
      return recurrencePrefix.test(normalized)
        ? {
            ok: false,
            error: {
              code: "syntax",
              message: "This repeating schedule wording is not supported yet.",
              hint: "Use full weekdays with a shared clock, or “every month on the 15th at noon”. Boundaries may be named, relative or ISO dates; use exact excluded dates in ISO format. No recurrence qualifier has been discarded.",
            },
          }
        : null;
    const validated = calculateDate("now", options);
    if (!validated.ok) return validated;
    return {
      ok: false,
      needsClock: true,
      error: {
        code: "syntax",
        message: "What time should this repeat?",
        hint: "Add a time, such as “at noon”, or a range such as “from 9 am to 5 pm”. No time has been assumed.",
      },
    };
  }
  const limit = options.complete ? 1000 : (options.limit ?? 3);
  if (!Number.isInteger(limit) || limit < 1 || limit > (options.complete ? 1000 : 100))
    return invalid("Preview limit must be between 1 and 100.");
  // Validate the supplied instant and zone, without inventing a midnight appointment.
  const validated = calculateDate("now", options);
  if (!validated.ok) return validated;
  const policies = [
    ...new Set(
      (options.policyDecisions ?? []).filter(
        (id) => id === "monthly:skip" || id === "monthly:last-day",
      ),
    ),
  ];
  const monthlyPrompt = (): RecurrenceFailure => ({
    ok: false,
    error: {
      code: "syntax",
      message: "Some months do not have that date.",
      hint: "Choose what happens in those months. Your original text stays unchanged.",
    },
    policyPrompt: {
      question: `What happens in months without day ${dayOfMonth}?`,
      choices: [
        { id: "monthly:skip", label: "Skip that month", expression: text },
        { id: "monthly:last-day", label: "Use the last day of that month", expression: text },
      ],
    },
  });
  const monthlyRule: MonthlyCadence | undefined =
    dayOfMonth === undefined
      ? undefined
      : {
          frequency: "monthly",
          dayOfMonth,
          shortMonth:
            policies.length === 1 && policies[0] === "monthly:last-day" ? "last-day" : "skip",
        };
  const [
    ,
    weekday,
    pointClock,
    durationAmount,
    durationUnit,
    rangeStart,
    rangeEnd,
    starting,
    until,
    exceptionText,
  ] = match;
  let startTime: NonNullable<ReturnType<typeof parseExpression>["time"]>;
  try {
    startTime = parseExpression(`2000-01-01 at ${pointClock ?? rangeStart}`).time!;
    if (rangeEnd) {
      const endTime = parseExpression(`2000-01-01 at ${rangeEnd}`).time!;
      if (Temporal.PlainTime.compare(startTime, endTime) === 0)
        return invalid(
          "The start and end times match. Enter a different end time, or use a duration such as “at 9am for 1 day”.",
        );
    }
  } catch (error) {
    if (error instanceof CalculationFailure) return { ok: false, error: error.issue };
    return invalid("The schedule clock could not be validated.");
  }
  if (
    durationAmount &&
    (!Number.isSafeInteger(Number(durationAmount)) ||
      Number(durationAmount) < 1 ||
      Number(durationAmount) > 1_000_000)
  )
    return invalid(
      "Use a duration of 1 to 1,000,000 whole seconds, minutes, hours, days or weeks.",
    );
  const namedDays = weekday
    .toLowerCase()
    .split(/,\s*(?:and\s+)?|\s+and\s+/)
    .map((name) => weekdays.indexOf(name.replace(/s$/, "")) + 1)
    .sort((a, b) => a - b);
  const label = weekday.toLowerCase().replace(/s$/, "");
  const days =
    label === "day"
      ? [1, 2, 3, 4, 5, 6, 7]
      : label === "weekday"
        ? [1, 2, 3, 4, 5]
        : label === "weekend"
          ? [6, 7]
          : namedDays;
  if (new Set(days).size !== days.length) return invalid("Each weekday should appear only once.");
  const exceptions = exceptionText?.split(/,\s*/).map((date) => date.trim()) ?? [];
  if (exceptions.length > 10) return invalid("Too many excluded dates.");
  const countAnswers = [
    ...new Set(
      (options.policyDecisions ?? []).filter(
        (id) => id === "count:exclusions:consume" || id === "count:exclusions:replace",
      ),
    ),
  ];
  const countExclusions =
    count && exceptions.length && countAnswers.length === 1
      ? countAnswers[0] === "count:exclusions:consume"
        ? ("consume" as const)
        : ("replace" as const)
      : undefined;
  const startBoundary = starting ? resolveBoundary(starting, "starting", options) : undefined;
  if (startBoundary && !startBoundary.ok) return startBoundary;
  const endBoundary = until ? resolveBoundary(until, "until", options) : undefined;
  if (endBoundary && !endBoundary.ok) return endBoundary;
  try {
    const today = Temporal.PlainDate.from(validated.result.local.slice(0, 10));
    let beginning = startBoundary ? Temporal.PlainDate.from(startBoundary.date) : today;
    const ending = endBoundary ? Temporal.PlainDate.from(endBoundary.date) : undefined;
    const pastStart =
      count &&
      starting &&
      (Temporal.PlainDate.compare(beginning, today) < 0 ||
        (beginning.equals(today) &&
          zonedLocal(beginning.toPlainDateTime(startTime), options.timezone, "earlier")
            .epochMilliseconds < validated.result.timestamp));
    const pastAnswers = [
      ...new Set(
        (options.policyDecisions ?? []).filter(
          (id) => id === "count:past:consume" || id === "count:past:upcoming",
        ),
      ),
    ];
    const countPast =
      pastStart && pastAnswers.length === 1
        ? pastAnswers[0] === "count:past:consume"
          ? ("consume" as const)
          : ("upcoming" as const)
        : undefined;
    if (options.complete && !ending && !count)
      return invalid("An explicit end date is required for complete bounded export.");
    if (
      options.complete &&
      ending &&
      Temporal.PlainDate.compare(ending, today.add({ years: 10 })) > 0
    )
      return invalid(
        "Complete export is limited to ten calendar years; no end date has been changed.",
      );
    for (const date of [
      beginning,
      ...(ending ? [ending] : []),
      ...exceptions.map((date) => Temporal.PlainDate.from(date)),
    ]) {
      if (date.year < 1 || date.year > 9999)
        return invalid("Schedule dates must be in years 0001–9999.");
    }
    if (ending && Temporal.PlainDate.compare(ending, beginning) < 0)
      return invalid("The last schedule date precedes its start.");
    if (monthlyRule && dayOfMonth! > 28 && policies.length !== 1) {
      if (!ending && !count) return monthlyPrompt();
      // Compare the entire finite schedule, not the preview. Unknown count policies
      // remain alternatives; an answered policy must constrain this comparison.
      const scheduleFor = (
        shortMonth: MonthlyCadence["shortMonth"],
        past: "consume" | "upcoming" | undefined,
        excluded: "consume" | "replace" | undefined,
      ): { ok: true; dates: string[]; fulfilled: boolean } | RecurrenceFailure => {
        const rule = { ...monthlyRule, shortMonth };
        const from =
          past === "consume" || Temporal.PlainDate.compare(beginning, today) > 0
            ? beginning
            : today;
        let candidate = nextMonthlyDate(from, rule);
        let slots = 0;
        const dates: string[] = [];
        while (
          (!ending || Temporal.PlainDate.compare(candidate, ending) <= 0) &&
          candidate.year <= 9999
        ) {
          const key = candidate.toString();
          const isExcluded = exceptions.includes(key);
          let isPast = Temporal.PlainDate.compare(candidate, today) < 0;
          if (candidate.equals(today) && (!isExcluded || excluded === "consume")) {
            const instants = (["earlier", "later"] as const).map(
              (policy) =>
                zonedLocal(candidate.toPlainDateTime(startTime), options.timezone, policy)
                  .epochMilliseconds,
            );
            if (instants.every((instant) => instant < validated.result.timestamp)) isPast = true;
            else if (instants.some((instant) => instant < validated.result.timestamp)) {
              const resolved = resolveOccurrence(
                candidate,
                { pointClock: pointClock ?? rangeStart },
                options,
              );
              if (!resolved.ok) return resolved;
              isPast = resolved.occurrence.start.result.timestamp < validated.result.timestamp;
            }
          }
          if ((!isPast || past === "consume") && (!isExcluded || excluded === "consume")) {
            slots++;
            if (!isPast && !isExcluded) dates.push(key);
            if (count && slots === count) break;
          }
          candidate = nextMonthlyDate(candidate.add({ days: 1 }), rule);
        }
        return { ok: true, dates, fulfilled: !count || slots === count };
      };
      const pastPolicies =
        pastStart && !countPast ? (["consume", "upcoming"] as const) : [countPast];
      const exclusionPolicies =
        count && exceptions.length && !countExclusions
          ? (["consume", "replace"] as const)
          : [countExclusions];
      for (const past of pastPolicies) {
        for (const excluded of exclusionPolicies) {
          const skipped = scheduleFor("skip", past, excluded);
          if (!skipped.ok) return skipped;
          const clamped = scheduleFor("last-day", past, excluded);
          if (!clamped.ok) return clamped;
          if (
            skipped.fulfilled !== clamped.fulfilled ||
            skipped.dates.length !== clamped.dates.length ||
            skipped.dates.some((date, index) => date !== clamped.dates[index])
          )
            return monthlyPrompt();
        }
      }
    }
    if (pastStart && !countPast) {
      return {
        ok: false,
        error: {
          code: "syntax",
          message: "Does the count include starts before the reference time?",
          hint: "The written start still anchors the schedule. Only future events can be exported.",
        },
        policyPrompt: {
          question: "Does the count include starts before the reference time?",
          choices: (["consume", "upcoming"] as const).map((policy) => {
            const id = `count:past:${policy}`;
            const preview = interpretRecurrence(text, {
              ...options,
              complete: undefined,
              limit: 3,
              policyDecisions: [
                ...(options.policyDecisions ?? []).filter(
                  (answer) => !answer.startsWith("count:past:"),
                ),
                id,
              ],
            });
            const dates = preview?.ok
              ? preview.occurrences.map((row) => row.start.result.local.slice(0, 10)).join(", ") ||
                "No future events remain"
              : "Another date or clock choice is needed";
            return {
              id,
              expression: text,
              label: `${policy === "consume" ? "Count from the written start, including past dates" : "Count upcoming starts; keep the written cadence"} · ${dates}${preview?.ok && preview.truncated ? " …" : ""}`,
            };
          }),
        },
      };
    }
    if (count && exceptions.length && !countExclusions) {
      return {
        ok: false,
        error: {
          code: "syntax",
          message: "Do excluded dates use one of the requested occurrences?",
          hint: "Choose whether to keep the original count slots or replace excluded dates. Your text stays unchanged.",
        },
        policyPrompt: {
          question: "Do excluded dates use one of the requested occurrences?",
          choices: (["consume", "replace"] as const).map((policy) => {
            const id = `count:exclusions:${policy}`;
            const preview = interpretRecurrence(text, {
              ...options,
              complete: undefined,
              limit: 3,
              policyDecisions: [
                ...(options.policyDecisions ?? []).filter(
                  (answer) => !answer.startsWith("count:exclusions:"),
                ),
                id,
              ],
            });
            const dates = preview?.ok
              ? preview.occurrences.map((row) => row.start.result.local.slice(0, 10)).join(", ") ||
                "No events remain"
              : "Another date or clock choice is needed";
            return {
              id,
              expression: text,
              label: `${policy === "consume" ? "Count excluded dates; do not replace them" : "Replace excluded dates to keep the event count"} · ${dates}${preview?.ok && preview.truncated ? " …" : ""}`,
            };
          }),
        },
      };
    }
    let date =
      countPast === "consume" || Temporal.PlainDate.compare(beginning, today) > 0
        ? beginning
        : today;
    date = date.add({ days: Math.min(...days.map((day) => (day - date.dayOfWeek + 7) % 7)) });
    const nextWeekday = (current: Temporal.PlainDate) =>
      current.add({ days: Math.min(...days.map((day) => (day - current.dayOfWeek + 7) % 7 || 7)) });
    if (interval > 1 && !starting) {
      // With no written anchor, the first upcoming weekday establishes the cycle.
      // A clock already past today must not anchor an invisible occurrence.
      if (
        date.equals(today) &&
        (["earlier", "later"] as const).every(
          (policy) =>
            zonedLocal(date.toPlainDateTime(startTime), options.timezone, policy)
              .epochMilliseconds < Temporal.Instant.from(options.reference).epochMilliseconds,
        )
      )
        date = nextWeekday(date);
      beginning = date;
    }
    const anchorWeek = beginning.subtract({ days: beginning.dayOfWeek - 1 });
    const alignWeek = (candidate: Temporal.PlainDate) => {
      const phase = Math.floor(candidate.since(anchorWeek).days / 7) % interval;
      if (phase === 0) return candidate;
      return candidate
        .subtract({ days: candidate.dayOfWeek - 1 })
        .add({ days: (interval - phase) * 7 + days[0] - 1 });
    };
    date = monthlyRule ? nextMonthlyDate(date, monthlyRule) : alignWeek(date);
    const nextDate = (current: Temporal.PlainDate) =>
      monthlyRule
        ? nextMonthlyDate(current.add({ days: 1 }), monthlyRule)
        : alignWeek(nextWeekday(current));
    const occurrences: Extract<RecurrenceCandidate, { ok: true }>["occurrences"] = [];
    const clockOverrides: ClockOverride[] = [];
    const reference = Temporal.Instant.from(options.reference).epochMilliseconds;
    let countedStarts = 0;
    for (
      let attempts = 0;
      attempts < (count ? 1012 : options.complete ? 3665 : 512);
      attempts++, date = nextDate(date)
    ) {
      if (ending && Temporal.PlainDate.compare(date, ending) > 0) break;
      if (count && Temporal.PlainDate.compare(date, today.add({ years: 10 })) > 0)
        return invalid(
          "The requested count exceeds the ten-year export window. No partial schedule is available.",
        );
      if (date.year > 9999) return invalid("The preview exceeds the supported calendar range.");
      // Only upcoming starts belong to this result. Check both DST interpretations before
      // asking for a clock choice or resolving an end for an occurrence already in the past.
      if (Temporal.PlainDate.compare(date, today) <= 0) {
        const localStart = date.toPlainDateTime(startTime);
        if (
          (["earlier", "later"] as const).every(
            (disambiguation) =>
              zonedLocal(localStart, options.timezone, disambiguation).epochMilliseconds <
              reference,
          )
        ) {
          if (
            countPast === "consume" &&
            (!exceptions.includes(date.toString()) || countExclusions === "consume")
          ) {
            countedStarts++;
            if (countedStarts === count) break;
          }
          continue;
        }
      }
      if (exceptions.includes(date.toString())) {
        if (countExclusions === "consume") {
          if (
            date.equals(today) &&
            zonedLocal(date.toPlainDateTime(startTime), options.timezone, "earlier")
              .epochMilliseconds < reference
          ) {
            // Resolve only the excluded start's position relative to the reference.
            // Its end is irrelevant: this date must never become an exported event.
            const excluded = resolveOccurrence(
              date,
              { pointClock: pointClock ?? rangeStart },
              options,
            );
            if (!excluded.ok)
              return {
                ...excluded,
                ...(excluded.clockPrompt
                  ? {
                      clockPrompt: {
                        ...excluded.clockPrompt,
                        question: `Excluded date ${date.toString()}: which clock determines its count slot?`,
                      },
                    }
                  : {}),
              };
            clockOverrides.push(...excluded.clockOverrides);
            if (excluded.occurrence.start.result.timestamp < reference) {
              if (countPast !== "consume") continue;
            }
          }
          countedStarts++;
          if (countedStarts === count) break;
        }
        continue;
      }
      const resolved = resolveOccurrence(
        date,
        { pointClock, durationAmount, durationUnit, rangeStart, rangeEnd },
        options,
      );
      if (!resolved.ok) return resolved;
      const { start } = resolved.occurrence;
      clockOverrides.push(...resolved.clockOverrides);
      if (start.result.timestamp < reference) {
        if (countPast === "consume") {
          countedStarts++;
          if (countedStarts === count) break;
        }
        continue;
      }
      occurrences.push(resolved.occurrence);
      countedStarts++;
      if (count && countedStarts === count) break;
      if (occurrences.length > limit) {
        if (options.complete)
          return invalid(
            "Complete export exceeds 1,000 occurrences; no partial file is available.",
          );
        break;
      }
    }
    if (count && countedStarts < count && occurrences.length <= limit)
      return invalid(
        "These boundaries do not contain the requested occurrence count. Change the count or boundary; no partial schedule is available.",
      );
    return {
      ok: true,
      kind: "recurrence",
      timezone: options.timezone,
      rule: {
        ...(monthlyRule ?? {
          frequency: "weekly" as const,
          ...(interval > 1 ? { interval } : {}),
          weekdays: days,
        }),
        startClock: pointClock ?? rangeStart,
        ...(rangeEnd ? { endClock: rangeEnd } : {}),
        ...(durationAmount
          ? { duration: { amount: Number(durationAmount), unit: durationUnit.toLowerCase() } }
          : {}),
        starting: beginning.toString(),
        ...(ending ? { until: ending.toString() } : {}),
        ...(count ? { count } : {}),
        ...(countExclusions ? { countExclusions } : {}),
        ...(countPast ? { countPast } : {}),
        exceptions,
        ...(clockOverrides.length ? { clockOverrides } : {}),
      },
      occurrences: occurrences.slice(0, limit),
      truncated: occurrences.length > limit,
      validation: "preview-only",
    };
  } catch {
    return invalid("A schedule boundary or excluded date is invalid.");
  }
}
