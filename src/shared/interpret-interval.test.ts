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
});
