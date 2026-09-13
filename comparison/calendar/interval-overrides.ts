import { Temporal } from "@js-temporal/polyfill";
import { timezoneDatabase } from "../../src/shared/date-engine/timezone-database";
import { zonedInstant, zonedLocal } from "../../src/shared/date-engine/zoned-date";

/** Development candidate, not connected to app export. Exact elapsed durations only.
 * Returns every occurrence containing an offset transition through the explicit
 * supported end, including overlapping occurrences. Never returns a partial set.
 */
export function intervalOverrides(options: {
  timezone: string;
  first: string;
  through: string;
  weekdays: number[];
  durationMilliseconds: number;
  exceptions: string[];
}) {
  const first = zonedInstant(options.first, options.timezone);
  const through = Temporal.Instant.from(options.through).epochMilliseconds;
  if (!Number.isSafeInteger(options.durationMilliseconds) || options.durationMilliseconds <= 0)
    throw new Error("Invalid elapsed duration.");
  if (
    through > Date.parse("9999-12-31T23:59:59Z") ||
    through < first.epochMilliseconds ||
    !options.weekdays.length ||
    options.weekdays.some((day) => !Number.isInteger(day) || day < 1 || day > 7)
  )
    throw new Error("Invalid coverage range or weekdays.");
  const zone = timezoneDatabase(options.timezone);
  if (!zone.footer) throw new Error("Future timezone rules are unavailable.");
  const exclusions = new Set(options.exceptions);
  const clock = first.toPlainDateTime().toPlainTime();
  const firstDate = first.toPlainDate().toString();
  const rows = new Map<string, { local: string; start: string; end: string }>();
  let examined = 0;
  for (let cursor = first.epochMilliseconds / 1000; cursor <= through / 1000;) {
    const end = Math.min(through / 1000, cursor + 10 * 365 * 86400);
    for (const transition of zone.transitionInstants(cursor, end)) {
      const before = zonedInstant(
        new Date((transition - 1) * 1000).toISOString(),
        options.timezone,
      );
      for (const weekday of new Set(options.weekdays)) {
        let date = before.toPlainDate().subtract({ days: (before.dayOfWeek - weekday + 7) % 7 });
        while (date.toString() >= firstDate) {
          if (++examined > 250_000)
            throw new Error("Override candidate work limit exceeded; no partial file.");
          const start = zonedLocal(date.toPlainDateTime(clock), options.timezone);
          const ending = start.epochMilliseconds + options.durationMilliseconds;
          if (ending < transition * 1000) break;
          if (
            start.epochMilliseconds < transition * 1000 &&
            start.epochMilliseconds >= first.epochMilliseconds &&
            !exclusions.has(date.toString())
          ) {
            if (ending > Date.parse("9999-12-31T23:59:59Z"))
              throw new Error("Override end exceeds the calendar range.");
            rows.set(date.toString(), {
              local: start.toPlainDateTime().toString(),
              start: start.toInstant().toString(),
              end: new Date(ending).toISOString(),
            });
          }
          date = date.subtract({ days: 7 });
        }
      }
    }
    cursor = end + 1;
  }
  return { rows: [...rows.values()].sort((a, b) => a.local.localeCompare(b.local)), examined };
}
