import type { CalculationIssue, Span } from "./date-engine/types.js";
import type { CalculationSuccess } from "./date-parser.js";
import { calculateScheduleDate } from "./calculate-schedule-date.js";
import { clockChoices } from "./clarify-clock.js";
import { numericDateChoices, type ClarificationChoice } from "./clarify-numeric-date.js";
import { interpretInterval, normalizeHalfHour } from "./interpret-interval.js";
import { zonedInstant } from "./date-engine/zoned-date.js";

export type DateListCandidate =
  | {
      ok: true;
      kind: "collection";
      timezone: string;
      truncated: false;
      selectedClocks?: string[];
      occurrences: {
        start: CalculationSuccess;
        end?: CalculationSuccess;
        allDay: boolean;
        source: { text: string; span: Span };
      }[];
    }
  | {
      ok: false;
      error: CalculationIssue;
      clockPrompt?: { question: string; choices: ClarificationChoice[] };
    };
const month =
  "January|February|March|April|May|June|July|August|September|October|November|December";
const date = String.raw`(?:\d{4}-\d{2}-\d{2}|(?:${month})\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*|\s+)\d{4}|\d{1,2}/\d{1,2}/\d{4})`;
const clock = String.raw`(?:\d{1,2}(?::\d{2})?\s*[ap]m|\d{1,2}:\d{2}|noon|midnight)`;
const timeSuffix = `((?: at ${clock}(?: for \\d+ (?:seconds?|minutes?|hours?|days?|weeks?))?| from ${clock} to ${clock})?)`;
const clause = new RegExp(`^(${date})${timeSuffix}$`, "i");
const shorthand = new RegExp(
  `^(?:(${month})\\s+)?(\\d{1,2}(?:st|nd|rd|th)?)(?:(?:,\\s*|\\s+)(\\d{4}))?${timeSuffix}$`,
  "i",
);
const namedStart = new RegExp(`^(?:${month})\\s+\\d{1,2}(?:st|nd|rd|th)?(?: |,|$)`, "i");

/** Share a written month, or an explicitly selected year across named months. */
function expandNamedDates(pieces: string[], selectedYear?: string): string[] | null {
  const matches = pieces.map((piece) => shorthand.exec(normalizeHalfHour(piece)));
  if (matches.some((match) => !match) || !matches[0]?.[1]) return null;
  const months = [...new Set(matches.map((match) => match![1]?.toLowerCase()).filter(Boolean))];
  const years = [...new Set(matches.map((match) => match![3]).filter(Boolean))];
  if (!years.length && selectedYear) years.push(selectedYear);
  if (years.length !== 1) return null;
  // Across different months, never infer a shared written year or carry a
  // missing month: December/January can mean different calendar years.
  if (months.length > 1 && (!selectedYear || matches.some((match) => !match![1]))) return null;
  return matches.map((match) => `${match![1] ?? months[0]} ${match![2]}, ${years[0]}${match![4]}`);
}

/** Finite dates in written order. Shared clocks require explicit choices. */
export function interpretDateList(
  text: string,
  options: { timezone: string; reference: string; clockDecisions?: string[] },
): DateListCandidate | null {
  if (text.length > 200 || !/\s+and\s+/i.test(text)) return null;
  const pieces = text.split(/\s+and\s+/i);
  if (!new RegExp(`^${date}(?: |$)`, "i").test(pieces[0]) && !namedStart.test(pieces[0]))
    return null;
  const invalid = (message: string): DateListCandidate => ({
    ok: false,
    error: {
      code: "syntax",
      message,
      hint: "Write complete dates, or one month and year for same-month dates joined by ‘and’. No date or qualifier has been discarded.",
    },
  });
  if (pieces.length > 14) return invalid("Use at most 14 dates in one input.");
  const shorthandMatches = pieces.map((piece) => shorthand.exec(normalizeHalfHour(piece)));
  const namedPieces = [...pieces];
  const monthNotes: string[] = [];
  const writtenMonths = [
    ...new Set(shorthandMatches.map((match) => match?.[1]?.toLowerCase()).filter(Boolean)),
  ];
  if (shorthandMatches.every(Boolean) && shorthandMatches[0]?.[1] && writtenMonths.length > 1) {
    for (const [index, match] of shorthandMatches.entries()) {
      if (match![1]) continue;
      const prefix = `list:${index}:month:`;
      const choices = month
        .split("|")
        .filter((name) => writtenMonths.includes(name.toLowerCase()))
        .map((name) => ({
          id: `${prefix}${name.toLowerCase()}`,
          label: `${name} ${match![2]}`,
          expression: `${name} ${pieces[index]}`,
        }));
      const answers = [...new Set(options.clockDecisions?.filter((id) => id.startsWith(prefix)))];
      const selected =
        answers.length === 1 ? choices.find((choice) => choice.id === answers[0]) : undefined;
      if (!selected) {
        const question = `Which month applies to date ${index + 1} (${pieces[index]})?`;
        return {
          ok: false,
          error: {
            code: "syntax",
            message: question,
            hint: "Choose a written month, or add another month to this date in the input. No month has been assumed.",
          },
          clockPrompt: { question, choices },
        };
      }
      namedPieces[index] = selected.expression;
      shorthandMatches[index] = shorthand.exec(normalizeHalfHour(selected.expression));
      monthNotes.push(`Date ${index + 1}: ${selected.label}`);
    }
  }
  const needsYear =
    shorthandMatches.every(Boolean) &&
    shorthandMatches[0]?.[1] &&
    shorthandMatches.every((match) => !match![3]) &&
    (shorthandMatches.every((match) => Boolean(match![1])) ||
      new Set(shorthandMatches.map((match) => match![1]?.toLowerCase()).filter(Boolean)).size ===
        1);
  let selectedYear: string | undefined;
  if (needsYear) {
    const year = zonedInstant(options.reference, options.timezone).year;
    const years = [year, year + 1]
      .filter((value) => value >= 1 && value <= 9999)
      .map((value) => String(value).padStart(4, "0"));
    const answers = [
      ...new Set(options.clockDecisions?.filter((id) => id.startsWith("list:year:"))),
    ];
    if (answers.length === 1 && years.some((value) => answers[0] === `list:year:${value}`))
      selectedYear = answers[0].slice("list:year:".length);
    if (!selectedYear) {
      const question = "Which year applies to all these dates?";
      return {
        ok: false,
        error: {
          code: "syntax",
          message: question,
          hint: "Choose one year for all dates, or write another year on each date. No year or year rollover has been assumed.",
        },
        clockPrompt: {
          question,
          choices: years.map((value) => ({
            id: `list:year:${value}`,
            label: String(value),
            expression: String(value),
          })),
        },
      };
    }
  }
  let expanded = expandNamedDates(namedPieces, selectedYear) ?? namedPieces;
  const itemYearNotes: string[] = [];
  const writtenYears = [...new Set(shorthandMatches.map((match) => match?.[3]).filter(Boolean))];
  if (
    shorthandMatches.every((match) => Boolean(match?.[1])) &&
    new Set(shorthandMatches.map((match) => match![1].toLowerCase())).size > 1 &&
    writtenYears.length === 1 &&
    shorthandMatches.some((match) => !match![3])
  ) {
    expanded = [];
    const anchorYear = Number(writtenYears[0]);
    const years = [anchorYear - 1, anchorYear, anchorYear + 1]
      .filter((year) => year >= 1 && year <= 9999)
      .map((year) => String(year).padStart(4, "0"));
    for (const [index, match] of shorthandMatches.entries()) {
      let year: string | undefined = match![3];
      if (!year) {
        const prefix = `list:${index}:year:`;
        const answers = [...new Set(options.clockDecisions?.filter((id) => id.startsWith(prefix)))];
        year =
          answers.length === 1 && years.includes(answers[0].slice(prefix.length))
            ? answers[0].slice(prefix.length)
            : undefined;
        if (!year) {
          const question = `Which year applies to ${match![1]} ${match![2]}?`;
          return {
            ok: false,
            error: {
              code: "syntax",
              message: question,
              hint: "Choose this date’s year, or write it in the input. Written years stay unchanged.",
            },
            clockPrompt: {
              question,
              choices: years.map((value) => ({
                id: `${prefix}${value}`,
                label: value,
                expression: `${match![1]} ${match![2]}, ${value}${match![4]}`,
              })),
            },
          };
        }
        itemYearNotes.push(`Date ${index + 1}: ${year}`);
      }
      expanded.push(`${match![1]} ${match![2]}, ${year}${match![4]}`);
    }
  }

  const matches = expanded.map((piece) => clause.exec(normalizeHalfHour(piece)));
  if (matches.some((match) => !match))
    return invalid("Complete every listed date and its time or range.");
  const writtenTimes = [...new Set(matches.map((match) => match![2]).filter(Boolean))];
  const occurrences: Extract<DateListCandidate, { ok: true }>["occurrences"] = [];
  const notes: string[] = [
    ...(selectedYear ? [`${selectedYear} for every listed date`] : []),
    ...monthNotes,
    ...itemYearNotes,
  ];
  const seen = new Set<string>();
  let position = 0;
  for (const [index, piece] of pieces.entries()) {
    const start = text.indexOf(piece, position);
    position = start + piece.length;
    const source = { text: piece, span: { start, end: position } };
    const match = matches[index]!;
    const choicesFor = (endpoint: string) => {
      const prefix = `list:${index}:${endpoint}:`;
      const answers = [...new Set(options.clockDecisions?.filter((id) => id.startsWith(prefix)))];
      return answers.length === 1 ? answers[0].slice(prefix.length) : undefined;
    };
    const prompt = (
      question: string,
      choices: ClarificationChoice[],
      endpoint: string,
    ): DateListCandidate => ({
      ok: false,
      error: {
        code: endpoint === "date" || endpoint === "time" ? "syntax" : "ambiguous-time",
        message: question,
        hint: "Choose an interpretation for this listed date.",
      },
      clockPrompt: {
        question: `Date ${index + 1} (${piece}): ${question}`,
        choices: choices.map((choice) => ({
          ...choice,
          id: `list:${index}:${endpoint}:${choice.id}`,
        })),
      },
    });
    let anchor = match[1];
    if (match[1].includes("/")) {
      const alternatives = numericDateChoices(match[1]);
      const chosen =
        alternatives?.length === 1
          ? alternatives[0]
          : alternatives?.find((choice) => choice.id === choicesFor("date"));
      if (!chosen) {
        if (!alternatives?.length) return invalid("A listed date is not valid.");
        return prompt("Which date did you mean?", alternatives, "date");
      }
      anchor = chosen.expression;
      if (alternatives!.length > 1) notes.push(`Date ${index + 1}: ${chosen.label}`);
    }
    let suffix = match[2];
    if (!suffix && writtenTimes.length) {
      const choices = [
        ...writtenTimes.map((time, timeIndex) => ({
          id: String(timeIndex),
          label: time.trim().replace(/^./, (char) => char.toUpperCase()),
          expression: anchor + time,
        })),
        { id: "date-only", label: "Keep this date without a time", expression: anchor },
      ];
      const chosen = choices.find((choice) => choice.id === choicesFor("time"));
      if (!chosen) return prompt("What time applies to this date?", choices, "time");
      suffix = chosen.id === "date-only" ? "" : writtenTimes[Number(chosen.id)];
      notes.push(`Date ${index + 1}: ${chosen.label}`);
    }
    const expression = anchor + suffix;
    let occurrence: (typeof occurrences)[number];
    if (/\b(?:from|for)\b/i.test(suffix)) {
      let range = interpretInterval(expression, {
        ...options,
        clockSelections: { start: choicesFor("start"), end: choicesFor("end") },
      });
      if (!range) return invalid("A listed range could not be resolved.");
      if (!range.ok && range.equalEndpoints) {
        const candidate = interpretInterval(expression, {
          ...options,
          equalEndpoints: "next-day",
          clockSelections: { start: choicesFor("start"), end: choicesFor("end") },
        });
        if (candidate?.ok) {
          const id = `list:${index}:end-next-day`;
          const label = `End on ${candidate.end.result.local.slice(0, 10)} at ${candidate.end.result.local.slice(11, 16)}`;
          if (!options.clockDecisions?.includes(id))
            return {
              ok: false,
              error: range.error,
              clockPrompt: {
                question: `Date ${index + 1}: should this end on the next date?`,
                choices: [{ id, label, expression }],
              },
            };
          notes.push(`Date ${index + 1}: ${label}`);
          range = candidate;
        } else if (candidate) range = candidate;
      }
      if (!range.ok) {
        if (range.clockPrompt)
          return prompt(
            range.clockPrompt.question,
            range.clockPrompt.choices,
            range.clockPrompt.endpoint,
          );
        return { ok: false, error: range.error };
      }
      notes.push(...(range.selectedClocks ?? []).map((label) => `Date ${index + 1}: ${label}`));
      occurrence = { start: range.start, end: range.end, allDay: false, source };
    } else {
      let calculation = calculateScheduleDate(expression, options);
      if (!calculation.ok && calculation.error.code === "ambiguous-time") {
        const question = clockChoices(expression, options);
        if (question) {
          const chosen = question.choices.find((choice) => choice.id === choicesFor("start"));
          if (!chosen) return prompt(question.question, question.choices, "start");
          calculation = calculateScheduleDate("now", {
            timezone: options.timezone,
            reference: chosen.id,
          });
          if (calculation.ok)
            calculation = {
              ...calculation,
              anchorDescription: `Use the explicitly selected time for listed date ${index + 1}: ${chosen.label}`,
            };
          notes.push(`Date ${index + 1}: ${chosen.label}`);
        }
      }
      if (!calculation.ok) return { ok: false, error: calculation.error };
      occurrence = { start: calculation, allDay: !suffix, source };
    }
    const key = `${occurrence.start.result.iso}/${occurrence.end?.result.iso ?? ""}/${occurrence.allDay}`;
    if (seen.has(key)) return invalid("The same date or interval appears more than once.");
    seen.add(key);
    occurrences.push(occurrence);
  }
  return {
    ok: true,
    kind: "collection",
    timezone: options.timezone,
    truncated: false,
    occurrences,
    ...(notes.length ? { selectedClocks: notes } : {}),
  };
}
