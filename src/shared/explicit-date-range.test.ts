import { it, expect } from "vite-plus/test";
import ICAL from "ical.js";
import { parse, appendSelection, calculateDate } from "./sdk";
import { prepareCalendarFile } from "./calendar-file";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  title: "Call Sam",
};
it.each([
  "Call Sam from tomorrow at noon until Friday at noon",
  "Call Sam from 2026-09-13 at noon to 2026-09-18 at noon",
])("exports the complete written date range: %s", (input) => {
  const result = parse(input, context);
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw Error(JSON.stringify(result));
  expect(result.event?.text).toBe("Call Sam");
  expect(result.input).toBe(input);
  expect(input.slice(result.source.span.start, result.source.span.end)).toBe(result.source.text);
  const file = prepareCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  const event = new ICAL.Event(
    new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!,
  );
  expect(event.startDate.toJSDate().toISOString()).toBe("2026-09-13T17:00:00.000Z");
  expect(event.endDate.toJSDate().toISOString()).toBe("2026-09-18T17:00:00.000Z");
  expect(calculateDate(input, context).ok).toBe(false);
});
it("preserves numeric-date and repeated-clock choices through file and edit", () => {
  const input = "Call Sam from 11/01/2026 at 1:30am until 2026-11-02 at noon";
  let result = parse(input, context);
  let selection;
  for (const id of ["interval:start:date:2026-11-01", "interval:start:2026-11-01T07:30:00Z"]) {
    if (result.status !== "needs-clarification" || !result.clarification)
      throw Error(JSON.stringify(result));
    expect(result.clarification.choices.some((c) => c.id === id)).toBe(true);
    expect(prepareCalendarFile(result, metadata).ok).toBe(false);
    selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
    result = parse(input, { ...context, selection });
  }
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw Error(JSON.stringify(result));
  expect(result.value.start.result.iso).toBe("2026-11-01T07:30:00.000Z");
  expect(result.value.end.result.iso).toBe("2026-11-02T18:00:00.000Z");
  expect(prepareCalendarFile(result, metadata).ok).toBe(true);
  const edited = parse(input.replace("11-02", "11-03"), { ...context, selection });
  expect(edited.status).toBe("needs-clarification");
  expect(prepareCalendarFile(edited, metadata).ok).toBe(false);
});
it.each([
  "from 2026-09-18 at noon to 2026-09-13 at noon",
  "from 2026-09-13 at noon to 2026-09-13 at noon",
  "from 2026-09-13 to 2026-09-18",
  "from 2026-09-13 at noon to 2026-09-18",
  "from 2026-02-30 at noon to 2026-03-01 at noon",
  "from tomorrow at noon to Friday at noon except Monday",
  "from tomorrow at noon plus 1 day to Friday at noon",
])("keeps incomplete or conflicting range unresolved: %s", (input) => {
  const r = parse(input, context);
  expect(r.status).not.toBe("resolved");
  expect(prepareCalendarFile(r, metadata).ok).toBe(false);
});

it("does not choose between conflicting repeated-clock answers in a date range", () => {
  const input = "Call Sam from 11/01/2026 at 1:30am until 2026-11-02 at noon";
  const first = parse(input, context);
  if (first.status !== "needs-clarification" || !first.clarification)
    throw Error(JSON.stringify(first));
  const result = parse(input, {
    ...context,
    selection: {
      contextKey: first.clarification.contextKey,
      id: "interval:start:2026-11-01T07:30:00Z",
      previous: ["interval:start:date:2026-11-01", "interval:start:2026-11-01T06:30:00Z"],
    },
  });
  expect(result.status).toBe("needs-clarification");
  expect(prepareCalendarFile(result, metadata).ok).toBe(false);
});

it("retains both endpoint dates and clocks, then invalidates dependent choices", () => {
  const input = "Call Sam from 03/08/2026 at 2:30am until 11/01/2026 at 1:30am";
  let result = parse(input, context);
  let selection;
  for (const id of [
    "interval:start:date:2026-03-08",
    "interval:start:2026-03-08T08:30:00Z",
    "interval:end:date:2026-11-01",
    "interval:end:2026-11-01T07:30:00Z",
  ]) {
    if (result.status !== "needs-clarification" || !result.clarification)
      throw Error(JSON.stringify(result));
    expect(result.clarification.choices.some((choice) => choice.id === id)).toBe(true);
    selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
    result = parse(input, { ...context, selection });
  }
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw Error(JSON.stringify(result));
  expect([result.value.start.result.iso, result.value.end.result.iso]).toEqual([
    "2026-03-08T08:30:00.000Z",
    "2026-11-01T07:30:00.000Z",
  ]);
  expect(prepareCalendarFile(result, metadata).ok).toBe(true);
  const changed = appendSelection(selection, {
    contextKey: selection!.contextKey,
    id: "interval:start:date:2026-08-03",
  });
  expect(changed?.previous).toEqual([]);
  expect(parse(input, { ...context, selection: changed }).status).toBe("needs-clarification");
});
