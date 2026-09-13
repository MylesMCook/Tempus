import { readZone } from "./tzif-prototype.mjs";

// Portable development probe. The caller supplies generated, pinned TZif bytes.
export function probeRuntime(data) {
  const started = performance.now();
  const originalIntl = Intl.DateTimeFormat;
  const cache = new Map();
  const read = (name) => {
    const index = data.aliases[name];
    if (!Number.isInteger(index)) throw new Error("Unknown test zone");
    if (!cache.has(index)) {
      const bytes = Uint8Array.from(atob(data.files[index]), (char) => char.charCodeAt(0));
      cache.set(index, readZone(bytes));
    }
    return cache.get(index);
  };
  const cases = [
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
    ["Asia/Kathmandu", "2026-09-12T12:00:00Z", ["2026-09-12T06:15:00.000Z"]],
    ["Asia/Gaza", "1900-10-01T00:00:00Z", ["1900-09-30T22:00:00.000Z"]],
    ["America/Chicago", "9999-12-01T12:00:00Z", ["9999-12-01T18:00:00.000Z"]],
  ];
  const records = cases.map(([zone, wall, expected]) => {
    const start = performance.now();
    const observed = read(zone).possibleInstants(Date.parse(wall));
    return {
      zone,
      wall,
      expected,
      observed,
      matches: JSON.stringify(observed) === JSON.stringify(expected),
      elapsedMs: performance.now() - start,
    };
  });
  let unspecified;
  try {
    read("Antarctica/Casey").possibleInstants(Date.parse("1900-01-15T12:00:00Z"));
  } catch (error) {
    unspecified = error.message;
  }
  const unchangedIntl = Intl.DateTimeFormat === originalIntl;
  return {
    records,
    unspecified,
    unchangedIntl,
    zoneFilesParsed: cache.size,
    passed:
      records.every((row) => row.matches) &&
      unspecified === "Unspecified time type" &&
      unchangedIntl,
    elapsedMs: performance.now() - started,
    limits:
      "Eight authored cases plus one expected unavailable-data outcome. Not full runtime conformance, product integration or comparative performance.",
  };
}
