import { formatInTimeZone } from "date-fns-tz";

export const dateFormatOptions = [
  { label: "Weekday, month day, year", value: "EEEE, MMMM d, yyyy" },
  { label: "Month day, year", value: "MMMM d, yyyy" },
  { label: "Short month day, year", value: "MMM d, yyyy" },
  { label: "Numeric", value: "MM/dd/yyyy" },
  { label: "ISO date", value: "yyyy-MM-dd" },
  { label: "Custom format", value: "custom" },
] as const;

const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export const timezoneOptions = [
  { label: `Browser default (${browserTimezone})`, value: browserTimezone },
  { label: "UTC", value: "UTC" },
  { label: "US Central", value: "America/Chicago" },
  { label: "US Eastern", value: "America/New_York" },
  { label: "US Pacific", value: "America/Los_Angeles" },
  { label: "London", value: "Europe/London" },
  { label: "Tokyo", value: "Asia/Tokyo" },
].filter(
  (option, index, options) => options.findIndex((entry) => entry.value === option.value) === index,
);

export function safeFormatDate(date: Date, timezone: string, format: string) {
  try {
    if (!format.trim()) return null;
    return formatInTimeZone(date, timezone, format);
  } catch {
    return null;
  }
}
