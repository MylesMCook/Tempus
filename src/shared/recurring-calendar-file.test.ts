import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { interpretDate } from "./interpret-date";
import { prepareRecurringCalendarFile, resolveRecurringExport } from "./recurring-calendar-file";
const options = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  reference: options.reference,
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: options.reference,
  title: "Call Sam",
};
it("exports upcoming ranges without asking about a past repeated endpoint", () => {
  const context = { timezone: "America/Chicago", reference: "2026-11-01T08:00:00Z" };
  const result = interpretDate(
    "Remind me to call Sam every Sunday from midnight to 1:30am until 2026-11-15 except 2026-11-08",
    context,
  );
  const file = prepareRecurringCalendarFile(result, { ...metadata, reference: context.reference });
  if (!file.ok) throw new Error(file.reason);
  expect(file.eventCount).toBe(1);
  expect(expand(file.text)).toEqual([["2026-11-15T06:00:00.000Z", "2026-11-15T07:30:00.000Z"]]);
});
it("does not export an empty schedule after skipping its past ambiguous start", () => {
  const context = { timezone: "America/Chicago", reference: "2026-11-01T08:00:00Z" };
  const result = interpretDate("every Sunday at 1:30am until 2026-11-01", context);
  expect(result.status).toBe("resolved");
  expect(
    prepareRecurringCalendarFile(result, { ...metadata, reference: context.reference }),
  ).toEqual({
    ok: false,
    code: "empty-schedule",
    reason: "No upcoming occurrences remain to export.",
  });
});
function expand(text: string) {
  const calendar = new ICAL.Component(ICAL.parse(text));
  const event = new ICAL.Event(calendar.getFirstSubcomponent("vevent")!);
  const iterator = event.iterator();
  const rows: string[][] = [];
  for (let next = iterator.next(); next; next = iterator.next()) {
    const row = event.getOccurrenceDetails(next);
    rows.push([row.startDate.toJSDate().toISOString(), row.endDate.toJSDate().toISOString()]);
    if (rows.length > 1000) throw new Error("Unbounded file");
  }
  return rows;
}
it("exports a bounded reminder when the reference day has no midnight", () => {
  const context = { timezone: "America/Sao_Paulo", reference: "2018-11-04T12:00:00Z" };
  const result = interpretDate(
    "Remind me to call Sam daily at noon for 1 hour until 2018-11-06 except 2018-11-05",
    context,
  );
  const file = prepareRecurringCalendarFile(result, { ...metadata, reference: context.reference });
  if (!file.ok) throw new Error(file.reason);
  expect(file.eventCount).toBe(2);
  expect(expand(file.text)).toEqual([
    ["2018-11-04T14:00:00.000Z", "2018-11-04T15:00:00.000Z"],
    ["2018-11-06T14:00:00.000Z", "2018-11-06T15:00:00.000Z"],
  ]);
});
it("exports the full bounded weekday schedule beyond its three-row preview", () => {
  const result = interpretDate(
    "Remind me to call Sam every weekday from 9am to 5pm starting 2026-09-14 until 2026-09-18 except 2026-09-16",
    options,
  );
  const file = prepareRecurringCalendarFile(result, metadata);
  if (!file.ok) throw new Error(file.reason);
  expect(file.eventCount).toBe(4);
  expect(expand(file.text)).toEqual(
    [14, 15, 17, 18].map((day) => [`2026-09-${day}T14:00:00.000Z`, `2026-09-${day}T22:00:00.000Z`]),
  );
  expect(
    new Set(
      new ICAL.Component(ICAL.parse(file.text))
        .getAllSubcomponents("vevent")
        .map((c) => c.getFirstPropertyValue("uid")),
    ).size,
  ).toBe(1);
});
it("preserves changing elapsed duration for written range clocks across DST", () => {
  const context = { ...options, reference: "2026-02-28T12:00:00Z" };
  const result = interpretDate("every Sunday from 1am to 3am until 2026-03-15", context);
  const file = prepareRecurringCalendarFile(result, { ...metadata, reference: context.reference });
  if (!file.ok) throw new Error(file.reason);
  expect(expand(file.text)).toEqual([
    ["2026-03-01T07:00:00.000Z", "2026-03-01T09:00:00.000Z"],
    ["2026-03-08T07:00:00.000Z", "2026-03-08T08:00:00.000Z"],
    ["2026-03-15T06:00:00.000Z", "2026-03-15T08:00:00.000Z"],
  ]);
});
it("requires a choice for an ambiguous occurrence outside the preview", () => {
  const result = interpretDate("every Sunday at 1:30am until 2026-11-15", options);
  expect(result.status).toBe("resolved");
  const plan = resolveRecurringExport(result, options.reference);
  if (!plan || plan.ok || !plan.clockPrompt) throw new Error("Missing full schedule choice");
  expect(plan.clockPrompt.question).toContain("2026-11-01");
  expect(prepareRecurringCalendarFile(result, metadata).ok).toBe(false);
  const file = prepareRecurringCalendarFile(result, {
    ...metadata,
    decisions: [plan.clockPrompt.choices[1].id],
  });
  if (!file.ok) throw new Error(file.reason);
  const rows = expand(file.text);
  expect(rows).toHaveLength(10);
  expect(rows[7][0]).toBe("2026-11-01T07:30:00.000Z");
});
it.each(["every Sunday at midnight for 4 hours", "every day at noon until 2030-01-01"])(
  "does not silently shorten %s",
  (input) => {
    const result = interpretDate(input, options);
    expect(prepareRecurringCalendarFile(result, metadata).ok).toBe(false);
  },
);

it("keeps an unbounded point rule unbounded when timezone validation succeeds", () => {
  const file = prepareRecurringCalendarFile(
    interpretDate("every Monday at noon", options),
    metadata,
  );
  if (!file.ok) throw new Error(file.reason);
  const rule = new ICAL.Component(ICAL.parse(file.text))
    .getFirstSubcomponent("vevent")!
    .getFirstPropertyValue("rrule") as ICAL.Recur;
  expect(rule.until).toBeNull();
  expect(rule.count).toBeNull();
});

it("retains calendar-looking words in event titles without treating them as structural markers", () => {
  const result = interpretDate("every Monday at noon until 2026-09-28", options);
  const title = "Discuss BEGIN:VEVENT and END:VEVENT examples";
  const file = prepareRecurringCalendarFile(result, { ...metadata, title });
  if (!file.ok) throw new Error(file.reason);
  const calendar = new ICAL.Component(ICAL.parse(file.text));
  expect(calendar.getAllSubcomponents("vevent").map((row) => new ICAL.Event(row).summary)).toEqual([
    title,
    title,
    title,
  ]);
  expect(expand(file.text).map((row) => row[0])).toEqual([
    "2026-09-14T17:00:00.000Z",
    "2026-09-21T17:00:00.000Z",
    "2026-09-28T17:00:00.000Z",
  ]);
});

it("keeps recurring duration, boundaries and exceptions in the complete file", () => {
  const input =
    "Remind me to call Sam every Monday at 9am for 30 minutes until 2026-10-05 except 2026-09-21";
  const result = interpretDate(input, options);
  if (result.status !== "resolved" || result.value.kind !== "recurrence")
    throw new Error(JSON.stringify(result));
  expect(result.value.rule.duration).toEqual({ amount: 30, unit: "minutes" });
  expect(result.event?.text).toBe("call Sam");
  const file = prepareRecurringCalendarFile(result, metadata);
  if (!file.ok) throw new Error(file.reason);
  expect(expand(file.text)).toEqual(
    ["2026-09-14", "2026-09-28", "2026-10-05"].map((d) => [
      `${d}T14:00:00.000Z`,
      `${d}T14:30:00.000Z`,
    ]),
  );
});
it("preserves elapsed recurring duration through a clock choice beyond the preview", () => {
  const result = interpretDate("every Sunday at 1:30am for 30 minutes until 2026-11-08", options);
  const plan = resolveRecurringExport(result, options.reference);
  if (!plan || plan.ok || !plan.clockPrompt) throw new Error("Missing export clock choice");
  const decisions = [plan.clockPrompt.choices[1].id];
  const file = prepareRecurringCalendarFile(result, { ...metadata, decisions });
  if (!file.ok) throw new Error(file.reason);
  const rows = expand(file.text);
  expect(rows).toHaveLength(9);
  expect(rows[7]).toEqual(["2026-11-01T07:30:00.000Z", "2026-11-01T08:00:00.000Z"]);
  expect(rows[8]).toEqual(["2026-11-08T07:30:00.000Z", "2026-11-08T08:00:00.000Z"]);
  for (const [start, end] of rows) expect(Date.parse(end) - Date.parse(start)).toBe(30 * 60 * 1000);
});
it.each([
  "every Monday at 9am for 0 minutes",
  "every Monday at 9am for 0 minutes until 2026-01-01",
  "every Monday at 9am for 30 minutes with lunch",
  "every Monday at 9am for",
])("does not accept an incomplete or invalid repeating duration: %s", (input) => {
  expect(interpretDate(input, options).status).not.toBe("resolved");
});
it("clarifies only the recurring calendar-duration endpoint that crosses DST", () => {
  const input = "every Saturday at 1:30am for 1 day until 2026-11-07";
  const result = interpretDate(input, options);
  const plan = resolveRecurringExport(result, options.reference);
  if (!plan || plan.ok || !plan.clockPrompt)
    throw new Error("Missing complete-export endpoint choice");
  expect(plan.clockPrompt.question).toContain("2026-10-31 end:");
  const file = prepareRecurringCalendarFile(result, {
    ...metadata,
    decisions: [plan.clockPrompt.choices[1].id],
  });
  if (!file.ok) throw new Error(file.reason);
  const rows = expand(file.text);
  expect(rows).toHaveLength(8);
  expect(rows[6]).toEqual(["2026-10-31T06:30:00.000Z", "2026-11-01T07:30:00.000Z"]);
  expect(rows[7]).toEqual(["2026-11-07T07:30:00.000Z", "2026-11-08T07:30:00.000Z"]);
});

it("requires recovery from conflicting recurrence clocks before exporting a complete reminder", () => {
  const input = "Remind me to call Sam every Sunday at 1:30am for 30 minutes until 2026-11-08";
  const result = interpretDate(input, options);
  const pending = resolveRecurringExport(result, options.reference);
  if (!pending || pending.ok || !pending.clockPrompt) throw new Error("Missing clock choice");
  const ids = pending.clockPrompt.choices.map((choice) => choice.id);
  const conflict = resolveRecurringExport(result, options.reference, ids);
  expect(conflict?.ok).toBe(false);
  if (!conflict || conflict.ok) throw new Error("Conflicting answers were accepted");
  expect(conflict.clockPrompt?.choices.map((choice) => choice.id)).toEqual(ids);
  expect(prepareRecurringCalendarFile(result, { ...metadata, decisions: ids }).ok).toBe(false);
  const file = prepareRecurringCalendarFile(result, { ...metadata, decisions: [ids[1]] });
  if (!file.ok) throw new Error(file.reason);
  expect(expand(file.text)).toHaveLength(9);
  expect(expand(file.text)[7]).toEqual(["2026-11-01T07:30:00.000Z", "2026-11-01T08:00:00.000Z"]);
});

it("retains independent start/end corrections across two years in the complete file", () => {
  const context = { timezone: "America/Chicago", reference: "2026-01-01T12:00:00Z" };
  const input =
    "Remind me to call Sam every Sunday from 1:30am to 1:45am until 2027-12-31 except 2026-11-08";
  const result = interpretDate(input, context);
  expect(result.status).toBe("resolved");
  const decisions: string[] = [];
  const chosen = [
    "recurrence:2026-11-01:start:2026-11-01T06:30:00Z",
    "recurrence:2026-11-01:end:2026-11-01T07:45:00Z",
    "recurrence:2027-11-07:start:2027-11-07T07:30:00Z",
    "recurrence:2027-11-07:end:2027-11-07T07:45:00Z",
  ];
  for (const id of chosen) {
    const pending = resolveRecurringExport(result, context.reference, decisions);
    if (!pending || pending.ok || !pending.clockPrompt) throw new Error(`Missing choice ${id}`);
    expect(pending.clockPrompt.choices.map((choice) => choice.id)).toContain(id);
    expect(
      prepareRecurringCalendarFile(result, { ...metadata, reference: context.reference, decisions })
        .ok,
    ).toBe(false);
    decisions.push(id);
  }
  const file = prepareRecurringCalendarFile(result, {
    ...metadata,
    reference: context.reference,
    decisions,
  });
  if (!file.ok) throw new Error(file.reason);
  const rows = expand(file.text);
  // Independently authored modern Chicago offsets; no parser or timezone helper
  // computes the expected instants. Check every Sunday, not only DST samples.
  const expected: string[][] = [];
  for (
    let date = Date.parse("2026-01-04T00:00:00Z");
    date < Date.parse("2028-01-01T00:00:00Z");
    date += 7 * 86400000
  ) {
    const day = new Date(date).toISOString().slice(0, 10);
    if (day === "2026-11-08") continue;
    const daylight =
      (day > "2026-03-08" && day <= "2026-11-01") || (day > "2027-03-14" && day < "2027-11-07");
    const hour = daylight ? "06" : "07";
    expected.push([
      `${day}T${hour}:30:00.000Z`,
      `${day}T${day === "2026-11-01" ? "07" : hour}:45:00.000Z`,
    ]);
  }
  expect(file.eventCount).toBe(103);
  expect(rows).toEqual(expected);
  // Restarting cannot reuse the previously completed file plan.
  const restarted = resolveRecurringExport(result, context.reference);
  expect(restarted?.ok).toBe(false);
  if (!restarted || restarted.ok) throw new Error("Restart reused old choices");
  expect(restarted.clockPrompt?.choices.map((choice) => choice.id)).toContain(chosen[0]);
});
