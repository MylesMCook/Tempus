import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { parse, appendSelection, type ClarificationSelection } from "./sdk";
import { prepareCalendarFile } from "./calendar-file";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  title: "Call Sam",
};
function choose(input: string, ids: string[], options = context) {
  let result = parse(input, options);
  let selection: ClarificationSelection | undefined;
  for (const id of ids) {
    if (result.status !== "needs-clarification" || !result.clarification)
      throw Error(JSON.stringify(result));
    expect(
      result.clarification.choices.some((choice) => choice.id === id),
      JSON.stringify(result.clarification),
    ).toBe(true);
    expect(prepareCalendarFile(result, metadata).ok).toBe(false);
    selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
    result = parse(input, { ...options, selection });
  }
  return { result, selection };
}
it.each([
  [
    "from 2026-09-13 at noon to 2026-09-18",
    "end",
    "written",
    "2026-09-13T17:00:00.000Z",
    "2026-09-18T17:00:00.000Z",
  ],
  [
    "from 2026-09-13 at noon to 2026-09-18",
    "end",
    "midnight",
    "2026-09-13T17:00:00.000Z",
    "2026-09-18T05:00:00.000Z",
  ],
  [
    "from 2026-09-13 to 2026-09-18 at noon",
    "start",
    "written",
    "2026-09-13T17:00:00.000Z",
    "2026-09-18T17:00:00.000Z",
  ],
  [
    "from 2026-09-13 to 2026-09-18 at noon",
    "start",
    "midnight",
    "2026-09-13T05:00:00.000Z",
    "2026-09-18T17:00:00.000Z",
  ],
])("completes %s with an explicit %s %s time", (text, endpoint, policy, start, end) => {
  const input = `Call Sam ${text}`;
  const { result, selection } = choose(input, [`interval:${endpoint}:time:${policy}`]);
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw Error(JSON.stringify(result));
  expect(result.input).toBe(input);
  expect(result.event?.text).toBe("Call Sam");
  expect(result.value.allDay).toBe(false);
  expect([result.value.start.result.iso, result.value.end.result.iso]).toEqual([start, end]);
  expect(input.slice(result.source.span.start, result.source.span.end)).toBe(result.source.text);
  const file = prepareCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  const event = new ICAL.Event(
    new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!,
  );
  expect(event.startDate.isDate).toBe(false);
  expect([
    event.startDate.toJSDate().toISOString(),
    event.endDate.toJSDate().toISOString(),
  ]).toEqual([start, end]);
  for (const editedContext of [
    { ...context, timezone: "UTC" },
    { ...context, reference: "2026-09-13T16:00:00Z" },
  ]) {
    const changed = parse(input, { ...editedContext, selection });
    expect(changed.status).toBe("needs-clarification");
    expect(prepareCalendarFile(changed, metadata).ok).toBe(false);
  }
  expect(parse(input + " ", { ...context, selection }).status).toBe("needs-clarification");
});
it("keeps the time choice through a numeric-date and repeated-clock decision", () => {
  const input = "Call Sam from 11/01/2026 until 2026-11-02 at 1:30am";
  const { result, selection } = choose(input, [
    "interval:start:date:2026-11-01",
    "interval:start:time:written",
    "interval:start:2026-11-01T07:30:00Z",
  ]);
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw Error(JSON.stringify(result));
  expect(result.value.start.result.iso).toBe("2026-11-01T07:30:00.000Z");
  expect(result.value.end.result.iso).toBe("2026-11-02T07:30:00.000Z");
  const replacement = appendSelection(selection, {
    contextKey: selection!.contextKey,
    id: "interval:start:time:midnight",
  });
  expect(replacement?.previous).toContain("interval:start:date:2026-11-01");
  expect(replacement?.previous).not.toContain("interval:start:2026-11-01T07:30:00Z");
  const changed = parse(input, { ...context, selection: replacement });
  if (changed.status !== "resolved" || changed.value.kind !== "interval")
    throw Error(JSON.stringify(changed));
  expect(changed.value.start.result.iso).toBe("2026-11-01T05:00:00.000Z");
});
it("shares the written clock, not a DST replacement clock", () => {
  const input = "Call Sam from 2026-03-08 at 2:30am until 2026-03-09";
  const { result } = choose(input, [
    "interval:start:2026-03-08T08:30:00Z",
    "interval:end:time:written",
  ]);
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw Error(JSON.stringify(result));
  expect(result.value.start.result.local.slice(11, 16)).toBe("03:30");
  expect(result.value.end.result.local.slice(11, 16)).toBe("02:30");
});
it("does not accept conflicting or unoffered time choices", () => {
  const input = "Call Sam from 2026-09-13 to 2026-09-18 at noon";
  const first = parse(input, context);
  if (first.status !== "needs-clarification" || !first.clarification)
    throw Error(JSON.stringify(first));
  for (const ids of [
    ["interval:start:time:written", "interval:start:time:midnight"],
    ["interval:start:time:16:00"],
  ]) {
    const result = parse(input, {
      ...context,
      selection: { contextKey: first.clarification.contextKey, id: ids[0], previous: ids.slice(1) },
    });
    expect(result.status).toBe("needs-clarification");
    expect(prepareCalendarFile(result, metadata).ok).toBe(false);
  }
});
it("does not roll a selected end forward to make it valid", () => {
  const { result } = choose("Call Sam from 2026-09-13 at noon to 2026-09-13", [
    "interval:end:time:midnight",
  ]);
  expect(result.status).not.toBe("resolved");
});
