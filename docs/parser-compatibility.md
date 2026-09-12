# Parser compatibility research and regression audit

## Finding

The exact report, `3 weeks ago`, succeeds in all three checked implementations and in the current public browser/API. At a reference of September 11, 2026 23:38 in Chicago, it returned August 21 at the same clock time. The user's original failure remains unreproduced; no claim is made that widening the grammar fixes that unknown cause. **Copy calculation details** now captures inputs, format, reference, and result/error for a reproducible report.

The rebuild did drop useful language. It also exposed old false successes: the original parser returned the current instant for `3weeks ago`, moved forward for `3 weeks earlier`, and ignored the whole-number part in mixed fractions. Returning a date was not sufficient evidence of correct interpretation.

## Research and decisions

- [Chrono's README](https://github.com/wanasit/chrono) documents casual relative phrases, weekday/date forms, explicit reference inputs, and partial-text extraction. Its [English vocabulary](https://github.com/wanasit/chrono/blob/master/src/locales/en/constants.ts) and [ago parser](https://github.com/wanasit/chrono/blob/master/src/locales/en/parsers/ENTimeUnitAgoFormatParser.ts) informed coverage of abbreviations, mixed time units, and earlier/ago wording. TempusTotal retains full-input validation instead of extracting a convenient fragment and discarding the rest.
- [GNU relative-date documentation](https://www.gnu.org/software/coreutils/manual/html_node/Relative-items-in-date-strings.html) covers cumulative offsets, signed quantities, fortnight, and calendar/DST pitfalls. These are coverage references, not a promise to reproduce GNU's month rollover behavior.
- Compared repository versions `18d1511` (original), `bf92c81` (audited v1), and `8e09c32` (initial Phoenix). A fixed clock and Chicago timezone were used for every comparison. Disposable comparison sources/results live in `~/Documents/Codex/2026-09-12-tempus-compatibility`; no historical parser dependency is shipped.
- Retained Temporal, explicit timezone/reference, full consumption, per-step clamping, written order, DST ambiguity rejection, and exact day/hour/minute/second fractions. No new dependency or framework migration.

## Restored and expanded language

Numeric/word quantities; hundred/thousand/million scales; hyphenated numbers; mixed fractions including Unicode halves/quarters; compact and abbreviated units; compound durations with or without “and”; earlier/later; arithmetic after ago; weekday abbreviations and “this”; Sept./day-first/on/the/of date forms; noon/midnight and clock times without “at”; day before yesterday/day after tomorrow; fortnight and quarter units. The examples now include the reported phrase and restored fractional calendar forms.

Fractions of a year first become whole calendar months. A remaining year fraction uses 365.25 days/year; a month fraction uses 30.436875 days/month, rounded to the nearest calendar day, matching the old approximation policy. The visible result, execution trace, and API `warnings` identify each approximation. Half a year is exactly six months and needs no warning. Tiny calendar fractions that round to zero still produce a warning. Fractional days and smaller units remain exact to milliseconds.

Vague quantities (“few”, “several”), ranges (“last 3 weeks”), arbitrary surrounding prose, and ambiguous slash dates remain errors. “This Friday” means upcoming including today; “Friday this week” is the current Monday-start calendar week. This is an explicit product choice because casual conventions differ.

## Measured comparison

Reference: `2026-01-26T19:30:00.000Z`, timezone `America/Chicago`. Dates below are UTC instants. The final column is an independent expected result asserted in the new compatibility tests; “Rejected” means intentionally unsupported in this pass. All matching final cases exercise both engine and API.

| Phrase                           | Original                 | Audited v1               | Initial Phoenix          | Compatibility release    |
| -------------------------------- | ------------------------ | ------------------------ | ------------------------ | ------------------------ |
| `3 weeks ago`                    | 2026-01-05T19:30:00.000Z | 2026-01-05T19:30:00.000Z | 2026-01-05T19:30:00.000Z | 2026-01-05T19:30:00.000Z |
| `three weeks ago`                | 2026-01-05T19:30:00.000Z | 2026-01-05T19:30:00.000Z | 2026-01-05T19:30:00.000Z | 2026-01-05T19:30:00.000Z |
| `3 week ago`                     | 2026-01-05T19:30:00.000Z | 2026-01-05T19:30:00.000Z | 2026-01-05T19:30:00.000Z | Rejected                 |
| `3weeks ago`                     | 2026-01-26T19:30:00.000Z | Rejected                 | 2026-01-05T19:30:00.000Z | 2026-01-05T19:30:00.000Z |
| `3 wks ago`                      | 2026-01-26T19:30:00.000Z | Rejected                 | Rejected                 | 2026-01-05T19:30:00.000Z |
| `3 weeks earlier`                | 2026-02-16T19:30:00.000Z | Rejected                 | Rejected                 | 2026-01-05T19:30:00.000Z |
| `a week ago`                     | 2026-01-26T19:30:00.000Z | Rejected                 | 2026-01-19T19:30:00.000Z | 2026-01-19T19:30:00.000Z |
| `one week ago`                   | 2026-01-19T19:30:00.000Z | 2026-01-19T19:30:00.000Z | 2026-01-19T19:30:00.000Z | 2026-01-19T19:30:00.000Z |
| `half a day ago`                 | 2026-01-26T07:30:00.000Z | 2026-01-26T07:30:00.000Z | 2026-01-26T07:30:00.000Z | Rejected                 |
| `a half day ago`                 | 2026-01-26T07:30:00.000Z | Rejected                 | Rejected                 | 2026-01-26T07:30:00.000Z |
| `a quarter of an hour ago`       | 2026-01-26T19:15:00.000Z | Rejected                 | Rejected                 | 2026-01-26T19:15:00.000Z |
| `2 days 3 hours ago`             | 2026-01-24T16:30:00.000Z | Rejected                 | Rejected                 | 2026-01-24T16:30:00.000Z |
| `2 days and 3 hours ago`         | 2026-01-24T16:30:00.000Z | 2026-01-24T16:30:00.000Z | 2026-01-24T16:30:00.000Z | 2026-01-24T16:30:00.000Z |
| `one and a half weeks ago`       | 2026-01-23T07:30:00.000Z | Rejected                 | Rejected                 | 2026-01-16T07:30:00.000Z |
| `1 1/2 weeks ago`                | 2026-01-23T07:30:00.000Z | Rejected                 | Rejected                 | 2026-01-16T07:30:00.000Z |
| `1½ weeks ago`                   | 2026-01-26T19:30:00.000Z | Rejected                 | Rejected                 | 2026-01-16T07:30:00.000Z |
| `1.5 months ago`                 | 2025-12-11T19:30:00.000Z | 2025-12-11T19:30:00.000Z | Rejected                 | 2025-12-11T19:30:00.000Z |
| `0.5 years from now`             | 2026-07-26T18:30:00.000Z | 2026-07-26T18:30:00.000Z | Rejected                 | 2026-07-26T18:30:00.000Z |
| `6.5 months from today`          | 2026-08-10T18:30:00.000Z | 2026-08-10T05:00:00.000Z | Rejected                 | 2026-08-10T05:00:00.000Z |
| `today plus 0.25 years`          | 2026-04-26T05:00:00.000Z | 2026-04-26T05:00:00.000Z | Rejected                 | 2026-04-26T05:00:00.000Z |
| `hundred days ago`               | 2025-10-18T18:30:00.000Z | 2025-10-18T18:30:00.000Z | Rejected                 | 2025-10-18T18:30:00.000Z |
| `one hundred days ago`           | 2025-10-18T18:30:00.000Z | Rejected                 | Rejected                 | 2025-10-18T18:30:00.000Z |
| `two hundred and three days ago` | 2026-01-23T19:30:00.000Z | Rejected                 | Rejected                 | 2025-07-07T18:30:00.000Z |
| `twenty-one days ago`            | 2026-01-25T19:30:00.000Z | Rejected                 | Rejected                 | 2026-01-05T19:30:00.000Z |
| `next week`                      | Rejected                 | Rejected                 | 2026-02-02T19:30:00.000Z | 2026-02-02T19:30:00.000Z |
| `last month`                     | 2026-01-26T19:30:00.000Z | Rejected                 | 2025-12-26T19:30:00.000Z | 2025-12-26T19:30:00.000Z |
| `this friday`                    | 2026-01-30T19:30:00.000Z | Rejected                 | Rejected                 | 2026-01-30T06:00:00.000Z |
| `next fri`                       | Rejected                 | Rejected                 | Rejected                 | 2026-01-30T06:00:00.000Z |
| `fri. next week`                 | Rejected                 | Rejected                 | Rejected                 | 2026-02-06T06:00:00.000Z |
| `sept 14`                        | Rejected                 | Rejected                 | Rejected                 | 2026-09-14T05:00:00.000Z |
| `Sep. 14, 2026`                  | Rejected                 | Rejected                 | Rejected                 | 2026-09-14T05:00:00.000Z |
| `14 september 2026`              | 2032-03-18T05:00:00.000Z | Rejected                 | Rejected                 | 2026-09-14T05:00:00.000Z |
| `the 14th of september`          | Rejected                 | Rejected                 | Rejected                 | 2026-09-14T05:00:00.000Z |
| `tomorrow at noon`               | 2026-01-27T06:00:00.000Z | Rejected                 | Rejected                 | 2026-01-27T18:00:00.000Z |
| `tomorrow 2pm`                   | 2026-01-27T06:00:00.000Z | Rejected                 | Rejected                 | 2026-01-27T20:00:00.000Z |
| `day after tomorrow`             | 2026-01-27T06:00:00.000Z | Rejected                 | Rejected                 | 2026-01-28T06:00:00.000Z |
| `day before yesterday`           | 2026-01-25T06:00:00.000Z | Rejected                 | Rejected                 | 2026-01-24T06:00:00.000Z |
| `a fortnight ago`                | 2026-01-26T19:30:00.000Z | Rejected                 | Rejected                 | 2026-01-12T19:30:00.000Z |
| `in 2 quarters`                  | 2026-01-26T19:30:00.000Z | Rejected                 | Rejected                 | 2026-07-26T18:30:00.000Z |
| `3 weeks ago.`                   | 2026-02-16T19:30:00.000Z | Rejected                 | Rejected                 | 2026-01-05T19:30:00.000Z |
| `3 weeks ago plus 2 days`        | 2026-01-07T19:30:00.000Z | Rejected                 | Rejected                 | 2026-01-07T19:30:00.000Z |
| `3 days before 31`               | 2026-01-23T19:30:00.000Z | Rejected                 | Rejected                 | Rejected                 |
| `today nonsense`                 | 2026-01-26T06:00:00.000Z | Rejected                 | Rejected                 | Rejected                 |
| `3 weeks ago garbage`            | 2026-01-05T19:30:00.000Z | Rejected                 | Rejected                 | Rejected                 |
| `last 3 weeks`                   | Rejected                 | Rejected                 | Rejected                 | Rejected                 |
| `in -3 weeks`                    | 2026-01-05T19:30:00.000Z | Rejected                 | Rejected                 | 2026-01-05T19:30:00.000Z |
| `2 weeks minus 3 days ago`       | 2026-01-09T19:30:00.000Z | 2026-01-15T19:30:00.000Z | 2026-01-15T19:30:00.000Z | 2026-01-15T19:30:00.000Z |

## Verification

- 255 tests pass, including 58 independent compatibility oracles exercised against both engine and API, plus invalid-input and approximation disclosure checks. The 253-test suite passed under UTC, America/New_York, and Asia/Tokyo before two additional fraction-specific assertions.
- Source/type/build checks pass; no dependencies changed. Existing Vite chunk advisory and local workerd compatibility-date fallback remain unchanged.
- Local browser: exact reported phrase, mixed fractions, abbreviations/earlier, restored calendar fractions, API match, full-input rejection, zero warnings for exact half years, diagnostic copy feedback, and error recovery verified.
- The original user failure remains unreproduced. Clipboard writes returned successful feedback; no clipboard readback or physical screen-reader test was performed.

## Release

Implementation `ad5355e` is pushed on main. Wrangler deployed version `60fd1a59-ae81-4628-96a9-7e2f1080ea48`, client `index-8bf3uT5u.js`, with a reported 5 ms Worker startup. Live browser and direct HTTP verified the reported phrase, abbreviated earlier, mixed fractions, exact half years, labelled fractional months, and rejection of unused trailing text. Checked API responses use no-store. Temporary browser emulation was cleared.

[GitHub run 34674040184](https://github.com/MylesMCook/TempusTotal/actions/runs/34674040184) passed check/test/build and failed deployment. The authenticated manual fallback deployed successfully. No credentials, host services, networking, dependencies, or server data changed. Roll back by reverting `ad5355e`, rebuilding, and deploying through the same path.
