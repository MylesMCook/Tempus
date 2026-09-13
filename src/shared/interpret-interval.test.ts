import { describe, expect, it } from "vite-plus/test";
import { interpretInterval } from "./interpret-interval";

const context = { timezone: "America/Chicago", reference: "2026-09-12T16:00:00Z" };

describe("complete interval candidates", () => {
  it.each([
    [
      "September 14, 2026 from 9 am to 11 am",
      "2026-09-14T14:00:00.000Z",
      "2026-09-14T16:00:00.000Z",
      false,
    ],
    ["Friday 10pm-12am", "2026-09-19T03:00:00.000Z", "2026-09-19T05:00:00.000Z", false],
    [
      "March 8, 2026 from 1 am to 3 am",
      "2026-03-08T07:00:00.000Z",
      "2026-03-08T08:00:00.000Z",
      false,
    ],
    ["for 3 days from today", "2026-09-12T05:00:00.000Z", "2026-09-15T05:00:00.000Z", true],
    ["for 24 hours from now", "2026-09-12T16:00:00.000Z", "2026-09-13T16:00:00.000Z", false],
    ["for 1 day from March 8, 2026", "2026-03-08T06:00:00.000Z", "2026-03-09T05:00:00.000Z", true],
    [
      "for 24 hours from March 8, 2026",
      "2026-03-08T06:00:00.000Z",
      "2026-03-09T06:00:00.000Z",
      false,
    ],
  ] as const)("resolves %s completely", (input, start, end, allDay) => {
    const result = interpretInterval(input, context);
    expect(result?.ok).toBe(true);
    if (!result?.ok) return;
    expect(result.start.result.iso).toBe(start);
    expect(result.end.result.iso).toBe(end);
    expect(result.allDay).toBe(allDay);
    expect(result.endExclusive).toBe(true);
  });

  it.each([
    "Friday 10pm-10pm",
    "March 8, 2026 from 1 am to 2:30 am",
    "November 1, 2026 from 1:30 am to 3 am",
    "for 0 days from today",
    "for 1000001 days from today",
    "for 1 day from today plus 2 weeks",
    "Friday 25:00-26:00",
  ])("does not resolve %s", (input) => {
    expect(interpretInterval(input, context)?.ok).toBe(false);
  });

  it.each([
    "3 days from today",
    "Friday 8-10",
    "every Friday 10pm-12am",
    "Friday 10pm-12am except holidays",
    "Friday 10pm-12am or Saturday noon",
    "for 3 days from today unless it rains",
    "not Friday 10pm-12am",
  ])("never accepts a partial interpretation of %s", (input) => {
    expect(interpretInterval(input, context)?.ok).not.toBe(true);
  });

  it("validates an overnight clock on its destination date", () => {
    const valid = interpretInterval("November 1, 2026 10pm-1:30am", context);
    expect(valid?.ok).toBe(true);
    if (valid?.ok) expect(valid.end.result.iso).toBe("2026-11-02T07:30:00.000Z");
    expect(interpretInterval("October 31, 2026 10pm-1:30am", context)?.ok).toBe(false);
  });

  it("keeps timezone and reference failures explicit", () => {
    for (const options of [
      { ...context, timezone: "Invalid/Zone" },
      { ...context, reference: "bad" },
    ]) {
      expect(interpretInterval("Friday 10pm-12am", options)?.ok).toBe(false);
    }
  });

  it.each([
    "from 9am to 5pm tomorrow",
    "9am–5pm tomorrow",
    "9am—5pm tomorrow",
    "between 9am and 5pm tomorrow",
    "tomorrow between 9am and 5pm",
    "tomorrow 9am—5pm",
    "tomorrow from 9am to 5pm",
  ])("resolves a shared date without changing the clocks: %s", (input) => {
    const result = interpretInterval(input, context);
    expect(result).toMatchObject({
      ok: true,
      start: { result: { iso: "2026-09-13T14:00:00.000Z" } },
      end: { result: { iso: "2026-09-13T22:00:00.000Z" } },
      allDay: false,
      overnight: false,
    });
  });

  it.each([
    "from Friday at 9am to Monday at 5pm",
    "from Fri at 9am until Mon at 5pm",
    "from Friday at 9am to on Monday at 5pm",
  ])("resolves only an unqualified ending weekday relative to the start: %s", (input) => {
    expect(interpretInterval(input, context)).toMatchObject({
      ok: true,
      start: { result: { local: "2026-09-18T09:00:00.000" } },
      end: { result: { local: "2026-09-21T17:00:00.000" } },
    });
  });

  it.each([
    ["from 2026-12-31 at 9am to Monday at 5pm", "2027-01-04T17:00:00.000"],
    ["from 2026-09-30 at 9am to Friday at 5pm", "2026-10-02T17:00:00.000"],
    ["from Friday at 9am to Friday at 5pm", "2026-09-18T17:00:00.000"],
  ])("uses civil weekday rollover, keeping equal weekdays on the same date: %s", (input, end) => {
    expect(interpretInterval(input, context)).toMatchObject({
      ok: true,
      end: { result: { local: end } },
    });
  });

  it.each([
    "from Friday at 9am to next Monday at 5pm",
    "from Friday at 9am to this Monday at 5pm",
    "from Friday at 9am to last Monday at 5pm",
    "from Friday at 9am to on next Monday at 5pm",
    "from Friday at 9am to Monday this week at 5pm",
    "from Friday at 9am to 2026-09-14 at 5pm",
    "from Friday at 9am to Friday at 9am",
    "from Friday at 9am to Friday at 8am",
  ])("never moves a qualified, explicit, or equal-weekday end: %s", (input) => {
    expect(interpretInterval(input, context)).toMatchObject({
      ok: false,
      error: { message: "The end must follow the start." },
    });
  });

  it.each([
    "from 9am to 5pm tomorrow plus 1 day",
    "9am–5pm tomorrow or Friday",
    "between 9am and 5pm tomorrow except holidays",
    "tomorrow between 9am and 5pm and 7pm",
    "between 9am and 5pm tomorrow unless it rains",
    "every Friday between 9am and 5pm",
    "from Friday at 9am to Monday at 5pm plus 1 day",
    "from Friday at 9am to Monday at 5pm or Tuesday",
  ])("fully consumes new range forms without swallowing constraints: %s", (input) => {
    expect(interpretInterval(input, context)?.ok).not.toBe(true);
  });

  it("preserves structured clock, timezone, and reference errors in clock-first forms", () => {
    expect(interpretInterval("from 25:00 to 26:00 tomorrow", context)).toMatchObject({
      ok: false,
      error: { code: "syntax" },
    });
    expect(
      interpretInterval("between 9am and 5pm tomorrow", { ...context, timezone: "Invalid/Zone" }),
    ).toMatchObject({ ok: false, error: { code: "timezone" } });
    expect(interpretInterval("9am—5pm tomorrow", { ...context, reference: "bad" })).toMatchObject({
      ok: false,
      error: { code: "reference" },
    });
  });

  it.each([
    "from Friday through Monday",
    "from 9am through 5pm tomorrow",
    "between Friday and Monday",
    "between 9 and 5 tomorrow",
    "tomorrow between 9 and 5",
    "Friday from 9 through 5",
  ])("offers range-specific recovery for unsupported wording: %s", (input) => {
    expect(interpretInterval(input, context)).toMatchObject({
      ok: false,
      error: {
        code: "syntax",
        message: "That range wording is not supported.",
        hint: expect.stringContaining("tomorrow between 9am and 5pm"),
      },
    });
  });

  it.each([
    "3 days from today",
    "3 days from 9 May",
    "two weeks from tomorrow",
    "today plus 2 days",
    "now plus 1 hour",
    "tomorrow and Friday",
  ])("does not mistake arithmetic or lists for unsupported ranges: %s", (input) => {
    expect(interpretInterval(input, context)).toBeNull();
  });
});
