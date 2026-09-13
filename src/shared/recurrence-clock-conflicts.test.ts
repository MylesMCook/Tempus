import { expect, it } from "vite-plus/test";
import { recurrenceClockConflict, recurrenceIntervalConflict } from "./recurrence-clock-conflicts";
const base = {
  timezone: "America/Chicago",
  reference: "2026-09-12T16:00:00Z",
  weekdays: [7],
  exceptions: [],
};
it("finds the repeated clock beyond the three-row preview", () => {
  expect(recurrenceClockConflict({ ...base, clock: "1:30am" })).toEqual({
    local: "2026-11-01T01:30:00",
    choices: ["2026-11-01T06:30:00Z", "2026-11-01T07:30:00Z"],
  });
});
it("finds the next year's skipped clock", () => {
  expect(recurrenceClockConflict({ ...base, clock: "2:30am" })).toEqual({
    local: "2027-03-14T02:30:00",
    choices: ["2027-03-14T07:30:00Z", "2027-03-14T08:30:00Z"],
  });
});
it("an exception removes only that occurrence, not future clock conflicts", () => {
  expect(
    recurrenceClockConflict({ ...base, clock: "1:30am", exceptions: ["2026-11-01"] })?.local,
  ).toBe("2027-11-07T01:30:00");
});
it("finds a whole skipped Friday despite a noon clock", () => {
  expect(
    recurrenceClockConflict({
      ...base,
      timezone: "Pacific/Apia",
      reference: "2011-12-01T00:00:00Z",
      weekdays: [5],
      clock: "noon",
    })?.local,
  ).toBe("2011-12-30T12:00:00");
});
it("finds a half-hour repeat", () => {
  expect(
    recurrenceClockConflict({
      ...base,
      timezone: "Australia/Lord_Howe",
      reference: "2026-01-01T00:00:00Z",
      clock: "1:45am",
    }),
  ).toEqual({
    local: "2026-04-05T01:45:00",
    choices: ["2026-04-04T14:45:00Z", "2026-04-04T15:15:00Z"],
  });
});

it("retains a repeated start that is upcoming after the transition instant", () => {
  expect(
    recurrenceClockConflict({ ...base, reference: "2026-11-01T07:15:00Z", clock: "1:30am" })?.local,
  ).toBe("2026-11-01T01:30:00");
});
it("checks the complete future cycle for ordinary noon schedules", () => {
  expect(recurrenceClockConflict({ ...base, weekdays: [1, 3, 5], clock: "noon" })).toBeNull();
});

it("allows a Monday workday whose intervals never contain a clock change", () => {
  expect(
    recurrenceIntervalConflict({
      ...base,
      weekdays: [1],
      reference: "2026-01-05T15:00:00Z",
      clock: "9am",
      durationMilliseconds: 8 * 3600000,
    }),
  ).toBeNull();
});
it("finds a spring clock change inside an elapsed interval beyond the preview", () => {
  expect(
    recurrenceIntervalConflict({
      ...base,
      reference: "2026-01-04T06:00:00Z",
      clock: "midnight",
      durationMilliseconds: 4 * 3600000,
    }),
  ).toBe("2026-03-08T08:00:00.000Z");
});
it("retains a later interval conflict after an excluded transition date", () => {
  expect(
    recurrenceIntervalConflict({
      ...base,
      reference: "2026-01-04T06:00:00Z",
      clock: "midnight",
      durationMilliseconds: 4 * 3600000,
      exceptions: ["2026-03-08"],
    }),
  ).toBe("2026-11-01T07:00:00.000Z");
});
it("checks overnight intervals on the preceding weekday", () => {
  expect(
    recurrenceIntervalConflict({
      ...base,
      weekdays: [6],
      reference: "2026-01-04T05:00:00Z",
      clock: "11pm",
      durationMilliseconds: 4 * 3600000,
    }),
  ).toBe("2026-03-08T08:00:00.000Z");
});

it("skips an inactive fortnight and reports the next actual repeated clock", () => {
  const result = recurrenceClockConflict({
    ...base,
    reference: "2026-10-25T06:30:00Z",
    clock: "1:30am",
    interval: 2,
  });
  // October 25 is active; November 1 is not. 2027 November 7 is 54 weeks later.
  expect(result?.local).toBe("2027-11-07T01:30:00");
});
it("skips inactive transition dates without losing a later contained change", () => {
  const result = recurrenceIntervalConflict({
    ...base,
    reference: "2026-03-01T06:00:00Z",
    clock: "midnight",
    interval: 2,
    durationMilliseconds: 4 * 3600000,
  });
  // March 8 is one week after the anchor; November 1 is 35 weeks after it.
  // March 14, 2027 is 54 weeks after it and therefore active.
  expect(result).toBe("2027-03-14T08:00:00.000Z");
});
it("uses shifted active-week boundaries for overnight endpoint clocks", () => {
  const result = recurrenceClockConflict({
    ...base,
    reference: "2026-10-26T06:30:00Z",
    clock: "1:30am",
    interval: 2,
    weekAnchor: "2026-10-20",
    weekdays: [1, 7],
  });
  expect(result?.local).toBe("2027-11-07T01:30:00");
});
it("looks back to an active earlier occurrence when long intervals overlap a transition", () => {
  const result = recurrenceIntervalConflict({
    ...base,
    reference: "2026-03-01T06:00:00Z",
    clock: "midnight",
    interval: 2,
    durationMilliseconds: 10 * 86400000,
  });
  expect(result).toBe("2026-03-08T08:00:00.000Z");
});
