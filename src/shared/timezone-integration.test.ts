import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { formatInTimeZone } from "date-fns-tz";
import { calculateDate } from "./date-parser";
import { interpretDate } from "./interpret-date";
import { prepareCalendarFile } from "./calendar-file";
import { buildParseResponse } from "./parse-api";
import { formatPinnedDate } from "./format-date";

const context = { timezone: "America/Yellowknife", reference: "2026-09-12T16:00:00Z" };
it("keeps the updated timezone consistent from reminder through API formatting and file output", () => {
  const expression = "December 1, 2026 at noon";
  const calculation = calculateDate(expression, context);
  expect(calculation).toMatchObject({
    ok: true,
    result: { iso: "2026-12-01T18:00:00.000Z", local: "2026-12-01T12:00:00.000", offset: "-06:00" },
  });
  const api = buildParseResponse(
    { ...context, expression, format: "yyyy-MM-dd HH:mm XXX" },
    "timezone-check",
  );
  expect(api).toMatchObject({ status: 200, body: { formatted: "2026-12-01 12:00 -06:00" } });
  const input = `Remind me to call Sam ${expression} for 1 hour`;
  const result = interpretDate(input, context);
  expect(result).toMatchObject({
    status: "resolved",
    event: { text: "call Sam" },
    value: { kind: "interval" },
  });
  const file = prepareCalendarFile(result, {
    uid: "11111111-2222-4333-8444-555555555555",
    stamp: context.reference,
    title: "call Sam",
  });
  if (!file.ok) throw new Error(file.reason);
  const event = new ICAL.Event(
    new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!,
  );
  expect(event.startDate.toJSDate().toISOString()).toBe("2026-12-01T18:00:00.000Z");
  expect(event.endDate.toJSDate().toISOString()).toBe("2026-12-01T19:00:00.000Z");
  expect(event.description).toContain(expression);
});

it("reports unavailable history as a timezone problem rather than a clock correction", () => {
  const result = calculateDate("January 15, 1900 at noon", {
    timezone: "Antarctica/Casey",
    reference: context.reference,
  });
  expect(result).toMatchObject({
    ok: false,
    error: {
      code: "timezone",
      message: "Timezone data is unavailable for this historical period.",
    },
  });
});

it.each([
  "EEEE, MMMM d, yyyy",
  "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
  "do 'of' MMMM",
  "h 'o''clock' a",
  "yyyy 'z X t P' XXX",
  "X XX XXX XXXX XXXXX x xx xxx xxxx xxxxx",
  "O OOOO zzz zzzz",
  "RRRR-'W'II-i",
])("preserves custom format behavior for %s where timezone data agrees", (format) => {
  for (const iso of [
    "2026-11-01T06:30:00.123Z",
    "2026-11-01T07:30:00.456Z",
    "1969-12-31T23:59:59.999Z",
  ]) {
    const date = new Date(iso);
    expect(formatPinnedDate(date, "America/Chicago", format)).toBe(
      formatInTimeZone(date, "America/Chicago", format),
    );
  }
});

it("formats the actual instant instead of collapsing a repeated clock in timestamp tokens", () => {
  const date = new Date("2026-11-01T07:30:00.456Z");
  expect(formatPinnedDate(date, "America/Chicago", "t T")).toBe("1793518200 1793518200456");
  expect(formatPinnedDate(new Date(-1), "America/Chicago", "ttt TTT")).toBe("-001 -001");
  expect(formatPinnedDate(date, "America/Chicago", "PPPPpppp")).toBe(
    "Sunday, November 1st, 2026 at 1:30:00 AM GMT-06:00",
  );
  expect(formatPinnedDate(new Date("2026-11-01T06:30:00Z"), "America/Chicago", "PPPPpppp")).toBe(
    "Sunday, November 1st, 2026 at 1:30:00 AM GMT-05:00",
  );
});
