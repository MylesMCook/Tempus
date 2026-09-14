import { expect, it } from "vite-plus/test";
import { appendSelection, retainOccurrenceDecisions } from "./clarify-numeric-date.js";

it.each([
  [
    "boundary:starting:date:2026-09-14",
    ["boundary:until:date:2027-01-01"],
    ["monthly:skip", "count:past:consume", "recurrence:2026-11-01:start:2026-11-01T06:30:00Z"],
  ],
  [
    "monthly:last-day",
    ["boundary:starting:date:2026-09-14"],
    ["monthly:skip", "count:exclusions:replace"],
  ],
  ["count:past:upcoming", ["monthly:skip"], ["count:past:consume", "count:exclusions:replace"]],
  ["count:exclusions:replace", ["count:past:consume"], ["count:exclusions:consume"]],
  [
    "interval:start:date:2027-03-04",
    ["list:0:month:12"],
    ["interval:start:time:12:00", "interval:end:date:2027-03-05"],
  ],
  [
    "interval:start:time:13:00",
    ["interval:start:date:2027-03-04", "interval:end:date:2027-03-05"],
    ["interval:start:2027-03-04T18:00:00Z"],
  ],
  ["list:year:2027", ["list:0:month:12"], ["list:0:year:2026", "list:1:time:12:00"]],
  ["list:0:year:2027", ["list:0:month:12", "list:1:year:2026"], ["list:0:time:12:00"]],
  ["list:0:time:13:00", ["list:0:date:2027-03-04"], ["list:0:start:2027-03-04T18:00:00Z"]],
  [
    "group:0:start:2026-11-01T07:30:00Z",
    ["group:1:end:2026-11-01T08:30:00Z"],
    ["group:0:end:2026-11-01T08:30:00Z", "group:0:end-next-day"],
  ],
  [
    "recurrence:2026-11-01:start:2026-11-01T07:30:00Z",
    ["recurrence:2026-11-08:start:2026-11-08T07:30:00Z"],
    ["recurrence:2026-11-01:end:2026-11-01T08:30:00Z"],
  ],
])(
  "invalidates dependent answers for %s while preserving independent ones",
  (next, keep, remove) => {
    const history = [...keep, ...remove];
    expect(retainOccurrenceDecisions(history, next)).toEqual(keep);
    expect(history).toEqual([...keep, ...remove]);
    expect(
      appendSelection(
        { contextKey: "context", id: history.at(-1)!, previous: history.slice(0, -1) },
        { contextKey: "context", id: next },
      )?.previous,
    ).toEqual(keep);
  },
);

it("invalidates downstream arithmetic only in the public selection accumulator", () => {
  const history = ["arithmetic:0:first", "arithmetic:1:old", "arithmetic:2:later", "event:title"];
  expect(retainOccurrenceDecisions(history, "arithmetic:1:new")).toEqual(history);
  expect(
    appendSelection(
      { contextKey: "same", previous: history.slice(0, -1), id: history.at(-1)! },
      { contextKey: "same", id: "arithmetic:1:new" },
    )?.previous,
  ).toEqual(["arithmetic:0:first", "event:title"]);
  expect(
    appendSelection(
      { contextKey: "old", id: "arithmetic:0:first" },
      { contextKey: "new", id: "arithmetic:1:new" },
    ),
  ).toEqual({ contextKey: "new", id: "arithmetic:1:new" });
});
