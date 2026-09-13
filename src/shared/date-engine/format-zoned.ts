import { Temporal } from "@js-temporal/polyfill";
import { zonedInstant, type ZonedDate } from "./zoned-date.js";

// Cache formatting machinery only. Every label still checks this instant against pinned data.
const labelFormatters = new Map<string, Intl.DateTimeFormat>();
const civilFormatters = new Map<number, Intl.DateTimeFormat>();

/** Use host language labels only when its civil fields agree with pinned timezone data. */
export function timezoneLabel(value: ZonedDate, style: "short" | "long"): string {
  try {
    const key = `${value.timeZoneId}:${style}`;
    let formatter = labelFormatters.get(key);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: value.timeZoneId,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hourCycle: "h23",
        timeZoneName: style,
      });
      if (labelFormatters.size >= 32) labelFormatters.delete(labelFormatters.keys().next().value!);
      labelFormatters.set(key, formatter);
    }
    const parts = formatter.formatToParts(value.epochMilliseconds);
    const local = value.toPlainDateTime();
    const keys = ["year", "month", "day", "hour", "minute", "second"] as const;
    if (
      keys.every((key) => Number(parts.find((part) => part.type === key)?.value) === local[key])
    ) {
      const label = parts.find((part) => part.type === "timeZoneName")?.value;
      if (label) return label;
    }
  } catch {
    /* Pinned numeric offset remains usable when the host lacks this zone. */
  }
  return `GMT${value.offset}`;
}

export function describeZonedInstant(timestamp: number, timezone: string): string {
  const value = zonedInstant(Temporal.Instant.fromEpochMilliseconds(timestamp), timezone);
  const civil = new Date(timestamp + value.offsetSeconds * 1000);
  const precision = timestamp % 1000 ? 3 : value.toPlainDateTime().second ? 1 : 0;
  let formatter = civilFormatters.get(precision);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      ...(precision ? { second: "2-digit" as const } : {}),
      ...(precision === 3 ? { fractionalSecondDigits: 3 as const } : {}),
    });
    civilFormatters.set(precision, formatter);
  }
  const formatted = formatter.format(civil);
  return `${formatted} ${timezoneLabel(value, "short")}`;
}
