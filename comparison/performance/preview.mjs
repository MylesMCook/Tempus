// The shared workload compares millisecond instants with explicit offsets.
// Validate civil fields before Date.parse, which otherwise normalizes invalid dates.
const instant = (text) => {
  if (typeof text !== "string") return NaN;
  const match =
    /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.(\d{1,9}))?(Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/i.exec(
      text,
    );
  if (!match || /[1-9]/.test((match[5] ?? "").slice(3))) return NaN;
  const date = new Date(`${match[1]}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== match[1]) return NaN;
  return Date.parse(text);
};
export function samePreview(observed, expected) {
  return (
    observed.recurring === expected.recurring &&
    observed.occurrences?.length === expected.occurrences.length &&
    observed.occurrences.every((row, i) => {
      const target = expected.occurrences[i];
      return (
        instant(row.start) === instant(target.start) &&
        ((row.end === undefined && target.end === undefined) ||
          instant(row.end) === instant(target.end))
      );
    })
  );
}
