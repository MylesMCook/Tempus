import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { calendarTransitionRule } from "../../src/shared/calendar-transition-rule";
import { timezoneData } from "../../src/shared/date-engine/timezone-data";
import { timezoneDatabase } from "../../src/shared/date-engine/timezone-database";

const rules = [
  ...new Set(
    Object.keys(timezoneData.aliases).flatMap((name) =>
      timezoneDatabase(name).footer.split(",").slice(1),
    ),
  ),
];

// Development oracle: compute the named source weekday, then add the signed
// transition clock. Compare with a separate RFC recurrence implementation.
function expected(text: string) {
  const [date, clock = "2"] = text.split("/");
  const [month, week, weekday] = date.slice(1).split(".").map(Number);
  const parts = clock.replace(/^[+-]/, "").split(":").map(Number);
  const seconds =
    (clock.startsWith("-") ? -1 : 1) * (parts[0] * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0));
  const values = [];
  for (let year = 1999; year <= 2400; year++) {
    const candidates = [];
    for (let day = 1; day <= 31; day++) {
      const value = new Date(Date.UTC(year, month - 1, day));
      if (value.getUTCMonth() === month - 1 && value.getUTCDay() === weekday)
        candidates.push(value);
    }
    const source = week === 5 ? candidates.at(-1)! : candidates[week - 1];
    const shifted = new Date(source.getTime() + seconds * 1000);
    if (shifted.getUTCFullYear() >= 2000 && shifted.getUTCFullYear() < 2400)
      values.push(shifted.toISOString().slice(0, 19));
  }
  return values.sort();
}

it.each(rules)("preserves %s across the Gregorian 400-year cycle", (text) => {
  const converted = calendarTransitionRule(text);
  const clock = converted.clock.replace(/(..)(..)(..)/, "$1:$2:$3");
  const values = converted.rules
    .flatMap((rule) => {
      const iterator = ICAL.Recur.fromString(rule).iterator(
        ICAL.Time.fromDateTimeString(`1999-01-01T${clock}`),
      );
      const rows = [];
      for (let i = 0; i < 500; i++) {
        const next = iterator.next();
        if (!next || next.year >= 2400) break;
        if (next.year >= 2000) rows.push(next.toString());
      }
      return rows;
    })
    .sort();
  expect(values).toEqual(expected(text));
});

it("rejects unsupported or malformed date rules explicitly", () => {
  for (const text of ["J60", "M13.1.0", "M3.1.0/168", "M3.1.0/2:60", "M2.4.4/167"])
    expect(() => calendarTransitionRule(text)).toThrow();
});
