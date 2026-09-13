import { longFormatters } from "date-fns/format";
import { enUS } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { Temporal } from "@js-temporal/polyfill";
import { zonedInstant } from "./date-engine/zoned-date.js";
import { timezoneLabel } from "./date-engine/format-zoned.js";

/** Existing date-fns formats, with calendar fields and offsets from the pinned database. */
export function formatPinnedDate(date: Date, timezone: string, pattern: string): string {
  const value = zonedInstant(Temporal.Instant.fromEpochMilliseconds(date.getTime()), timezone);
  const civil = new Date(date.getTime() + value.offsetSeconds * 1000);
  // Expand date-fns localized formats before handling offset and timestamp tokens.
  const expanded = (pattern.match(/P+p+|P+|p+|''|'(''|[^'])+('|$)|./g) ?? [])
    .map((token) =>
      token[0] === "P" || token[0] === "p"
        ? longFormatters[token[0]](token, enUS.formatLong).replace(/z{1,4}/g, (zone) =>
            zone.length < 4 ? "O" : "OOOO",
          )
        : token,
    )
    .join("");
  const tokens = expanded.match(/[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g) ?? [];
  return tokens
    .map((token) => {
      if (token === "''") return "'";
      if (token.startsWith("'"))
        return token.slice(1, token.endsWith("'") ? -1 : undefined).replaceAll("''", "'");
      if (/^[tT]+$/.test(token)) {
        const timestamp = token[0] === "t" ? Math.floor(date.getTime() / 1000) : date.getTime();
        return `${timestamp < 0 ? "-" : ""}${String(Math.abs(timestamp)).padStart(token.length, "0")}`;
      }
      if (/^z+$/.test(token)) return timezoneLabel(value, token.length < 4 ? "short" : "long");
      if (/^O+$/.test(token)) {
        const short = value.offset.replace(/^([+-])0/, "$1").replace(/:00$/, "");
        return `GMT${token.length < 4 ? short : value.offset}`;
      }
      if (/^[Xx]+$/.test(token)) {
        if (token[0] === "X" && !value.offsetSeconds) return "Z";
        const offset = token.length < 4 ? value.offset.slice(0, 6) : value.offset;
        if (token.length === 1)
          return offset.endsWith(":00") ? offset.slice(0, 3) : offset.replaceAll(":", "");
        if (token.length === 2 || token.length === 4) return offset.replaceAll(":", "");
        return offset;
      }
      return formatInTimeZone(civil, "UTC", token);
    })
    .join("");
}
