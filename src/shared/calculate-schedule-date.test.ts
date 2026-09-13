import { expect, it } from "vite-plus/test";
import { calculateDate } from "./date-parser";
import { calculateScheduleDate } from "./calculate-schedule-date";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
it.each([
  ["Saturday at noon", "2026-09-12T17:00:00.000Z"],
  ["Saturday at 10 am", "2026-09-19T15:00:00.000Z"],
  ["Saturday", "2026-09-12T05:00:00.000Z"],
  ["next Saturday at noon", "2026-09-19T17:00:00.000Z"],
])("uses the declared scheduling policy for %s", (text, iso) => {
  const result = calculateScheduleDate(text, context);
  expect(result.ok).toBe(true);
  if (result.ok) expect(result.result.iso).toBe(iso);
});
it("preserves strict calculator and arithmetic behavior", () => {
  const strict = calculateDate("Saturday at noon", context);
  if (!strict.ok) throw new Error("Expected strict point");
  expect(strict.result.iso).toBe("2026-09-19T17:00:00.000Z");
  const arithmetic = "Saturday plus 1 day";
  expect(calculateScheduleDate(arithmetic, context)).toEqual(calculateDate(arithmetic, context));
});
it("does not skip an unresolved current-day DST clock to get next week's valid answer", () => {
  const result = calculateScheduleDate("Sunday at 1:30 am", {
    ...context,
    reference: "2026-11-01T05:00:00Z",
  });
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.error.code).toBe("ambiguous-time");
});

it("uses today's valid clock even when the strict next-week clock is repeated", () => {
  const result = calculateScheduleDate("Sunday at 1:30 am", {
    ...context,
    reference: "2026-10-25T05:00:00Z",
  });
  expect(result.ok).toBe(true);
  if (result.ok) expect(result.result.iso).toBe("2026-10-25T06:30:00.000Z");
});
