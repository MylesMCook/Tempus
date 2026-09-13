import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { parse, appendSelection } from "../../src/shared/sdk";
import {
  prepareRecurringCalendarFile,
  resolveRecurringExport,
} from "../../src/shared/recurring-calendar-file";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  reference: context.reference,
  title: "call Sam",
};
it("exports a complete fortnightly reminder after its active-week clock correction", () => {
  const input =
    "Remind me to call Sam every other Sunday at 1:30am for 30 minutes starting 2026-10-18 until 2026-11-29 except 2026-11-15";
  const question = parse(input, context);
  if (question.status !== "needs-clarification" || !question.clarification)
    throw new Error("Missing question");
  const selection = appendSelection(undefined, {
    contextKey: question.clarification.contextKey,
    id: question.clarification.choices[1].id,
  });
  const result = parse(input, { ...context, selection });
  const file = prepareRecurringCalendarFile(result, metadata);
  if (!file.ok) throw new Error(file.reason);
  const components = new ICAL.Component(ICAL.parse(file.text)).getAllSubcomponents("vevent");
  const master = components.find((c) => !c.hasProperty("recurrence-id"))!;
  const event = new ICAL.Event(master, {
    exceptions: components.filter((c) => c !== master).map((c) => new ICAL.Event(c)),
  });
  const iterator = event.iterator();
  const rows = [];
  for (let next = iterator.next(); next; next = iterator.next()) {
    const row = event.getOccurrenceDetails(next);
    rows.push([row.startDate.toJSDate().toISOString(), row.endDate.toJSDate().toISOString()]);
    if (rows.length > 4) throw Error("Unexpected extra occurrence");
  }
  expect(rows).toEqual([
    ["2026-10-18T06:30:00.000Z", "2026-10-18T07:00:00.000Z"],
    ["2026-11-01T07:30:00.000Z", "2026-11-01T08:00:00.000Z"],
    ["2026-11-29T07:30:00.000Z", "2026-11-29T08:00:00.000Z"],
  ]);
  expect(file.eventCount).toBe(3);
  expect(parse(input.replace("other Sunday", "Sunday"), { ...context, selection }).status).toBe(
    "needs-clarification",
  );
});
it("preserves a multi-week phase when local Monday becomes UTC Sunday", () => {
  const options = { ...context, timezone: "Asia/Tokyo", reference: "2026-09-20T12:00:00Z" };
  const input =
    "every 2 weeks on Monday and Wednesday at 00:30 starting 2026-09-14 except 2026-09-28";
  const result = parse(input, options);
  const file = prepareRecurringCalendarFile(result, { ...metadata, reference: options.reference });
  if (!file.ok) throw new Error(file.reason);
  const component = new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!;
  expect(component.getFirstPropertyValue("rrule")?.toString()).toContain("WKST=SU");
  const iterator = new ICAL.Event(component).iterator();
  expect(Array.from({ length: 4 }, () => iterator.next()!.toJSDate().toISOString())).toEqual([
    "2026-09-29T15:30:00.000Z",
    "2026-10-11T15:30:00.000Z",
    "2026-10-13T15:30:00.000Z",
    "2026-10-25T15:30:00.000Z",
  ]);
});

it("names an actual active-week conflict in the unbounded export error", () => {
  const result = parse("every other Sunday at 1:30am starting 2026-10-25", context);
  const plan = resolveRecurringExport(result, context.reference);
  if (!plan || plan.ok) throw new Error("Missing future policy guard");
  expect(plan.error.message).toContain("2027-11-07");
  expect(plan.error.message).not.toContain("2026-11-01");
});
it("retains multi-week cadence in a permitted ongoing zoned rule", () => {
  const result = parse("every 3 weeks on Monday at noon starting 2026-10-26", context);
  const file = prepareRecurringCalendarFile(result, metadata);
  if (!file.ok) throw new Error(file.reason);
  const component = new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!;
  const rule = component.getFirstPropertyValue("rrule")!.toString();
  expect(rule).toContain("INTERVAL=3");
  expect(file.text).toContain("WKST=MO;");
  const iterator = new ICAL.Event(component).iterator();
  expect(Array.from({ length: 3 }, () => iterator.next()!.toJSDate().toISOString())).toEqual([
    "2026-10-26T17:00:00.000Z",
    "2026-11-16T18:00:00.000Z",
    "2026-12-07T18:00:00.000Z",
  ]);
});
