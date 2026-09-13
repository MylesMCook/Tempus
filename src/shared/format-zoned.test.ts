import { expect, it, vi } from "vite-plus/test";
import { describeZonedInstant, timezoneLabel } from "./date-engine/format-zoned";
import { zonedInstant } from "./date-engine/zoned-date";

it("keeps repeated-clock choices distinct after warming the formatters", () => {
  const earlier = Date.parse("2026-11-01T06:30:00Z");
  const later = Date.parse("2026-11-01T07:30:00Z");
  for (const timestamp of [earlier, later, earlier]) {
    const label = describeZonedInstant(timestamp, "America/Chicago");
    expect(label).toContain("November 1, 2026 at 1:30 AM");
    expect(label).toMatch(timestamp === earlier ? /(?:CDT|GMT-05:00)$/ : /(?:CST|GMT-06:00)$/);
  }
});

it("retains milliseconds and seconds when precision changes between calls", () => {
  for (const [iso, clock] of [
    ["2026-11-01T07:30:00Z", "1:30 AM"],
    ["2026-11-01T07:30:15.123Z", "1:30:15.123 AM"],
    ["2026-11-01T07:30:15Z", "1:30:15 AM"],
    ["2026-11-01T07:30:00Z", "1:30 AM"],
  ])
    expect(describeZonedInstant(Date.parse(iso), "America/Chicago")).toContain(clock);
});

it("rechecks pinned civil fields even when a host formatter is already cached", () => {
  const date = zonedInstant("2026-11-01T07:30:00Z", "America/Chicago");
  timezoneLabel(date, "short");
  const parts = vi.spyOn(Intl.DateTimeFormat.prototype, "formatToParts").mockReturnValue([
    { type: "year", value: "1900" },
    { type: "timeZoneName", value: "Incorrect host label" },
  ]);
  try {
    expect(timezoneLabel(date, "short")).toBe("GMT-06:00");
  } finally {
    parts.mockRestore();
  }
});
