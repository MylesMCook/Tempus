import type { Unit } from "./types.js";

const aliases: Record<string, Unit> = {
  y: "year",
  yr: "year",
  yrs: "year",
  mo: "month",
  mos: "month",
  w: "week",
  wk: "week",
  wks: "week",
  d: "day",
  h: "hour",
  hr: "hour",
  hrs: "hour",
  m: "minute",
  min: "minute",
  mins: "minute",
  s: "second",
  sec: "second",
  secs: "second",
  ms: "millisecond",
};
export function timeUnit(value?: string): { unit: Unit; factor: bigint } | undefined {
  if (!value) return;
  const plain = value.replace(/s$/, "");
  if (plain === "fortnight") return { unit: "day", factor: 14n };
  if (plain === "quarter" || plain === "qtr") return { unit: "month", factor: 3n };
  const unit = Object.hasOwn(aliases, value) ? aliases[value] : plain;
  if (["year", "month", "week", "day", "hour", "minute", "second", "millisecond"].includes(unit))
    return { unit: unit as Unit, factor: 1n };
}
export const weekdayAliases: Record<string, string> = {
  sun: "sunday",
  mon: "monday",
  tue: "tuesday",
  tues: "tuesday",
  wed: "wednesday",
  thu: "thursday",
  thur: "thursday",
  thurs: "thursday",
  fri: "friday",
  sat: "saturday",
};
