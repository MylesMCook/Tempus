import { expect, it } from "vite-plus/test";
import ICAL from "ical.js";
import { parse, appendSelection } from "./sdk";
import type { ClarificationSelection } from "./clarify-numeric-date";
import { prepareCalendarFile } from "./calendar-file";
const context = { timezone: "America/Chicago", reference: "2026-10-31T12:00:00Z" };
it("resolves one range without changing the others, source order or text", () => {
  const input = "Remind me to call Sam Sun 1:30am-3am Mon 9am-10am";
  const first = parse(input, context);
  if (first.status === "resolved" || !first.clarification) throw new Error("Missing choice");
  const selection = appendSelection(undefined, {
    contextKey: first.clarification.contextKey,
    id: first.clarification.choices[1].id,
  });
  const result = parse(input, { ...context, selection });
  if (result.status !== "resolved" || result.value.kind !== "collection")
    throw new Error("Missing group");
  expect(
    result.value.occurrences.map((row) => [row.start.result.iso, row.end!.result.iso]),
  ).toEqual([
    ["2026-11-01T07:30:00.000Z", "2026-11-01T09:00:00.000Z"],
    ["2026-11-02T15:00:00.000Z", "2026-11-02T16:00:00.000Z"],
  ]);
  expect(result.event?.text).toBe("call Sam");
  for (const row of result.value.occurrences)
    expect(input.slice(row.source.span.start, row.source.span.end)).toBe(row.source.text);
  expect(parse(input + " ", { ...context, selection }).status).toBe("needs-clarification");
  expect(parse(input, { ...context, timezone: "America/New_York", selection }).status).toBe(
    "needs-clarification",
  );
  const file = prepareCalendarFile(result, {
    uid: "11111111-2222-4333-8444-555555555555",
    stamp: context.reference,
    title: "call Sam",
  });
  if (!file.ok) throw new Error(file.reason);
  const calendar = new ICAL.Component(ICAL.parse(file.text));
  expect(
    calendar
      .getAllSubcomponents("vevent")
      .map((row) => new ICAL.Event(row).startDate.toJSDate().toISOString()),
  ).toEqual(["2026-11-01T07:30:00.000Z", "2026-11-02T15:00:00.000Z"]);
});
it("retains enough decisions to complete multiple ambiguous range endpoints through the SDK", () => {
  const input =
    "Sun 1:01am-1:02am Sun 1:03am-1:04am Sun 1:05am-1:06am Sun 1:07am-1:08am Sun 1:09am-1:10am";
  let selection: ClarificationSelection | undefined;
  let result = parse(input, context);
  let decisions = 0;
  while (result.status !== "resolved" && decisions < 12) {
    if (!result.clarification) throw new Error("Missing decision");
    selection = appendSelection(selection, {
      contextKey: result.clarification.contextKey,
      id: result.clarification.choices[0].id,
    });
    result = parse(input, { ...context, selection });
    decisions++;
  }
  expect(decisions).toBe(10);
  if (result.status !== "resolved" || result.value.kind !== "collection")
    throw new Error("Incomplete group");
  expect(result.value.occurrences).toHaveLength(5);
  expect(result.value.selectedClocks).toHaveLength(10);
});
it("does not reuse a valid clock choice after an invalid qualifier is added", () => {
  const input = "Sun 1:30am-3am Mon 9am-10am with lunch";
  const first = parse("Sun 1:30am-3am Mon 9am-10am", context);
  if (first.status === "resolved" || !first.clarification) throw new Error("Missing choice");
  const selection = {
    contextKey: first.clarification.contextKey,
    id: first.clarification.choices[0].id,
  };
  expect(parse(input, { ...context, selection }).status).not.toBe("resolved");
});
it("keeps decision history bounded", () => {
  let selection: ClarificationSelection | undefined;
  for (let i = 0; i < 80; i++)
    selection = appendSelection(selection, { contextKey: "same", id: String(i) });
  expect(selection?.previous).toHaveLength(64);
  expect(selection?.id).toBe("79");
});

it("confirms only the named matching-clock range before exporting the whole group", () => {
  const input = "Remind me to call Sam Sat 9am-9am Mon 9am-10am";
  const first = parse(input, context);
  if (first.status === "resolved" || !first.clarification)
    throw new Error("Missing next-date choice");
  expect(first.clarification.choices).toHaveLength(1);
  expect(first.clarification.question).toContain("Range 1 (Sat)");
  const selection = appendSelection(undefined, {
    contextKey: first.clarification.contextKey,
    id: first.clarification.choices[0].id,
  });
  const result = parse(input, { ...context, selection });
  if (result.status !== "resolved" || result.value.kind !== "collection")
    throw new Error("Missing complete group");
  const expected = [
    ["2026-10-31T14:00:00.000Z", "2026-11-01T15:00:00.000Z"],
    ["2026-11-02T15:00:00.000Z", "2026-11-02T16:00:00.000Z"],
  ];
  expect(
    result.value.occurrences.map((row) => [row.start.result.iso, row.end!.result.iso]),
  ).toEqual(expected);
  expect(result.value.selectedClocks?.[0]).toContain("2026-11-01");
  expect(parse(input + " ", { ...context, selection }).status).toBe("needs-clarification");
  const file = prepareCalendarFile(result, {
    uid: "11111111-2222-4333-8444-555555555555",
    stamp: context.reference,
    title: "call Sam",
  });
  if (!file.ok) throw new Error(file.reason);
  const events = new ICAL.Component(ICAL.parse(file.text))
    .getAllSubcomponents("vevent")
    .map((c) => new ICAL.Event(c));
  expect(
    events.map((e) => [e.startDate.toJSDate().toISOString(), e.endDate.toJSDate().toISOString()]),
  ).toEqual(expected);
});
it("keeps endpoint clocks and next-day confirmations separate for every group range", () => {
  const input = "Sat 1:30am-1:30am Sun 1:30am-1:30am";
  const beforeWeekend = { ...context, reference: "2026-10-30T12:00:00Z" };
  let result = parse(input, beforeWeekend);
  let selection: ClarificationSelection | undefined;
  const ids: string[] = [];
  for (let i = 0; i < 5 && result.status !== "resolved"; i++) {
    if (!result.clarification) throw new Error("Missing choice");
    const choice = result.clarification.choices.at(-1)!;
    ids.push(choice.id);
    selection = appendSelection(selection, {
      contextKey: result.clarification.contextKey,
      id: choice.id,
    });
    result = parse(input, { ...beforeWeekend, selection });
  }
  expect(ids.filter((id) => id.endsWith("end-next-day"))).toEqual([
    "group:0:end-next-day",
    "group:1:end-next-day",
  ]);
  if (result.status !== "resolved" || result.value.kind !== "collection")
    throw new Error("Incomplete decisions");
  expect(
    result.value.occurrences.map((row) => [row.start.result.iso, row.end!.result.iso]),
  ).toEqual([
    ["2026-10-31T06:30:00.000Z", "2026-11-01T07:30:00.000Z"],
    ["2026-11-01T07:30:00.000Z", "2026-11-02T07:30:00.000Z"],
  ]);
});

it("checks the entire collection before asking for a clock or next-day choice", () => {
  for (const input of [
    "Sat 9am-9am Mon 9am-10am unknown",
    "Sun 1:30am-3am Mon 9am-",
    `${Array.from({ length: 15 }, () => "Sun").join(" ")} 1:30am-3am`,
  ]) {
    const result = parse(input, context);
    expect(result.status).not.toBe("resolved");
    if (result.status !== "resolved") expect(result.clarification).toBeUndefined();
  }
});
