import assert from "node:assert/strict";
import { samePreview } from "./preview.mjs";
const expected = { recurring: false, occurrences: [{ start: "2026-09-13T17:00:00.000Z" }] };
assert.equal(
  samePreview(
    { recurring: false, occurrences: [{ start: "2026-09-13T12:00:00-05:00" }] },
    expected,
  ),
  true,
);
assert.equal(
  samePreview(
    { recurring: false, occurrences: [{ start: "2026-09-13T12:00:00-04:00" }] },
    expected,
  ),
  false,
);
assert.equal(
  samePreview(
    { recurring: false, occurrences: [{ start: "2026-09-13T17:00:00.000001Z" }] },
    expected,
  ),
  false,
);
assert.equal(samePreview({ recurring: false, occurrences: [] }, expected), false);
assert.equal(samePreview({ recurring: true, occurrences: expected.occurrences }, expected), false);
assert.equal(
  samePreview(
    {
      recurring: false,
      occurrences: [{ ...expected.occurrences[0], end: "2026-09-13T18:00:00Z" }],
    },
    expected,
  ),
  false,
);

const row = (start) => ({ recurring: false, occurrences: [{ start }] });
const march = row("2026-03-02T12:00:00Z");
for (const value of [
  "2026-02-30T12:00:00Z",
  "2026-03-02T12:00:00",
  "2026-03-02",
  "2026-03-02T12:00:00.000001Z",
  "2026-03-02T12:00:00+24:00",
  "2026-03-01T24:00:00Z",
  "not-a-date",
])
  assert.equal(samePreview(row(value), march), false, value);
assert.equal(samePreview(row("2026-03-02T07:00:00-05:00"), march), true);
assert.equal(samePreview(row("2000-02-29T12:00:00Z"), row("2000-02-29T12:00:00Z")), true);
assert.equal(samePreview(row("1900-02-29T12:00:00Z"), row("1900-03-01T12:00:00Z")), false);
assert.equal(samePreview(row("0001-01-01T12:00:00Z"), row("0001-01-01T12:00:00Z")), true);
assert.equal(
  samePreview(row("2026-03-02T12:00:00.123000Z"), row("2026-03-02T12:00:00.123Z")),
  true,
);
assert.equal(
  samePreview(row("2026-03-02T12:00:00.123001Z"), row("2026-03-02T12:00:00.123Z")),
  false,
);
assert.equal(samePreview(row("2026-03-02T12:00:00+05:45"), row("2026-03-02T06:15:00Z")), true);
console.log("Existing checks and strict-date regression cases passed");
