import type { CalculationIssue, Span } from "./date-engine/types.js";
import type { CalculationSuccess } from "./date-parser.js";
import { weekdayAliases } from "./date-engine/vocabulary.js";
import { interpretInterval } from "./interpret-interval.js";
import type { clockChoices } from "./clarify-clock.js";

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  ...Object.keys(weekdayAliases),
].join("|");
const clock = String.raw`(?:\d{1,2}(?::\d{2})?\s*[ap]m|\d{1,2}:\d{2}|noon|midnight)`;
export type GroupCandidate =
  | {
      ok: true;
      kind: "collection";
      timezone: string;
      truncated: false;
      selectedClocks?: string[];
      occurrences: {
        start: CalculationSuccess;
        end: CalculationSuccess;
        source: { text: string; span: Span };
      }[];
    }
  | {
      ok: false;
      error: CalculationIssue;
      clockPrompt?: NonNullable<ReturnType<typeof clockChoices>>;
    };

/** Finite weekday groups, never implicit recurrence. All source text must be consumed. */
export function interpretGroups(
  text: string,
  options: { timezone: string; reference: string; clockDecisions?: string[] },
): GroupCandidate | null {
  if (text.length > 200) return null;
  const group = new RegExp(
    `((?:${days})(?:\\s+(?:${days}))*)\\s+(?:from\\s+)?(${clock})\\s*(?:to|[-–])\\s*(${clock})`,
    "iy",
  );
  const occurrences: Extract<GroupCandidate, { ok: true }>["occurrences"] = [];
  let position = 0;
  const duplicate = new Set<string>();
  const selectedClocks: string[] = [];
  const matches: { match: RegExpExecArray; start: number; end: number }[] = [];
  const invalid = (message: string): GroupCandidate => ({
    ok: false,
    error: {
      code: "syntax",
      message,
      hint: "Use complete weekday ranges, such as “Sat Sun 1pm-8pm Mon 10pm-12am”.",
    },
  });
  while (position < text.length) {
    group.lastIndex = position;
    const match = group.exec(text);
    if (!match)
      return matches.length
        ? invalid("Complete every weekday range and remove unsupported trailing text.")
        : null;
    // A single weekday/range belongs to the interval resolver, including its clarification flow.
    if (position === 0 && group.lastIndex === text.length && !/\s/.test(match[1])) return null;
    matches.push({ match, start: position, end: group.lastIndex });
    position = group.lastIndex;
    if (position === text.length) break;
    const separator = /^(?:\s+|;\s*|,\s*)/.exec(text.slice(position));
    if (!separator || position + separator[0].length === text.length) return null;
    position += separator[0].length;
  }
  // Validate the whole collection before asking about any individual clock.
  const count = matches.reduce((sum, { match }) => sum + match[1].split(/\s+/).length, 0);
  if (count < 2) return null;
  if (count > 14) return invalid("Use at most 14 intervals in one input.");
  for (const { match, start, end } of matches) {
    const source = { text: match[0], span: { start, end } };
    for (const day of match[1].split(/\s+/)) {
      const rangeIndex = occurrences.length;
      const clockSelections: Partial<Record<"start" | "end", string>> = {};
      for (const endpoint of ["start", "end"] as const) {
        const prefix = `group:${rangeIndex}:${endpoint}:`;
        const decisions = [
          ...new Set(options.clockDecisions?.filter((id) => id.startsWith(prefix))),
        ];
        if (decisions.length === 1) clockSelections[endpoint] = decisions[0].slice(prefix.length);
      }
      const expression = `${day} ${match[2]}-${match[3]}`;
      const intervalOptions = {
        ...options,
        clockSelections,
      };
      let interval = interpretInterval(expression, intervalOptions);
      if (!interval) return invalid("An interval could not be interpreted completely.");
      if (!interval.ok && interval.equalEndpoints) {
        const candidate = interpretInterval(expression, {
          ...intervalOptions,
          equalEndpoints: "next-day",
        });
        if (candidate && !candidate.ok) interval = candidate;
        if (candidate?.ok) {
          const id = `group:${rangeIndex}:end-next-day`;
          const label = `End on ${candidate.end.result.local.slice(0, 10)} at ${candidate.end.result.local.slice(11, 16)} (${options.timezone}, UTC${candidate.end.result.offset})`;
          if (!options.clockDecisions?.includes(id))
            return {
              ok: false,
              error: interval.error,
              clockPrompt: {
                question: `Range ${rangeIndex + 1} (${day}): should this end on the next date?`,
                choices: [{ id, label, expression }],
              },
            };
          interval = candidate;
          selectedClocks.push(`Range ${rangeIndex + 1} (${day}): ${label}`);
        }
      }
      if (!interval.ok)
        return {
          ok: false,
          error: interval.error,
          ...(interval.clockPrompt
            ? {
                clockPrompt: {
                  question: `Range ${rangeIndex + 1} (${day}), ${interval.clockPrompt.endpoint}: ${interval.clockPrompt.question}`,
                  choices: interval.clockPrompt.choices.map((choice) => ({
                    ...choice,
                    id: `group:${rangeIndex}:${interval.clockPrompt!.endpoint}:${choice.id}`,
                  })),
                },
              }
            : {}),
        };
      selectedClocks.push(
        ...(interval.selectedClocks ?? []).map(
          (label) => `Range ${rangeIndex + 1} (${day}): ${label}`,
        ),
      );
      const id = `${interval.start.result.iso}/${interval.end.result.iso}`;
      if (duplicate.has(id)) return invalid("The same interval appears more than once.");
      duplicate.add(id);
      occurrences.push({ start: interval.start, end: interval.end, source });
    }
  }
  return {
    ok: true,
    kind: "collection",
    timezone: options.timezone,
    truncated: false,
    occurrences,
    ...(selectedClocks.length ? { selectedClocks } : {}),
  };
}
