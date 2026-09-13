import type { Interpretation } from "../src/shared/interpret-date";
import type { Observed } from "./scoring";

/** Preview adapter only: preserve precision supplied by the interpreter. */
export function observeTempus(interpretation: Interpretation): Observed {
  return {
    occurrences:
      interpretation.status === "resolved"
        ? interpretation.value.kind === "point"
          ? [
              {
                start: interpretation.value.calculation.result.iso,
                allDay: interpretation.value.precision === "date",
              },
            ]
          : interpretation.value.kind === "interval"
            ? [
                {
                  start: interpretation.value.start.result.iso,
                  end: interpretation.value.end.result.iso,
                  allDay: interpretation.value.allDay,
                },
              ]
            : interpretation.value.occurrences.map((row) => ({
                start: row.start.result.iso,
                ...(row.end ? { end: row.end.result.iso } : {}),
                allDay: "allDay" in row ? row.allDay : false,
              }))
        : [],
    recurring: interpretation.status === "resolved" && interpretation.value.kind === "recurrence",
    diagnostics:
      interpretation.status === "resolved"
        ? interpretation.assumptions
        : [interpretation.status, interpretation.error.message],
  };
}
