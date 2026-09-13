import { describe, expect, it, vi } from "vite-plus/test";
import {
  timezoneDatabase,
  TimezoneDataUnavailable,
  TIMEZONE_DATA_VERSION,
} from "./date-engine/timezone-database.js";

describe("pinned timezone database", () => {
  it.each([
    ["America/Yellowknife", "2026-12-01T12:00:00Z", ["2026-12-01T18:00:00.000Z"]],
    [
      "America/Chicago",
      "2026-11-01T01:30:00Z",
      ["2026-11-01T06:30:00.000Z", "2026-11-01T07:30:00.000Z"],
    ],
    ["America/Chicago", "2026-03-08T02:30:00Z", []],
    [
      "Australia/Lord_Howe",
      "2026-04-05T01:45:00Z",
      ["2026-04-04T14:45:00.000Z", "2026-04-04T15:15:00.000Z"],
    ],
    ["Pacific/Apia", "2011-12-30T12:00:00Z", []],
    ["Asia/Gaza", "1900-10-01T00:00:00Z", ["1900-09-30T22:00:00.000Z"]],
    ["Asia/Gaza", "2073-09-02T02:00:00Z", ["2073-09-02T00:00:00.000Z"]],
    ["America/Chicago", "9999-12-01T12:00:00Z", ["9999-12-01T18:00:00.000Z"]],
    ["UTC", "0001-01-15T12:00:00Z", ["0001-01-15T12:00:00.000Z"]],
  ])("resolves %s at %s without a DST default", (zone, wall, expected) => {
    expect(timezoneDatabase(zone).possibleInstants(Date.parse(wall))).toEqual(expected);
  });

  it("distinguishes unavailable history from a skipped clock", () => {
    expect(() =>
      timezoneDatabase("Antarctica/Casey").possibleInstants(Date.parse("1900-01-15T12:00:00Z")),
    ).toThrow(TimezoneDataUnavailable);
  });

  it("keeps historical second offsets", () => {
    expect(timezoneDatabase("Asia/Gaza").offsetAt(Date.parse("1899-01-15T12:00:00Z") / 1000)).toBe(
      8272,
    );
  });

  it("uses named data even when runtime timezone formatting is unavailable", () => {
    const formatter = vi.spyOn(Intl, "DateTimeFormat").mockImplementation(() => {
      throw new Error("Host formatting unavailable");
    });
    try {
      expect(TIMEZONE_DATA_VERSION).toBe("2026d");
      expect(
        timezoneDatabase("america/yellowknife").possibleInstants(
          Date.parse("2026-12-01T12:00:00Z"),
        ),
      ).toEqual(["2026-12-01T18:00:00.000Z"]);
      expect(() => timezoneDatabase("+06:00")).toThrow("Unknown IANA timezone");
      expect(() => timezoneDatabase("Unknown/Zone")).toThrow("Unknown IANA timezone");
    } finally {
      formatter.mockRestore();
    }
  });
});

it("keeps future offset queries independent of year order and transition direction", () => {
  for (const [name, january, july] of [
    ["America/Chicago", -21600, -18000],
    ["Australia/Lord_Howe", 39600, 37800],
    ["Europe/Dublin", 0, 3600],
  ] as const) {
    const zone = timezoneDatabase(name);
    for (const year of [2100, 9998, 2038, 2100, 2026, 9998, 2027]) {
      for (const [month, expected] of [
        ["01", january],
        ["07", july],
        ["01", january],
      ] as const)
        expect(
          zone.offsetAt(Date.parse(`${year}-${month}-15T12:00:00Z`) / 1000) === expected,
          `${name} ${year}-${month}`,
        ).toBe(true);
    }
  }
  const chicago = timezoneDatabase("America/Chicago");
  for (const instant of ["2026-11-01T07:00:00Z", "2026-03-08T08:00:00Z"]) {
    const transition = Date.parse(instant) / 1000;
    const before = instant.includes("11-01") ? -18000 : -21600;
    const after = instant.includes("11-01") ? -21600 : -18000;
    for (const [time, expected] of [
      [transition, after],
      [transition - 1, before],
      [transition, after],
    ])
      expect(chicago.offsetAt(time)).toBe(expected);
  }
});
