import { Temporal } from "@js-temporal/polyfill";

export type MonthlyCadence = {
  frequency: "monthly";
  dayOfMonth: number;
  shortMonth: "skip" | "last-day";
  weekdays?: never;
  interval?: never;
};

/** Preserve the written day when moving across a short month. */
export function monthlyDate(month: Temporal.PlainDate, rule: MonthlyCadence) {
  if (!Number.isInteger(rule.dayOfMonth) || rule.dayOfMonth < 1 || rule.dayOfMonth > 31)
    throw new Error("Invalid monthly day.");
  if (rule.shortMonth !== "skip" && rule.shortMonth !== "last-day")
    throw new Error("Invalid short-month choice.");
  if (rule.dayOfMonth > month.daysInMonth && rule.shortMonth === "skip") return null;
  return month.with({ day: Math.min(rule.dayOfMonth, month.daysInMonth) });
}

export function nextMonthlyDate(from: Temporal.PlainDate, rule: MonthlyCadence) {
  let month = from.with({ day: 1 });
  for (let attempts = 0; attempts < 13; attempts++, month = month.add({ months: 1 })) {
    const candidate = monthlyDate(month, rule);
    if (candidate && Temporal.PlainDate.compare(candidate, from) >= 0) return candidate;
  }
  throw new Error("No monthly date could be selected.");
}
