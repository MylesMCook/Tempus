import { zonedInstant, zonedLocal } from "./date-engine/zoned-date.js";
import { timezoneDatabase } from "./date-engine/timezone-database.js";
import { Temporal } from "@js-temporal/polyfill";

/** Internal VTIMEZONE preparation for an explicitly bounded export, not an unbounded zone rule. */
export function calendarTimezone(timezone: string, from: string, through: string): string {
  if (!/^[A-Za-z0-9_+./-]+$/.test(timezone)) throw new Error("Unsupported calendar timezone ID.");
  const first = Temporal.Instant.from(from);
  const last = Temporal.Instant.from(through);
  if (Temporal.Instant.compare(first, last) > 0) throw new Error("Timezone coverage is reversed.");
  const initial = zonedInstant(first, timezone);
  const end = zonedInstant(last, timezone);
  if (
    Temporal.Instant.compare(
      last,
      zonedLocal(initial.toPlainDateTime().add({ years: 10 }), timezone, "compatible").toInstant(),
    ) > 0
  )
    throw new Error("Timezone coverage is limited to ten calendar years.");
  const local = (value: Temporal.PlainDateTime) => {
    if (value.year < 1 || value.year > 9999)
      throw new Error("Calendar timezone years must be 0001–9999.");
    return value.toString({ smallestUnit: "second" }).replace(/[-:]/g, "");
  };
  const offset = (value: string) => value.replace(/:/g, "");
  // The baseline is one second before coverage so a transition exactly at the first instant is included.
  const cursor = zonedInstant(first.subtract({ seconds: 1 }), timezone);
  const lines = [
    "BEGIN:VTIMEZONE",
    `TZID:${timezone}`,
    "BEGIN:STANDARD",
    `DTSTART:${local(cursor.toPlainDateTime())}`,
    `TZOFFSETFROM:${offset(cursor.offset)}`,
    `TZOFFSETTO:${offset(cursor.offset)}`,
    "END:STANDARD",
  ];
  const transitions = timezoneDatabase(timezone).transitionInstants(
    first.epochMilliseconds / 1000,
    last.epochMilliseconds / 1000,
  );
  if (transitions.length > 64) throw new Error("Too many timezone transitions for one export.");
  for (const timestamp of transitions) {
    const next = zonedInstant(Temporal.Instant.fromEpochMilliseconds(timestamp * 1000), timezone);
    const before = next.addElapsed({ seconds: -1 });
    // DTSTART is expressed using the offset before the change, as required for observances.
    const onset = before.toPlainDateTime().add({ seconds: 1 });
    // STANDARD observances encode explicit offset changes; no inferred annual DST rule or TZNAME.
    lines.push(
      "BEGIN:STANDARD",
      `DTSTART:${local(onset)}`,
      `TZOFFSETFROM:${offset(before.offset)}`,
      `TZOFFSETTO:${offset(next.offset)}`,
      "END:STANDARD",
    );
  }
  // Validate the end even for fixed-offset zones with no transitions.
  local(end.toPlainDateTime());
  lines.push("END:VTIMEZONE");
  return lines.join("\r\n") + "\r\n";
}
