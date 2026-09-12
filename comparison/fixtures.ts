export type Occurrence = { start: string; end?: string };
export type Expected =
  | { kind: "resolved"; occurrences: Occurrence[]; recurring: boolean }
  | { kind: "no-expression" | "invalid" | "ambiguous" };
export type Fixture = {
  id: string;
  family: "dates" | "arithmetic" | "sentences" | "schedules" | "recovery";
  text: string;
  expected: Expected;
  rationale: string;
  reference?: string;
  preserve?: true;
};

export const context = {
  reference: "2026-09-12T16:00:00.000Z", // Saturday, 11:00 in Chicago.
  timeZone: "America/Chicago",
  limit: 3,
};

const point = (start: string): Expected => ({
  kind: "resolved",
  occurrences: [{ start }],
  recurring: false,
});
const interval = (start: string, end: string): Expected => ({
  kind: "resolved",
  occurrences: [{ start, end }],
  recurring: false,
});

// Authored expectations, not captured parser outputs. All cases are development fixtures.
// Recurrence scoring covers the next three occurrences, not the validity of exported rules.
export const fixtures: Fixture[] = [
  {
    id: "date-ago",
    family: "dates",
    text: "3 weeks ago",
    expected: point("2026-08-22T16:00:00Z"),
    rationale: "Subtract 21 calendar days from September 12 at 11:00 CDT.",
    preserve: true,
  },
  {
    id: "date-noon",
    family: "dates",
    text: "tomorrow at noon",
    expected: point("2026-09-13T17:00:00Z"),
    rationale: "September 13 noon CDT is 17:00 UTC.",
    preserve: true,
  },
  {
    id: "date-friday",
    family: "dates",
    text: "next Friday",
    expected: point("2026-09-18T05:00:00Z"),
    rationale: "The next Friday after Saturday September 12 is September 18, at midnight CDT.",
    preserve: true,
  },
  {
    id: "date-yesterday",
    family: "dates",
    text: "yesterday",
    expected: point("2026-09-11T05:00:00Z"),
    rationale: "The preceding civil date starts at midnight CDT.",
    preserve: true,
  },
  {
    id: "date-spring-day",
    family: "dates",
    text: "in 1 day",
    reference: "2026-03-07T18:00:00Z",
    expected: point("2026-03-08T17:00:00Z"),
    rationale: "Noon CST plus a calendar day is noon CDT: 23 elapsed hours.",
    preserve: true,
  },
  {
    id: "date-spring-hours",
    family: "dates",
    text: "in 24 hours",
    reference: "2026-03-07T18:00:00Z",
    expected: point("2026-03-08T18:00:00Z"),
    rationale: "24 elapsed hours from March 7 at 18:00 UTC is March 8 at 18:00 UTC.",
    preserve: true,
  },
  {
    id: "math-days-first",
    family: "arithmetic",
    text: "jan 30 2026 plus 2 days plus 1 month",
    expected: point("2026-03-01T06:00:00Z"),
    rationale: "January 30 plus two days is February 1; one month later is March 1, midnight CST.",
    preserve: true,
  },
  {
    id: "math-month-first",
    family: "arithmetic",
    text: "jan 30 2026 plus 1 month plus 2 days",
    expected: point("2026-03-02T06:00:00Z"),
    rationale: "January 30 clamps to February 28; two days later is March 2, midnight CST.",
    preserve: true,
  },
  {
    id: "math-step-clamp",
    family: "arithmetic",
    text: "jan 31 2026 plus 1 month plus 1 month",
    expected: point("2026-03-28T05:00:00Z"),
    rationale: "January 31 clamps to February 28, then advances to March 28, midnight CDT.",
    preserve: true,
  },
  {
    id: "math-fraction-week",
    family: "arithmetic",
    text: "one and a half weeks ago",
    expected: point("2026-09-02T04:00:00Z"),
    rationale:
      "10.5 days before September 12 at 16:00 UTC is September 2 at 04:00 UTC; no DST transition intervenes.",
    preserve: true,
  },
  {
    id: "math-fraction-day",
    family: "arithmetic",
    text: "0.01 days",
    expected: point("2026-09-12T16:14:24Z"),
    rationale: "0.01 times 86,400 seconds is 864 seconds.",
    preserve: true,
  },
  {
    id: "sentence-reminder",
    family: "sentences",
    text: "Remind me to call Sam tomorrow at noon",
    expected: point("2026-09-13T17:00:00Z"),
    rationale: "The reminder's time is tomorrow at noon; calling Sam is event text.",
  },
  {
    id: "sentence-meeting",
    family: "sentences",
    text: "The meeting is on September 18, 2026 at 2 pm.",
    expected: point("2026-09-18T19:00:00Z"),
    rationale: "September 18 at 14:00 CDT is 19:00 UTC.",
  },
  {
    id: "sentence-question",
    family: "sentences",
    text: "Can we talk tomorrow at noon?",
    expected: point("2026-09-13T17:00:00Z"),
    rationale: "A question about availability still names tomorrow at noon.",
  },
  {
    id: "sentence-correction",
    family: "sentences",
    text: "Meet Friday at noon, actually Saturday at noon instead",
    expected: point("2026-09-12T17:00:00Z"),
    rationale:
      "The correction supersedes Friday; today's noon is still in the future at the reference time.",
  },
  {
    id: "schedule-weekly",
    family: "schedules",
    text: "every Monday from 8 pm to 10 pm",
    expected: {
      kind: "resolved",
      recurring: true,
      occurrences: [
        { start: "2026-09-15T01:00:00Z", end: "2026-09-15T03:00:00Z" },
        { start: "2026-09-22T01:00:00Z", end: "2026-09-22T03:00:00Z" },
        { start: "2026-09-29T01:00:00Z", end: "2026-09-29T03:00:00Z" },
      ],
    },
    rationale:
      "Next Mondays are September 14, 21 and 28; 20:00–22:00 CDT crosses into the following UTC date.",
  },
  {
    id: "schedule-multiple",
    family: "schedules",
    text: "Sat Sun 1pm-8pm Mon 10pm-12am",
    expected: {
      kind: "resolved",
      recurring: false,
      occurrences: [
        { start: "2026-09-12T18:00:00Z", end: "2026-09-13T01:00:00Z" },
        { start: "2026-09-13T18:00:00Z", end: "2026-09-14T01:00:00Z" },
        { start: "2026-09-15T03:00:00Z", end: "2026-09-15T05:00:00Z" },
      ],
    },
    rationale:
      "Each upcoming named day has its own interval; Monday's interval ends at Tuesday midnight.",
  },
  {
    id: "schedule-duration",
    family: "schedules",
    text: "set OOO for 3 days from today",
    expected: interval("2026-09-12T05:00:00Z", "2026-09-15T05:00:00Z"),
    rationale:
      "A three-day all-day absence starts today and ends at exclusive midnight three days later.",
  },
  {
    id: "schedule-range",
    family: "schedules",
    text: "September 14, 2026 from 9 am to 11 am",
    expected: interval("2026-09-14T14:00:00Z", "2026-09-14T16:00:00Z"),
    rationale: "September 14 09:00–11:00 CDT converts to 14:00–16:00 UTC.",
  },
  {
    id: "schedule-overnight",
    family: "schedules",
    text: "Friday 10pm-12am",
    expected: interval("2026-09-19T03:00:00Z", "2026-09-19T05:00:00Z"),
    rationale: "Next Friday at 22:00 CDT ends at Saturday midnight CDT.",
  },
  {
    id: "negative-counts",
    family: "recovery",
    text: "I have 3 cats and 2 dogs",
    expected: { kind: "no-expression" },
    rationale: "Counts of animals contain no calendar or scheduling expression.",
  },
  {
    id: "negative-name",
    family: "recovery",
    text: "May sent the third edition",
    expected: { kind: "no-expression" },
    rationale: "May is a person's name here; third describes an edition.",
  },
  {
    id: "negative-cancelled",
    family: "recovery",
    text: "Do not schedule anything tomorrow",
    expected: { kind: "no-expression" },
    rationale:
      "For scheduling intent, a prohibition must not become an event. A mention-only extractor has a different contract.",
  },
  {
    id: "invalid-date",
    family: "recovery",
    text: "feb 30 2026",
    expected: { kind: "invalid" },
    rationale: "February has only 28 days in 2026.",
  },
  {
    id: "ambiguous-clock",
    family: "recovery",
    text: "nov 1 2026 at 1:30 am",
    expected: { kind: "ambiguous" },
    rationale:
      "Chicago repeats 01:30 at both -05:00 and -06:00. This corpus requires clarification, not a default offset.",
  },
  {
    id: "ambiguous-numeric",
    family: "recovery",
    text: "03/04/2027",
    expected: { kind: "ambiguous" },
    rationale:
      "No date-order preference was supplied. March 4 and April 3 are both valid; this corpus requires clarification.",
  },
];
