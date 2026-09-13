import { expect, it } from "vite-plus/test";
import { parse } from "./sdk";
const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };
const starts = (input: string, reference = context.reference) => {
  const result = parse(input, { ...context, reference });
  if (result.status !== "resolved" || result.value.kind !== "recurrence")
    throw new Error(JSON.stringify(result));
  return { ...result, value: result.value };
};
it("preserves an anchored two-week cadence after the reference passes the start", () => {
  const input =
    "Remind me to call Sam every other Monday at 9am for 30 minutes starting 2026-09-14 until 2026-10-26 except 2026-09-28";
  const result = starts(input, "2026-09-20T16:00:00Z");
  expect(result.value.rule.interval).toBe(2);
  expect(result.event?.text).toBe("call Sam");
  expect(
    result.value.occurrences.map((row) => [row.start.result.iso, row.end?.result.iso]),
  ).toEqual([
    ["2026-10-12T14:00:00.000Z", "2026-10-12T14:30:00.000Z"],
    ["2026-10-26T14:00:00.000Z", "2026-10-26T14:30:00.000Z"],
  ]);
});
it("starts an unanchored every-other-week cycle at the first upcoming clock", () => {
  const result = starts("every other Monday at 9am", "2026-09-14T16:00:00Z");
  expect(result.value.occurrences.map((row) => row.start.result.iso)).toEqual([
    "2026-09-21T14:00:00.000Z",
    "2026-10-05T14:00:00.000Z",
    "2026-10-19T14:00:00.000Z",
  ]);
});
it("keeps explicit multi-week weekday sets within Monday-based active weeks", () => {
  const result = starts(
    "every 3 weeks on Monday and Wednesday at noon starting 2026-09-15 until 2026-10-28",
  );
  expect(result.value.occurrences.map((row) => row.start.result.iso)).toEqual([
    "2026-09-16T17:00:00.000Z",
    "2026-10-05T17:00:00.000Z",
    "2026-10-07T17:00:00.000Z",
  ]);
  expect(result.value.truncated).toBe(true);
});
it.each([
  "every other weekday at noon",
  "every 0 weeks on Monday at noon",
  "every 53 weeks on Monday at noon",
  "every 1.5 weeks on Monday at noon",
])("does not reinterpret unsupported cadence %s", (input) => {
  expect(parse(input, context).status).not.toBe("resolved");
});

it("asks for the clock on the active fortnight and retains excluded dates", () => {
  const input =
    "Remind me to call Sam every other Sunday at 1:30am for 30 minutes starting 2026-10-18 until 2026-11-29 except 2026-11-15";
  const result = parse(input, context);
  expect(result.status).toBe("needs-clarification");
  if (result.status !== "needs-clarification") throw new Error("Missing active-week clock choice");
  expect(result.clarification?.question).toContain("2026-11-01");
});
