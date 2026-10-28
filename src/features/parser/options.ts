import { timezoneData } from "../../shared/date-engine/timezone-data";
import { formatPinnedDate } from "../../shared/format-date";

export const dateFormatOptions = [
  { label: "Weekday, month day, year", value: "EEEE, MMMM d, yyyy" },
  { label: "Month day, year", value: "MMMM d, yyyy" },
  { label: "Short month day, year", value: "MMM d, yyyy" },
  { label: "Numeric", value: "MM/dd/yyyy" },
  { label: "ISO date", value: "yyyy-MM-dd" },
  { label: "Custom format", value: "custom" },
] as const;

export const timezoneOptions = [
  { label: "UTC", value: "UTC" },
  { label: "US Central (America/Chicago)", value: "America/Chicago" },
  { label: "US Eastern (America/New_York)", value: "America/New_York" },
  { label: "US Pacific (America/Los_Angeles)", value: "America/Los_Angeles" },
  { label: "London (Europe/London)", value: "Europe/London" },
  { label: "Tokyo (Asia/Tokyo)", value: "Asia/Tokyo" },
  // Bundled data, not Intl.supportedValuesOf, so server and browser render the same list.
  ...Object.keys(timezoneData.aliases)
    .filter((name) =>
      /^(Africa|America|Antarctica|Asia|Atlantic|Australia|Europe|Indian|Pacific)\//.test(name),
    )
    .sort()
    .map((name) => ({ label: name, value: name })),
].filter(
  (option, index, options) => options.findIndex((entry) => entry.value === option.value) === index,
);

export function safeFormatDate(date: Date, timezone: string, format: string) {
  try {
    if (!format.trim()) return null;
    return formatPinnedDate(date, timezone, format);
  } catch {
    return null;
  }
}

/** Preserve calculated clock precision while keeping minute-aligned times compact. */
export function resultClockFormat(local: string) {
  return /\.\d*[1-9]/.test(local)
    ? "h:mm:ss.SSS a zzz"
    : local.slice(17, 19) !== "00"
      ? "h:mm:ss a zzz"
      : "h:mm a zzz";
}
