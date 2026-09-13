import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { parse, appendSelection, calculateDate } from "./sdk";
import { prepareCalendarFile } from "./calendar-file";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const metadata = {
  uid: "11111111-2222-4333-8444-555555555555",
  stamp: context.reference,
  title: "Time off",
};
function choose(input: string, ids: string[], options = context) {
  let result = parse(input, options),
    selection;
  for (const id of ["event:title", ...ids]) {
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
  ["exclusive", "2026-09-18"],
  ["inclusive", "2026-09-19"],
])("exports the explicitly chosen %s all-day end", (policy, expectedEnd) => {
  const input = "Time off from 2026-09-13 to 2026-09-18";
  const { result, selection } = choose(input, [`interval:end:boundary:${policy}`]);
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw Error(JSON.stringify(result));
  expect(result.value.allDay).toBe(true);
  expect(result.input).toBe(input);
  expect(result.event?.text).toBe("Time off");
  expect(input.slice(result.source.span.start, result.source.span.end)).toBe(result.source.text);
  const file = prepareCalendarFile(result, metadata);
  if (!file.ok) throw Error(file.reason);
  const event = new ICAL.Event(
    new ICAL.Component(ICAL.parse(file.text)).getFirstSubcomponent("vevent")!,
  );
  expect(event.startDate.isDate).toBe(true);
  expect(event.endDate.isDate).toBe(true);
  expect(event.startDate.toString()).toBe("2026-09-13");
  expect(event.endDate.toString()).toBe(expectedEnd);
  expect(calculateDate(input, context).ok).toBe(false);
  const edited = parse(input.replace("09-18", "09-20"), { ...context, selection });
  expect(edited.status).toBe("needs-clarification");
  expect(prepareCalendarFile(edited, metadata).ok).toBe(false);
});
it("keeps numeric date decisions, and reopens conflicting end policies", () => {
  const input = "Time off from 03/04/2027 until 03/06/2027";
  const { result, selection } = choose(input, [
    "interval:start:date:2027-03-04",
    "interval:end:date:2027-03-06",
    "interval:end:boundary:inclusive",
  ]);
  expect(result.status).toBe("resolved");
  const conflicting = parse(input, {
    ...context,
    selection: {
      ...selection!,
      previous: [...selection!.previous!, "interval:end:boundary:exclusive"],
    },
  });
  expect(conflicting.status).toBe("needs-clarification");
  const changed = appendSelection(selection, {
    contextKey: selection!.contextKey,
    id: "interval:start:date:2027-04-03",
  });
  expect(changed).toBeDefined();
  expect(changed!.previous?.some((id) => id.startsWith("interval:end:"))).toBe(false);
});
it("uses civil all-day boundaries across DST", () => {
  const { result } = choose("Time off from 2026-03-07 to 2026-03-08", [
    "interval:end:boundary:inclusive",
  ]);
  if (result.status !== "resolved" || result.value.kind !== "interval")
    throw Error(JSON.stringify(result));
  expect(result.value.start.result.iso).toBe("2026-03-07T06:00:00.000Z");
  expect(result.value.end.result.iso).toBe("2026-03-09T05:00:00.000Z");
});
it("does not invent a clock or accept contradictory boundaries", () => {
  for (const text of [
    "from 2026-09-13 at noon to 2026-09-18",
    "from 2026-09-13 to 2026-09-18 at noon",
    "from 2026-09-13 plus 1 day to 2026-09-18",
  ]) {
    expect(parse(text, context).status).not.toBe("resolved");
  }
  const { result } = choose("Time off from 2026-09-18 to 2026-09-13", [
    "interval:end:boundary:inclusive",
  ]);
  expect(result.status).not.toBe("resolved");
});
it("keeps the year limit unresolved instead of overflowing the file date", () => {
  const { result } = choose("Time off from 9999-12-30 to 9999-12-31", [
    "interval:end:boundary:inclusive",
  ]);
  expect(result.status).not.toBe("resolved");
});
