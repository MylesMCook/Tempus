import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { calendarTimezoneOngoing } from "../../src/shared/calendar-timezone-ongoing";
import { timezoneDatabase } from "../../src/shared/date-engine/timezone-database";

it.each([
  "America/Chicago",
  "Africa/Cairo",
  "Asia/Gaza",
  "America/Nuuk",
  "Australia/Lord_Howe",
  "Africa/Casablanca",
  "America/Yellowknife",
  "Asia/Tokyo",
])("preserves recorded and future offsets for %s", (timezone) => {
  const text = calendarTimezoneOngoing(timezone, "2026-01-01T00:00:00Z");
  expect(text.split("\r\n").every((line) => line.length <= 75)).toBe(true);
  const zone = new ICAL.Timezone({
    component: new ICAL.Component(ICAL.parse(text)),
    tzid: timezone,
  });
  const database = timezoneDatabase(timezone);
  const checkpoints = new Set<number>();
  const changes = zone
    .component!.getAllSubcomponents()
    .flatMap((component) => {
      const start = component.getFirstPropertyValue("dtstart") as ICAL.Time;
      const before = component.getFirstPropertyValue("tzoffsetfrom") as ICAL.UtcOffset;
      const after = component.getFirstPropertyValue("tzoffsetto") as ICAL.UtcOffset;
      const rule = component.getFirstPropertyValue("rrule") as ICAL.Recur | null;
      const iterator = rule?.iterator(start);
      const values = [];
      let next: ICAL.Time | null = start;
      while (next && next.year <= 2401) {
        values.push({
          instant: Date.parse(next.toString() + "Z") / 1000 - before.toSeconds(),
          offset: after.toSeconds(),
        });
        next = iterator?.next() ?? null;
      }
      return values;
    })
    .sort((a, b) => a.instant - b.instant);
  for (const year of [2026, 2030, 2040, 2100, 2400]) {
    for (const month of [1, 3, 4, 7, 10, 11, 12]) {
      const civil = `${year}-${String(month).padStart(2, "0")}-15T12:00:00`;
      const time = ICAL.Time.fromDateTimeString(civil);
      time.zone = zone;
      const candidates = database.possibleInstants(Date.parse(civil + "Z"));
      checkpoints.add(Date.parse(candidates[0]) / 1000);
      expect(candidates).toHaveLength(1);
      expect(time.toJSDate().toISOString(), civil).toBe(candidates[0]);
    }
    const transitions = database.transitionInstants(
      Date.UTC(year, 0, 1) / 1000,
      Date.UTC(year + 1, 0, 1) / 1000 - 1,
    );
    for (const transition of transitions) {
      for (const delta of [-1, 0, 1]) {
        const seconds = transition + delta;
        checkpoints.add(seconds);
        const observed = changes.findLast((change) => change.instant <= seconds)?.offset;
        expect(observed, `${timezone} ${new Date(seconds * 1000).toISOString()}`).toBe(
          database.offsetAt(seconds) + 0,
        );
      }
    }
  }
  const folder = "comparison/results/calendar/ongoing-timezones";
  mkdirSync(folder, { recursive: true });
  const filename = timezone.replaceAll("/", "_");
  writeFileSync(`${folder}/${filename}.ics`, text);
  writeFileSync(
    `${folder}/${filename}.json`,
    JSON.stringify(
      {
        timezone,
        sha256: createHash("sha256").update(text).digest("hex"),
        checkpoints: [...checkpoints]
          .sort((a, b) => a - b)
          .map((seconds) => ({
            instant: new Date(seconds * 1000).toISOString(),
            offset: database.offsetAt(seconds),
            civil: new Date((seconds + database.offsetAt(seconds)) * 1000)
              .toISOString()
              .slice(0, 19),
          })),
      },
      null,
      2,
    ) + "\n",
  );
});

it("rejects invalid start and injected timezone content", () => {
  expect(() => calendarTimezoneOngoing("UTC", "invalid")).toThrow();
  expect(() => calendarTimezoneOngoing("UTC", "2026-01-01T00:00:00")).toThrow();
  expect(() => calendarTimezoneOngoing("UTC\r\nEND:VTIMEZONE", "2026-01-01T00:00:00Z")).toThrow();
});

it.fails("reader UTC conversion preserves the instant immediately before Chicago spring DST", () => {
  const component = new ICAL.Component(
    ICAL.parse(calendarTimezoneOngoing("America/Chicago", "2026-01-01T00:00:00Z")),
  );
  const zone = new ICAL.Timezone({ component, tzid: "America/Chicago" });
  const utc = ICAL.Time.fromDateTimeString("2026-03-08T07:59:59Z");
  expect(utc.convertToZone(zone).toString()).toBe("2026-03-08T01:59:59");
});
