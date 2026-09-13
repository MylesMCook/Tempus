import { describe, expect, it } from "vite-plus/test";
import { Temporal } from "@js-temporal/polyfill";
import {
  AmbiguousLocalTime,
  startOfZonedDay,
  zonedInstant,
  zonedLocal,
} from "./date-engine/zoned-date.js";
import { timezoneDatabase, TimezoneDataUnavailable } from "./date-engine/timezone-database.js";

describe("pinned civil-time conversion", () => {
  it("keeps a local gap unresolved until a policy is explicitly selected", () => {
    const local = Temporal.PlainDateTime.from("2026-03-08T02:30");
    expect(() => zonedLocal(local, "America/Chicago")).toThrow(AmbiguousLocalTime);
    const earlier = zonedLocal(local, "America/Chicago", "earlier");
    const later = zonedLocal(local, "America/Chicago", "later");
    expect(earlier.toInstant().toString()).toBe("2026-03-08T07:30:00Z");
    expect(earlier.toPlainDateTime().toString()).toBe("2026-03-08T01:30:00");
    expect(later.toInstant().toString()).toBe("2026-03-08T08:30:00Z");
    expect(later.toPlainDateTime().toString()).toBe("2026-03-08T03:30:00");
  });
  it("preserves both repeated clocks and elapsed arithmetic", () => {
    const local = Temporal.PlainDateTime.from("2026-11-01T01:30");
    expect(() => zonedLocal(local, "America/Chicago")).toThrow(AmbiguousLocalTime);
    const first = zonedLocal(local, "America/Chicago", "earlier");
    const second = zonedLocal(local, "America/Chicago", "later");
    expect(first.offset).toBe("-05:00");
    expect(second.offset).toBe("-06:00");
    expect(first.addElapsed({ hours: 1 }).toInstant().equals(second.toInstant())).toBe(true);
    expect(first.toPlainDateTime().equals(second.toPlainDateTime())).toBe(true);
  });
  it("resolves a future exceptional gap from stored transitions", () => {
    const local = Temporal.PlainDateTime.from("2073-10-14T02:30");
    expect(zonedLocal(local, "Asia/Gaza", "earlier").toInstant().toString()).toBe(
      "2073-10-13T23:30:00Z",
    );
    expect(zonedLocal(local, "Asia/Gaza", "later").toInstant().toString()).toBe(
      "2073-10-14T00:30:00Z",
    );
  });
  it("retains historical seconds in both directions", () => {
    const value = zonedInstant("1899-01-15T12:00:00Z", "Asia/Gaza");
    expect(value.offset).toBe("+02:17:52");
    expect(value.toPlainDateTime().toString()).toBe("1899-01-15T14:17:52");
    expect(
      zonedLocal(value.toPlainDateTime(), value.timeZoneId).toInstant().equals(value.toInstant()),
    ).toBe(true);
  });
  it("selects day boundaries without assigning an appointment clock", () => {
    const gapDay = startOfZonedDay(Temporal.PlainDate.from("2018-11-04"), "America/Sao_Paulo");
    expect(gapDay.toPlainDateTime().toString()).toBe("2018-11-04T01:00:00");
    const repeatedDay = startOfZonedDay(Temporal.PlainDate.from("2026-11-01"), "America/Havana");
    expect(repeatedDay.toInstant().toString()).toBe("2026-11-01T04:00:00Z");
    const skippedDay = startOfZonedDay(Temporal.PlainDate.from("2011-12-30"), "Pacific/Apia");
    expect(skippedDay.toPlainDate().toString()).toBe("2011-12-31");
  });
  it("does not turn unavailable history into a gap suggestion", () => {
    expect(() =>
      zonedLocal(Temporal.PlainDateTime.from("1900-01-15T12:00"), "Antarctica/Casey", "later"),
    ).toThrow(TimezoneDataUnavailable);
  });
  it("enumerates actual transitions at coverage boundaries", () => {
    const zone = timezoneDatabase("America/Chicago");
    const first = Date.parse("2026-03-08T08:00:00Z") / 1000;
    const last = Date.parse("2026-11-01T07:00:00Z") / 1000;
    expect(zone.transitionInstants(first, last)).toEqual([first, last]);
    expect(zone.transitionInstants(first + 1, last - 1)).toEqual([]);
    expect(() => zone.transitionInstants(first, first + 13 * 366 * 86400)).toThrow(RangeError);
  });
});
