import { monthlyDate, type MonthlyCadence } from "./monthly-date.js";
import { Temporal } from "@js-temporal/polyfill";
import { calculateDate } from "./date-parser.js";
import { timezoneDatabase } from "./date-engine/timezone-database.js";
import { zonedLocal, zonedInstant } from "./date-engine/zoned-date.js";

type WeeklyClock = {
  timezone: string;
  reference: string;
  weekdays: number[];
  clock: string;
  exceptions: string[];
  interval?: number;
  weekAnchor?: string;
};

type RecurringClock =
  | WeeklyClock
  | (Omit<WeeklyClock, "weekdays" | "interval" | "weekAnchor"> & {
      monthly: MonthlyCadence;
      dayShift?: number;
    });

function cadence(options: RecurringClock) {
  if ("monthly" in options) return { interval: 1, phase: (_date: Temporal.PlainDate) => 0 };
  const interval = options.interval ?? 1;
  if (!Number.isInteger(interval) || interval < 1 || interval > 52)
    throw new Error("Invalid weekly interval.");
  const firstDate = zonedInstant(options.reference, options.timezone).toPlainDate();
  const anchor = options.weekAnchor
    ? Temporal.PlainDate.from(options.weekAnchor)
    : firstDate.subtract({ days: firstDate.dayOfWeek - 1 });
  return {
    interval,
    phase: (date: Temporal.PlainDate) =>
      ((Math.floor(date.since(anchor).days / 7) % interval) + interval) % interval,
  };
}

function* futureTransitions(options: RecurringClock) {
  const zone = timezoneDatabase(options.timezone);
  if (!zone.footer) throw new Error("Future timezone rules are unavailable.");
  const first = Temporal.Instant.from(options.reference).epochMilliseconds / 1000;
  const { interval } = cadence(options);
  // 400 Gregorian years contain 20,871 weeks. The calendar and N-week
  // phase recur together only after N/gcd(N,20871) such cycles.
  let a = interval,
    b = 20871;
  while (b) [a, b] = [b, a % b];
  const cycleYears = 400 * (interval / a);
  const futureYear = Math.max(
    new Date(Math.max(first, zone.futureFrom ?? first) * 1000).getUTCFullYear(),
    ...options.exceptions.map((date) => Temporal.PlainDate.from(date).year + 1),
  );
  const through =
    Date.parse(`${Math.min(9999, futureYear + cycleYears + 1)}-12-31T23:59:59Z`) / 1000;
  for (let cursor = first - 2 * 86400; cursor <= through;) {
    const end = Math.min(through, cursor + 10 * 365 * 86400);
    yield* zone.transitionInstants(cursor, end);
    cursor = end + 1;
  }
}

/** Requires separate start-clock conflict validation. Returns the first offset
 * change inside an occurrence, including an end exactly at the change.
 */
export function recurrenceIntervalConflict(
  options: RecurringClock & { durationMilliseconds: number },
): string | null {
  if (!Number.isSafeInteger(options.durationMilliseconds) || options.durationMilliseconds <= 0)
    throw new Error("Invalid recurrence duration.");
  const { interval, phase } = cadence(options);
  const first = zonedInstant(options.reference, options.timezone);
  const clock = first.toPlainDateTime().toPlainTime();
  const exclusions = new Set(options.exceptions);
  const firstDate = first.toPlainDate().toString();
  for (const transition of futureTransitions(options)) {
    if (transition * 1000 <= first.epochMilliseconds) continue;
    const before = zonedInstant(new Date((transition - 1) * 1000).toISOString(), options.timezone);
    if ("monthly" in options) {
      // Search backward by whole months so a February clamp cannot change the
      // written day. Include excluded dates and a same-day start after the transition.
      let month = before.toPlainDate().with({ day: 1 });
      for (
        let attempt = 0;
        attempt < 13 * (exclusions.size + 2);
        attempt++, month = month.subtract({ months: 1 })
      ) {
        const date = monthlyDate(month, options.monthly);
        if (!date) continue;
        if (date.toString() < firstDate) break;
        if (exclusions.has(date.toString())) continue;
        const start = zonedLocal(date.toPlainDateTime(clock), options.timezone);
        if (start.epochMilliseconds >= transition * 1000) continue;
        // Earlier starts of the same elapsed duration cannot end later.
        if (
          start.epochMilliseconds >= first.epochMilliseconds &&
          start.epochMilliseconds + options.durationMilliseconds >= transition * 1000
        )
          return new Date(transition * 1000).toISOString();
        break;
      }
      continue;
    }
    for (const weekday of options.weekdays) {
      let date = before.toPlainDate().subtract({ days: (before.dayOfWeek - weekday + 7) % 7 });
      date = date.subtract({ days: phase(date) * 7 });
      // The closest non-excluded active occurrence of each weekday is sufficient:
      // earlier equal-duration occurrences cannot end later.
      for (
        let skipped = 0;
        skipped <= exclusions.size + 1 && date.toString() >= firstDate;
        skipped++
      ) {
        if (!exclusions.has(date.toString())) {
          const start = zonedLocal(date.toPlainDateTime(clock), options.timezone);
          if (start.epochMilliseconds < transition * 1000) {
            if (
              start.epochMilliseconds >= first.epochMilliseconds &&
              start.epochMilliseconds + options.durationMilliseconds >= transition * 1000
            )
              return new Date(transition * 1000).toISOString();
            break;
          }
        }
        date = date.subtract({ days: interval * 7 });
      }
    }
  }
  return null;
}

/** First future gap/repeat in a weekly or monthly clock rule, beyond its display preview.
 * Checks recorded history and a Gregorian cycle of explicit future rules.
 * This does not choose an occurrence or validate interval duration/export.
 */
export function recurrenceClockConflict(
  options: RecurringClock,
): { local: string; choices: string[] } | null {
  const { phase } = cadence(options);
  const zone = timezoneDatabase(options.timezone);
  if (!zone.footer) throw new Error("Future timezone rules are unavailable.");
  if (
    !("monthly" in options) &&
    (!options.weekdays.length ||
      options.weekdays.some((day) => !Number.isInteger(day) || day < 1 || day > 7))
  )
    throw new Error("Invalid recurrence weekdays.");
  const time = calculateDate(`2000-01-01 at ${options.clock}`, {
    timezone: "UTC",
    reference: options.reference,
  });
  if (!time.ok) throw new Error(time.error.message);
  const clock = Temporal.PlainTime.from(time.result.local.slice(11));
  const first = Temporal.Instant.from(options.reference).epochMilliseconds / 1000;
  const exclusions = new Set(options.exceptions);
  // A repeat can still have a future occurrence after its transition instant.
  for (const instant of futureTransitions(options)) {
    const before = zone.offsetAt(instant - 1),
      after = zone.offsetAt(instant);
    const low = Math.min(instant + before, instant + after);
    const high = Math.max(instant + before, instant + after);
    let date = Temporal.PlainDate.from(new Date(low * 1000).toISOString().slice(0, 10));
    const last = Temporal.PlainDate.from(
      new Date((high - 0.001) * 1000).toISOString().slice(0, 10),
    );
    while (Temporal.PlainDate.compare(date, last) <= 0) {
      const occurrenceDate =
        "monthly" in options ? date.subtract({ days: options.dayShift ?? 0 }) : date;
      const local = date.toPlainDateTime(clock);
      const civil = Date.parse(local.toString() + "Z") / 1000;
      if (
        civil >= low &&
        civil < high &&
        ("monthly" in options
          ? monthlyDate(occurrenceDate, options.monthly)?.equals(occurrenceDate)
          : options.weekdays.includes(date.dayOfWeek)) &&
        phase(date) === 0 &&
        !exclusions.has(occurrenceDate.toString())
      ) {
        const choices = ["earlier", "later"].map((policy) =>
          zonedLocal(local, options.timezone, policy as "earlier" | "later")
            .toInstant()
            .toString(),
        );
        if (choices.some((choice) => Date.parse(choice) / 1000 >= first))
          return { local: local.toString(), choices };
      }
      date = date.add({ days: 1 });
    }
  }
  return null;
}
