export const examples = {
  "Date Math": [
    "today plus 2 weeks",
    "today plus 2 weeks minus 3 days",
    "tomorrow minus 3 days",
    "2 weeks plus 3 days",
    "1 month minus 1 week",
    "6 months plus 2 weeks",
    "jan 31 2026 plus 1 month plus 1 month",
  ],
  Relative: ["in 3 days", "2 weeks from now", "3 months ago", "1 year from now", "3 weeks ago"],
  Simple: ["now", "today", "tomorrow", "yesterday", "next friday", "last monday"],
  Fractional: [
    "1.5 days from now",
    "2.5 weeks ago",
    "one and a half weeks ago",
    "0.5 years from now",
    "6.5 months from today",
    "today plus 0.01 days",
  ],
  Advanced: [
    "6 months before sep 14",
    "2 weeks after dec 25",
    "3 days before next friday",
    "1 month after last monday",
    "2.5 weeks before may 1",
    "friday next week",
  ],
  Schedules: [
    "tomorrow from 2pm to 4pm",
    "every Monday at noon for 5 occurrences",
    "Call Sam tomorrow at noon",
  ],
};

/** Empty-state chips, grouped. Subset of `examples`; Browse examples keeps the full catalog. */
export const featuredExampleGroups = [
  {
    label: "Date math",
    phrases: ["today plus 2 weeks minus 3 days", "jan 31 2026 plus 1 month plus 1 month"],
  },
  {
    label: "Named dates",
    phrases: ["2 weeks after dec 25", "friday next week"],
  },
  {
    label: "Schedules",
    phrases: [
      "Call Sam tomorrow at noon",
      "tomorrow from 2pm to 4pm",
      "every Monday at noon for 5 occurrences",
    ],
  },
] as const;

export const featuredExamples = featuredExampleGroups.flatMap((group) => [...group.phrases]);
