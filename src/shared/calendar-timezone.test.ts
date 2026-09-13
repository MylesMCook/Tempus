import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { calendarTimezone } from "./calendar-timezone";

function read(timezone: string, from: string, through: string) {
  const text = calendarTimezone(timezone, from, through);
  const component = new ICAL.Component(ICAL.parse(text));
  return { text, zone: new ICAL.Timezone({ component, tzid: timezone }) };
}
it.each([
  [
    "America/Chicago",
    "2026-01-01T00:00:00Z",
    "2026-12-31T23:59:59Z",
    "2026-02-01T12:00:00",
    "2026-02-01T18:00:00.000Z",
  ],
  [
    "America/Chicago",
    "2026-01-01T00:00:00Z",
    "2026-12-31T23:59:59Z",
    "2026-07-01T12:00:00",
    "2026-07-01T17:00:00.000Z",
  ],
  [
    "Australia/Lord_Howe",
    "2026-01-01T00:00:00Z",
    "2026-12-31T23:59:59Z",
    "2026-07-01T12:00:00",
    "2026-07-01T01:30:00.000Z",
  ],
  [
    "Australia/Lord_Howe",
    "2026-01-01T00:00:00Z",
    "2026-12-31T23:59:59Z",
    "2026-01-15T12:00:00",
    "2026-01-15T01:00:00.000Z",
  ],
  [
    "Asia/Kathmandu",
    "2026-01-01T00:00:00Z",
    "2026-12-31T23:59:59Z",
    "2026-06-01T12:00:00",
    "2026-06-01T06:15:00.000Z",
  ],
  [
    "Pacific/Apia",
    "2011-12-01T00:00:00Z",
    "2012-01-15T23:59:59Z",
    "2011-12-31T12:00:00",
    "2011-12-30T22:00:00.000Z",
  ],
])("independent reader preserves %s at %s / %s / %s", (timezone, from, through, wall, expected) => {
  const { zone } = read(timezone, from, through);
  const time = ICAL.Time.fromDateTimeString(wall);
  time.zone = zone;
  expect(time.toJSDate().toISOString()).toBe(expected);
});
it("covers a transition exactly at the first instant", () => {
  const { zone } = read("America/Chicago", "2026-03-08T08:00:00Z", "2026-03-09T00:00:00Z");
  const time = ICAL.Time.fromDateTimeString("2026-03-08T03:00:00");
  time.zone = zone;
  expect(time.toJSDate().toISOString()).toBe("2026-03-08T08:00:00.000Z");
});
it.each([
  ["America/Chicago\r\nEND:VTIMEZONE", "2026-01-01T00:00:00Z", "2026-12-31T00:00:00Z"],
  ["UTC", "2027-01-01T00:00:00Z", "2026-01-01T00:00:00Z"],
  ["UTC", "2026-01-01T00:00:00Z", "2037-01-01T00:00:00Z"],
])("refuses invalid timezone coverage %s", (zone, from, through) => {
  expect(() => calendarTimezone(zone, from, through)).toThrow();
});

it("independently expands a local weekly rule across DST with an inclusive UTC boundary and exclusion", () => {
  const zone = calendarTimezone("America/Chicago", "2026-03-01T00:00:00Z", "2026-03-30T00:00:00Z");
  const text = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    zone.trimEnd(),
    "BEGIN:VEVENT",
    "UID:recurrence-oracle@tempus.invalid",
    "DTSTAMP:20260101T000000Z",
    "DTSTART;TZID=America/Chicago:20260301T120000",
    "RRULE:FREQ=WEEKLY;BYDAY=SU;UNTIL=20260322T170000Z",
    "EXDATE;TZID=America/Chicago:20260308T120000",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  const calendar = new ICAL.Component(ICAL.parse(text));
  const event = new ICAL.Event(calendar.getFirstSubcomponent("vevent")!);
  const iterator = event.iterator();
  const instants: string[] = [];
  for (let next = iterator.next(); next; next = iterator.next()) {
    instants.push(next.toJSDate().toISOString());
    if (instants.length > 10) throw new Error("Boundary was not applied");
  }
  expect(instants).toEqual([
    "2026-03-01T18:00:00.000Z",
    "2026-03-15T17:00:00.000Z",
    "2026-03-22T17:00:00.000Z",
  ]);
});

it("independently preserves a second-clock occurrence override without shifting following weeks", () => {
  const zone = calendarTimezone("America/Chicago", "2026-10-01T00:00:00Z", "2026-12-01T00:00:00Z");
  const text = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    zone.trimEnd(),
    "BEGIN:VEVENT",
    "UID:clock-oracle@tempus.invalid",
    "DTSTAMP:20260101T000000Z",
    "DTSTART;TZID=America/Chicago:20261025T013000",
    "RRULE:FREQ=WEEKLY;BYDAY=SU;COUNT=3",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "UID:clock-oracle@tempus.invalid",
    "DTSTAMP:20260101T000000Z",
    "RECURRENCE-ID;TZID=America/Chicago:20261101T013000",
    "DTSTART:20261101T073000Z",
    "DTEND:20261101T095000Z",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  const calendar = new ICAL.Component(ICAL.parse(text));
  const event = new ICAL.Event(calendar.getFirstSubcomponent("vevent")!);
  const iterator = event.iterator();
  const starts: string[] = [];
  const ends: string[] = [];
  for (let next = iterator.next(); next; next = iterator.next()) {
    const detail = event.getOccurrenceDetails(next);
    starts.push(detail.startDate.toJSDate().toISOString());
    ends.push(detail.endDate.toJSDate().toISOString());
    if (starts.length > 3) throw new Error("Count was not applied");
  }
  expect(starts).toEqual([
    "2026-10-25T06:30:00.000Z",
    "2026-11-01T07:30:00.000Z",
    "2026-11-08T07:30:00.000Z",
  ]);
  expect(ends[1]).toBe("2026-11-01T09:50:00.000Z");
});
