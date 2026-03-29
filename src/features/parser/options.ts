import { formatInTimeZone } from "date-fns-tz";

export const dateFormatOptions = [
  { label: "Weekday, month day, year", value: "EEEE, MMMM d, yyyy" },
  { label: "Month day, year", value: "MMMM d, yyyy" },
  { label: "Short month day, year", value: "MMM d, yyyy" },
  { label: "Numeric", value: "MM/dd/yyyy" },
  { label: "ISO date", value: "yyyy-MM-dd" },
  { label: "Custom format", value: "custom" },
] as const;

export const timezoneOptions = [
  { label: "Browser default", value: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" },
  { label: "UTC", value: "UTC" },
  { label: "US Central", value: "America/Chicago" },
  { label: "US Eastern", value: "America/New_York" },
  { label: "US Pacific", value: "America/Los_Angeles" },
  { label: "London", value: "Europe/London" },
  { label: "Tokyo", value: "Asia/Tokyo" },
] as const;

export function safeFormatDate(date: Date, timezone: string, format: string) {
  try {
    return formatInTimeZone(date, timezone, format);
  } catch {
    return date.toISOString();
  }
}
