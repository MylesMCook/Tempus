import { timezoneDatabase } from "./date-engine/timezone-database.js";
import { calendarTransitionRule } from "./calendar-transition-rule.js";
import { Temporal } from "@js-temporal/polyfill";

/** Internal candidate: pinned timezone definition from an instant onward.
 * Event recurrence policies and user confirmation belong to the export caller.
 */
export function calendarTimezoneOngoing(timezone: string, from: string): string {
  if (!/^[A-Za-z0-9_+./-]+$/.test(timezone)) throw new Error("Unsupported calendar timezone ID.");
  const first = Temporal.Instant.from(from).epochMilliseconds / 1000;
  if (!Number.isFinite(first)) throw new Error("Invalid timezone coverage start.");
  const zone = timezoneDatabase(timezone);
  if (!zone.footer) throw new Error("No explicit future timezone rule is available.");
  const civil = (seconds: number) => {
    const iso = new Date(seconds * 1000).toISOString();
    if (!/^\d{4}-/.test(iso) || iso.startsWith("0000"))
      throw new Error("Unsupported calendar timezone year.");
    return iso.slice(0, 19).replace(/[-:]/g, "");
  };
  const offset = (seconds: number) => {
    const n = Math.abs(seconds);
    if (n >= 86400) throw new Error("Unsupported calendar timezone offset.");
    const part = (value: number) => String(value).padStart(2, "0");
    return (
      (seconds < 0 ? "-" : "+") +
      part(Math.floor(n / 3600)) +
      part(Math.floor(n / 60) % 60) +
      (n % 60 ? part(n % 60) : "")
    );
  };
  const lines = ["BEGIN:VTIMEZONE", `TZID:${timezone}`];
  const append = (
    instant: number,
    before: number,
    after: number,
    daylight: boolean,
    rule?: string,
  ) => {
    const kind = daylight ? "DAYLIGHT" : "STANDARD";
    lines.push(
      `BEGIN:${kind}`,
      `DTSTART:${civil(instant + before)}`,
      `TZOFFSETFROM:${offset(before)}`,
      `TZOFFSETTO:${offset(after)}`,
      ...(rule ? [`RRULE:${rule}`] : []),
      `END:${kind}`,
    );
  };
  // Include the preceding seasonal cycle so readers can establish the DST
  // adjustment when coverage starts in daylight time (including half-hour DST).
  const historyStart = first - 370 * 86400;
  const baseline = Math.floor(historyStart) - 1;
  append(baseline, zone.offsetAt(baseline), zone.offsetAt(baseline), zone.isDaylightAt(baseline));
  const cutover = zone.futureFrom ?? first;
  let count = 0;
  for (let cursor = historyStart; cursor <= cutover;) {
    const end = Math.min(cutover, cursor + 10 * 365 * 86400);
    for (const instant of zone.transitionInstants(cursor, end)) {
      if (++count > 4096) throw new Error("Too many recorded timezone transitions.");
      append(
        instant,
        zone.offsetAt(instant - 1),
        zone.offsetAt(instant),
        zone.isDaylightAt(instant),
      );
    }
    cursor = end + 1;
  }
  const futureStart = Math.max(historyStart, cutover + 1);
  const year = new Date(futureStart * 1000).getUTCFullYear();
  for (const observance of zone.futureObservances) {
    const converted = calendarTransitionRule(observance.rule);
    // Split rules can occur only in some years (e.g. last Thursday + one day
    // spilling into November). DTSTART must belong to its own recurrence rule.
    for (const rule of converted.rules) {
      const month = Number(/BYMONTH=(\d+)/.exec(rule)![1]);
      let onset: number | undefined;
      for (let y = year - 1; y <= year + 400; y++) {
        const instant = observance.onset(y);
        if (
          instant >= futureStart &&
          new Date((instant + observance.offsetFrom) * 1000).getUTCMonth() + 1 === month
        ) {
          onset = instant;
          break;
        }
      }
      if (onset === undefined) throw new Error("No future timezone onset found.");
      append(onset, observance.offsetFrom, observance.offsetTo, observance.daylight, rule);
    }
  }
  lines.push("END:VTIMEZONE");
  return (
    lines
      .map((line) => {
        // All fields above are ASCII; continuation whitespace counts toward 75 octets.
        let folded = line.slice(0, 75);
        for (let at = 75; at < line.length; at += 74) folded += "\r\n " + line.slice(at, at + 74);
        return folded;
      })
      .join("\r\n") + "\r\n"
  );
}
