import { expect, it } from "vite-plus/test";
import { parse, calculateDate, appendSelection, type ClarificationSelection } from "./sdk";
import { prepareCalendarFile } from "./calendar-file";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
it.each([
  ["at noon tomorrow", "2026-09-13T17:00:00.000Z"],
  ["noon tomorrow", "2026-09-13T17:00:00.000Z"],
  ["at 10 pm next Friday", "2026-09-19T03:00:00.000Z"],
  ["at 14:30 on 2026-09-14", "2026-09-14T19:30:00.000Z"],
  ["at midnight May 5, 2027", "2027-05-05T05:00:00.000Z"],
  ["at noon Saturday", "2026-09-12T17:00:00.000Z"],
])("resolves complete clock-first anchor without changing strict v2: %s", (text, iso) => {
  expect(calculateDate(text, context).ok).toBe(false);
  const input = `  Call Sam ${text}!  `;
  const result = parse(input, context);
  expect(result).toMatchObject({
    status: "resolved",
    input,
    event: { text: "Call Sam" },
    apiReplay: false,
    value: {
      kind: "point",
      precision: "time",
      clockSource: "explicit",
      calculation: { result: { iso } },
    },
  });
  if (result.status !== "resolved") throw Error("No result");
  expect(input.slice(result.source.span.start, result.source.span.end)).toBe(text);
  expect(result.assumptions.some((s) => s.includes("Clock-first"))).toBe(true);
});
it.each([
  ["11/01/2026", ["2026-11-01", "2026-11-01T07:30:00Z"], "1:30am", "2026-11-01T07:30:00.000Z"],
  ["2026-03-08", ["2026-03-08T08:30:00Z"], "2:30am", "2026-03-08T08:30:00.000Z"],
] as const)(
  "retains numeric and DST choices, source, output and edit invalidation: %s",
  (date, decisions, clock, iso) => {
    const input = `Buy apples for Sam at ${clock} on ${date}`;
    const metadata = {
      title: "Buy apples for Sam",
      pointMode: "instant" as const,
      uid: "11111111-2222-4333-8444-555555555555",
      stamp: context.reference,
    };
    let selection: ClarificationSelection | undefined;
    for (const id of ["event:title", ...decisions]) {
      const result = parse(input, { ...context, selection });
      if (result.status !== "needs-clarification" || !result.clarification)
        throw Error("Missing question");
      expect(result.clarification.choices.some((choice) => choice.id === id)).toBe(true);
      expect(prepareCalendarFile(result, metadata).ok).toBe(false);
      selection = appendSelection(selection, { contextKey: result.clarification.contextKey, id });
    }
    const result = parse(input, { ...context, selection });
    expect(result).toMatchObject({
      status: "resolved",
      input,
      event: { text: metadata.title },
      apiReplay: false,
      value: { kind: "point", precision: "time", calculation: { result: { iso } } },
    });
    if (result.status !== "resolved") throw Error("No complete reminder");
    expect(input.slice(result.source.span.start, result.source.span.end)).toBe(
      `at ${clock} on ${date}`,
    );
    const file = prepareCalendarFile(result, metadata);
    if (!file.ok) throw Error(file.reason);
    expect(file.text).toContain(`SUMMARY:${metadata.title}`);
    expect(file.text).not.toContain("DTEND");
    const edited = input.replace(clock, "3:30am");
    expect(parse(edited, { ...context, selection })).toEqual(parse(edited, context));
    expect(prepareCalendarFile(parse(edited, { ...context, selection }), metadata).ok).toBe(false);
  },
);
it.each([
  "at noon tomorrow plus 1 month",
  "at noon tomorrow at 3pm",
  "at noon tomorrow for 30 minutes",
  "at noon every Monday",
  "at noon tomorrow unless it rains",
  "at noon tomorrow or later",
  "at noon in 3 weeks",
  "at 25:00 tomorrow",
  "at noon 02/30/2026",
  "at noon now",
])("does not reorder math or discard qualifiers: %s", (input) => {
  const result = parse(input, context);
  expect(result.status).not.toBe("resolved");
});
