import { expect, it } from "vite-plus/test";
import { mkdirSync, writeFileSync } from "node:fs";
import ICAL from "ical.js";
import { interpretDate } from "../../src/shared/interpret-date";
import {
  prepareRecurringCalendarFile,
  resolveRecurringExport,
} from "../../src/shared/recurring-calendar-file";

const reference = "2026-09-12T16:00:00Z";
function prepare(input: string, timezone: string) {
  const interpretation = interpretDate(input, { reference, timezone });
  const file = prepareRecurringCalendarFile(interpretation, {
    reference,
    uid: "11111111-2222-4333-8444-555555555555",
    stamp: reference,
    title: "call Sam",
  });
  if (!file.ok) throw new Error(file.reason);
  const calendar = new ICAL.Component(ICAL.parse(file.text));
  expect(calendar.getAllSubcomponents("vevent")).toHaveLength(1);
  const event = new ICAL.Event(calendar.getFirstSubcomponent("vevent")!);
  const rule = event.component.getFirstPropertyValue("rrule") as ICAL.Recur;
  expect(rule.until).toBeNull();
  expect(rule.count).toBeNull();
  return { event, rule, file, interpretation };
}
function upcoming(event: ICAL.Event, count: number) {
  const iterator = event.iterator();
  return Array.from({ length: count }, () => {
    const next = iterator.next();
    if (!next) throw new Error("The rule stopped early.");
    const row = event.getOccurrenceDetails(next);
    return [row.startDate.toJSDate().toISOString(), row.endDate.toJSDate().toISOString()];
  });
}
it("exports an ongoing Tokyo reminder with the UTC weekday shift and original exclusion", () => {
  const { event, rule, file, interpretation } = prepare(
    "Remind me to call Sam every Monday at 12:30am for 30 minutes starting 2026-09-14 except 2026-09-21",
    "Asia/Tokyo",
  );
  expect(rule.parts.BYDAY).toEqual(["SU"]);
  expect(upcoming(event, 3)).toEqual([
    ["2026-09-13T15:30:00.000Z", "2026-09-13T16:00:00.000Z"],
    ["2026-09-27T15:30:00.000Z", "2026-09-27T16:00:00.000Z"],
    ["2026-10-04T15:30:00.000Z", "2026-10-04T16:00:00.000Z"],
  ]);
  expect(upcoming(event, 1100)).toHaveLength(1100);
  expect(event.description).toContain("Asia/Tokyo");
  expect(event.description).toContain("except 2026-09-21");
  expect(resolveRecurringExport(interpretation, reference)).toMatchObject({
    ok: true,
    exportRule: "FREQ=WEEKLY;BYDAY=SU",
  });
  mkdirSync("comparison/results/calendar", { recursive: true });
  writeFileSync("comparison/results/calendar/unbounded-fixed-tokyo.ics", file.text);
});
it("preserves multiple weekdays and an overnight range", () => {
  const { event } = prepare("every Monday and Friday from 11:30pm to 1am", "Asia/Kathmandu");
  expect(upcoming(event, 2)).toEqual([
    ["2026-09-14T17:45:00.000Z", "2026-09-14T19:15:00.000Z"],
    ["2026-09-18T17:45:00.000Z", "2026-09-18T19:15:00.000Z"],
  ]);
});
it("does not invent a duration for an unbounded point rule", () => {
  const { event } = prepare("every Monday at noon", "UTC");
  expect(event.component.getFirstProperty("dtend")).toBeNull();
  expect(upcoming(event, 1)).toEqual([["2026-09-14T12:00:00.000Z", "2026-09-14T12:00:00.000Z"]]);
});
it("exports a local Chicago point across DST with an exclusion and no invented end", () => {
  const { event, file } = prepare(
    "Remind me to call Sam every Monday at noon starting 2026-10-26 except 2026-11-02",
    "America/Chicago",
  );
  expect(upcoming(event, 3)).toEqual([
    ["2026-10-26T17:00:00.000Z", "2026-10-26T17:00:00.000Z"],
    ["2026-11-09T18:00:00.000Z", "2026-11-09T18:00:00.000Z"],
    ["2026-11-16T18:00:00.000Z", "2026-11-16T18:00:00.000Z"],
  ]);
  expect(upcoming(event, 1100)).toHaveLength(1100);
  expect(event.component.getFirstProperty("dtend")).toBeNull();
  expect(file.text).toContain("DTSTART;TZID=America/Chicago:20261026T120000");
  writeFileSync("comparison/results/calendar/unbounded-zoned-point-chicago.ics", file.text);
});
it("keeps future clock conflicts and zoned durations blocked", () => {
  for (const input of [
    "every Sunday at 1:30am",
    "every Sunday at 2:30am",
    "every Sunday at midnight for 4 hours",
  ]) {
    const value = interpretDate(input, { reference, timezone: "America/Chicago" });
    expect(
      prepareRecurringCalendarFile(value, {
        reference,
        uid: "11111111-2222-4333-8444-555555555555",
        stamp: reference,
        title: "call Sam",
      }).ok,
    ).toBe(false);
  }
});
it("exports ongoing workday intervals that never span an offset change", () => {
  const { event, file } = prepare(
    "Remind me to call Sam every Monday from 9am to 5pm starting 2026-10-26 except 2026-11-02",
    "America/Chicago",
  );
  expect(upcoming(event, 3)).toEqual([
    ["2026-10-26T14:00:00.000Z", "2026-10-26T22:00:00.000Z"],
    ["2026-11-09T15:00:00.000Z", "2026-11-09T23:00:00.000Z"],
    ["2026-11-16T15:00:00.000Z", "2026-11-16T23:00:00.000Z"],
  ]);
  expect(event.component.getFirstProperty("dtend")).toBeNull();
  expect(event.duration.toSeconds()).toBe(28800);
  writeFileSync("comparison/results/calendar/unbounded-zoned-workday.ics", file.text);
});
it.each(["America/Chicago", "Africa/Casablanca"])(
  "keeps local weekdays using explicit future rules for %s",
  (timezone) => {
    const interpretation = interpretDate("every Monday at noon", { reference, timezone });
    expect(resolveRecurringExport(interpretation, reference)).toMatchObject({
      ok: true,
      exportRule: "FREQ=WEEKLY;BYDAY=MO",
      exportTimezone: expect.stringContaining("BEGIN:VTIMEZONE"),
    });
  },
);

it("reparses the written bound instead of trusting inconsistent preview metadata", () => {
  const interpretation = interpretDate("every Monday at noon until 2026-11-30", {
    reference,
    timezone: "UTC",
  });
  if (interpretation.status !== "resolved" || interpretation.value.kind !== "recurrence")
    throw new Error("Missing schedule");
  delete interpretation.value.rule.until;
  const plan = resolveRecurringExport(interpretation, reference);
  expect(plan).toMatchObject({ ok: true, rule: { until: "2026-11-30" } });
  if (!plan?.ok) throw new Error("Missing complete plan");
  expect(plan.exportRule).toBeUndefined();
  expect(plan.occurrences.length).toBe(12);
});
