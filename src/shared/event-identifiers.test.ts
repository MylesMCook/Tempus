import { expect, it } from "vite-plus/test";
import { interpretDate } from "./interpret-date";
import { appendSelection, type ClarificationSelection } from "./clarify-numeric-date";
import { prepareCalendarFile } from "./calendar-file";
import ICAL from "ical.js";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
it.each([
  "Visit room 3",
  "Pay invoice #123",
  "Submit ticket 456",
  "Call person 0",
  "Visit room three",
])("preserves the identifier and source spans for %s", (label) => {
  const input = `  ${label} tomorrow at noon!  `;
  const result = interpretDate(input, context);
  expect(result).toMatchObject({
    status: "resolved",
    event: { text: label },
    value: { kind: "point", calculation: { result: { iso: "2026-09-13T17:00:00.000Z" } } },
  });
  if (result.status !== "resolved") throw Error("No complete reminder");
  expect(input.slice(result.event!.span.start, result.event!.span.end)).toBe(label);
  expect(input.slice(result.source.span.start, result.source.span.end)).toBe("tomorrow at noon");
});
it("completes date and clock correction without losing the numeric label", () => {
  const input = "Call person 0 on 11/01/2026 at 1:30am for 30 minutes";
  let selection: ClarificationSelection | undefined;
  for (const id of ["2026-11-01", "interval:start:2026-11-01T07:30:00Z"]) {
    const result = interpretDate(input, { ...context, selection });
    if (result.status === "resolved" || !result.clarification) throw Error("Missing clarification");
    expect(result.clarification.choices.some((c) => c.id === id)).toBe(true);
    expect(
      prepareCalendarFile(result, {
        title: "Call person 0",
        uid: "11111111-2222-4333-8444-555555555555",
        stamp: context.reference,
      }).ok,
    ).toBe(false);
    selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
  }
  const result = interpretDate(input, { ...context, selection });
  expect(result).toMatchObject({
    status: "resolved",
    event: { text: "Call person 0" },
    value: {
      kind: "interval",
      start: { result: { iso: "2026-11-01T07:30:00.000Z" } },
      end: { result: { iso: "2026-11-01T08:00:00.000Z" } },
    },
  });
  const file = prepareCalendarFile(result, {
    title: "Call person 0",
    uid: "11111111-2222-4333-8444-555555555555",
    stamp: context.reference,
  });
  if (!file.ok) throw Error(file.reason);
  const event = new ICAL.Event(
    new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!,
  );
  expect(event.summary).toBe("Call person 0");
  expect(event.startDate.toJSDate().toISOString()).toBe("2026-11-01T07:30:00.000Z");
  expect(event.endDate.toJSDate().toISOString()).toBe("2026-11-01T08:00:00.000Z");
  const edited = input.replace("person 0", "person 1");
  expect(interpretDate(edited, { ...context, selection })).toEqual(interpretDate(edited, context));
  expect(interpretDate(edited, { ...context, selection }).status).toBe("needs-clarification");
});
it("still asks before treating a generic numeric label as an event", () => {
  const input = "Room 3 tomorrow at noon";
  const first = interpretDate(input, context);
  if (first.status === "resolved" || !first.clarification) throw Error("Missing title choice");
  expect(first.clarification.choices.map((c) => c.id)).toEqual(["event:title"]);
  expect(
    interpretDate(input, {
      ...context,
      selection: { contextKey: first.clarification.contextKey, id: "event:title" },
    }),
  ).toMatchObject({ status: "resolved", event: { text: "Room 3" } });
});
it.each([
  "Visit room 3 pm tomorrow at noon",
  "Visit room 3:30 tomorrow at noon",
  "Call person one and a half hours tomorrow at noon",
  "Visit room 3 days tomorrow",
  "Pay invoice 03/04/2027 tomorrow",
  "Call Sam 3 apples tomorrow",
  "Visit room 3 maybe tomorrow",
  "Visit room 3 tomorrow unless it rains",
  "Do not visit room 3 tomorrow",
  "Visit room 3 yesterday tomorrow",
])("does not absorb meaningful temporal or uncertain wording: %s", (input) => {
  expect(interpretDate(input, context).status).not.toBe("resolved");
});
