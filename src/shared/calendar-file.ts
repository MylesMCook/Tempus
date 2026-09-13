import { Temporal } from "@js-temporal/polyfill";
import type { Interpretation } from "./interpret-date.js";
import type { CalculationSuccess } from "./date-parser.js";

export type CalendarFileFailureCode =
  | "unresolved"
  | "recurrence-required"
  | "point-mode-required"
  | "clarification-required"
  | "export-blocked"
  | "empty-schedule"
  | "invalid-file";

export type CalendarFile =
  | { ok: true; text: string; eventCount: number; mimeType: "text/calendar;charset=utf-8" }
  | { ok: false; code: CalendarFileFailureCode; reason: string };

function escapeText(value: string): string {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if ((code < 32 && ![9, 10, 13].includes(code)) || code === 127)
      throw new Error("Calendar text contains an unsupported control character.");
  }
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

// Fold by UTF-8 octets, retaining whole Unicode scalars and counting the continuation space.
function fold(line: string): string {
  let output = "";
  let bytes = 0;
  for (const char of line) {
    const code = char.codePointAt(0)!;
    if (code >= 0xd800 && code <= 0xdfff)
      throw new Error("Calendar text contains invalid Unicode.");
    const width = code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
    if (bytes + width > 75) {
      output += "\r\n ";
      bytes = 1;
    }
    output += char;
    bytes += width;
  }
  return output;
}
function utc(iso: string, metadata = false): string {
  const instant = Temporal.Instant.from(iso);
  if (!metadata && instant.epochNanoseconds % 1_000_000_000n !== 0n)
    throw new Error(
      "Calendar export cannot preserve fractions of a second. Choose a whole-second time.",
    );
  const value = instant.toString({ smallestUnit: "second", roundingMode: "floor" });
  if (!/^\d{4}-/.test(value) || value.startsWith("0000-"))
    throw new Error("Calendar dates must use years 0001–9999.");
  return value.replace(/[-:]/g, "");
}
function dateValue(calculation: CalculationSuccess): string {
  return Temporal.PlainDate.from(calculation.result.local.slice(0, 10))
    .toString()
    .replace(/-/g, "");
}

/** Internal file preparation only. No clock reads, downloads, network or calendar writes. */
export function prepareCalendarFile(
  interpretation: Interpretation,
  options: { uid: string; stamp: string; title: string; pointMode?: "date" | "instant" },
): CalendarFile {
  if (interpretation.status !== "resolved")
    return { ok: false, code: "unresolved", reason: "Resolve the date before exporting it." };
  if (interpretation.value.kind === "recurrence")
    return {
      ok: false,
      code: "recurrence-required",
      reason:
        "Recurrence export still needs timezone and rule validation. A preview cannot replace the full schedule.",
    };
  if (interpretation.value.kind === "point" && !options.pointMode)
    return {
      ok: false,
      code: "point-mode-required",
      reason: "Choose an all-day date or an exact-time event before exporting this point.",
    };
  try {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(options.uid))
      throw new Error("Provide a unique UUID for this calendar file.");
    if (!options.title.trim() || options.title.length > 2000)
      throw new Error("Provide a calendar title of 1–2000 characters.");
    if (options.pointMode !== undefined && !["date", "instant"].includes(options.pointMode))
      throw new Error("Choose a supported point format.");
    const stamp = utc(options.stamp, true);
    const value = interpretation.value;
    const events: { start: CalculationSuccess; end?: CalculationSuccess; allDay: boolean }[] =
      value.kind === "point"
        ? [{ start: value.calculation, allDay: options.pointMode === "date" }]
        : value.kind === "interval"
          ? [value]
          : value.occurrences.map((row) => ({ ...row, allDay: "allDay" in row && row.allDay }));
    if (!events.length || events.length > 14)
      throw new Error("Export requires 1–14 complete events.");
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Tempus//Calendar Export//EN",
      "CALSCALE:GREGORIAN",
    ];
    for (const [index, event] of events.entries()) {
      if (event.end && event.end.result.timestamp <= event.start.result.timestamp)
        throw new Error("The calendar end must follow its start.");
      lines.push(
        "BEGIN:VEVENT",
        `UID:${options.uid}-${index}@tempus.invalid`,
        `DTSTAMP:${stamp}`,
        `SUMMARY:${escapeText(options.title)}`,
        `DESCRIPTION:${escapeText([`Date phrase: ${interpretation.source.text}`, `Timezone: ${event.start.timezone}`, ...interpretation.assumptions].join("\n"))}`,
        event.allDay
          ? `DTSTART;VALUE=DATE:${dateValue(event.start)}`
          : `DTSTART:${utc(event.start.result.iso)}`,
      );
      if (event.end)
        lines.push(
          event.allDay
            ? `DTEND;VALUE=DATE:${dateValue(event.end)}`
            : `DTEND:${utc(event.end.result.iso)}`,
        );
      lines.push("END:VEVENT");
    }
    lines.push("END:VCALENDAR");
    return {
      ok: true,
      text: lines.map(fold).join("\r\n") + "\r\n",
      eventCount: events.length,
      mimeType: "text/calendar;charset=utf-8",
    };
  } catch (error) {
    return {
      ok: false,
      code: "invalid-file",
      reason: error instanceof Error ? error.message : "Could not prepare this calendar file.",
    };
  }
}
