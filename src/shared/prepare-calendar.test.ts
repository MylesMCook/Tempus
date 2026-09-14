import { expect, it } from "vite-plus/test";
import { appendSelection, parse } from "./sdk.js";
import { prepareCalendar, calendarContextKey } from "./sdk-calendar.js";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const file = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  title: "Call Sam",
};

it("corrects the complete schedule and prepares the same dates with or without a file", () => {
  const result = parse("Call Sam every Sunday at 1:30am for 30 minutes until 2026-11-08", context);
  const first = prepareCalendar(result);
  if (first.status !== "needs-clarification") throw new Error("Missing clock question");
  const id = "recurrence:2026-11-01:start:2026-11-01T07:30:00Z";
  expect(first.clarification.choices.some((choice) => choice.id === id)).toBe(true);
  const selection = appendSelection(undefined, { contextKey: first.clarification.contextKey, id });
  const data = prepareCalendar(result, { selection });
  const exported = prepareCalendar(result, { selection, file });
  if (data.status !== "ready" || exported.status !== "ready") throw new Error("Not ready");
  expect(data.file).toBeUndefined();
  expect(exported.schedule).toEqual(data.schedule);
  expect(data.schedule?.occurrences).toHaveLength(9);
  expect(data.schedule?.occurrences[7].start.result.iso).toBe("2026-11-01T07:30:00.000Z");
  expect(exported.file).toMatchObject({ ok: true, eventCount: 9 });
  expect(data.ongoing).toBe(false);
  for (const changed of [
    parse("Call Pat every Sunday at 1:30am for 30 minutes until 2026-11-08", context),
    parse(result.input, { ...context, timezone: "UTC" }),
    parse(result.input, { ...context, reference: "2026-09-13T16:00:00Z" }),
  ])
    expect(prepareCalendar(changed, { selection }).status).toBe("blocked");
  expect(prepareCalendar(structuredClone(result), { selection })).toEqual(data);
});

it("keeps unresolved input blocked and preserves explicit point precision for file preparation", () => {
  for (const input of ["03/04/2027", "do not call Sam tomorrow", "every so often"])
    expect(prepareCalendar(parse(input, context)).status).toBe("blocked");
  const point = parse("2026-01-31 plus 1 month minus 1 day", context);
  const data = prepareCalendar(point, { file: { ...file, pointMode: "date" } });
  expect(data).toMatchObject({ status: "ready", ongoing: false, file: { ok: true } });
  if (data.status !== "ready" || !data.file?.ok) throw new Error("Missing file");
  expect(data.file.text).toContain("DTSTART;VALUE=DATE:20260227");
  expect(
    prepareCalendar(point, {
      selection: {
        contextKey: calendarContextKey(point),
        id: "unused",
        previous: Array<string>(1),
      },
    }).status,
  ).toBe("blocked");
});
