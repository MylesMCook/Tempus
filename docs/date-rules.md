# Date rules

Try a phrase in the [calculator](https://tempus-total.funnydomainname.com/). **Show calculation steps** shows the starting date and each change.

## Starting date

The selected timezone controls the calculation and display. The browser starts with your timezone; the API defaults to UTC.

`now` and phrases such as `in 3 weeks` start at the captured reference time. `today`, weekdays, and named dates start at midnight. Add `at 14:30` or `at 2 pm` to choose a time.

| Phrase             | Meaning                                   |
| ------------------ | ----------------------------------------- |
| `friday`           | The next Friday, excluding today          |
| `this friday`      | The next Friday, including today          |
| `friday this week` | Friday in the current Monday-start week   |
| `friday next week` | Friday in the following Monday-start week |
| `September 14`     | September 14 in the reference year        |

A bare day number finds its next valid occurrence, including today.

## Order matters

Changes run in the order you write them:

- `jan 30 2026 plus 2 days plus 1 month` gives March 1.
- `jan 30 2026 plus 1 month plus 2 days` gives March 2.

## Days, months, and clock changes

Whole days and weeks follow the local calendar. Their fractional parts use elapsed time. `0.01 days` adds exactly 14 minutes and 24 seconds. Hours and smaller units always use elapsed time, to a resolution of one millisecond without rounding.

Whole months and years use the last valid day if the original day does not exist in the destination month. This happens at every step: January 31, 2026 plus one month plus one month gives March 28.

Fractional years first become whole months: half a year is exactly six months. Remaining fractions use 30.436875 days per month or 365.25 days per year, rounded to the nearest calendar day. The app labels these approximations; the API includes them in `warnings`.

A local time that occurs twice during a clock change is rejected, as is one that does not exist.

## Supported phrases

| Type             | Examples                                                         |
| ---------------- | ---------------------------------------------------------------- |
| Relative dates   | `3 weeks ago`, `day before yesterday`, `tomorrow at noon`        |
| Combined amounts | `2 days 3 hours ago`, `one and a half weeks ago`, `1½ weeks ago` |
| Written numbers  | `two hundred and three days ago`                                 |
| Named dates      | `Sep. 14`, `14 September 2026`                                   |
| Short units      | `3 wks earlier`, `2 hr`, `30 min`                                |

Other abbreviations include sec, ms, mo, and yr. A fortnight is 14 days; a quarter is 3 months.

## Unsupported input and limits

The browser also recognizes a few short sentence forms: `Remind me to call Sam tomorrow at noon`, `Can we talk tomorrow at noon?`, and `The meeting is on September 18, 2026 at 2 pm.` It highlights the date phrase and keeps the event label. This previews a date; it does not create or deliver a reminder.

The interpreter in this checkout accepts a supported reminder action followed by a multiword name or item, then a complete supported date phrase. For example: `Remind me to call Sam Jones tomorrow at noon`. Labels may contain letters, spaces, apostrophes and hyphens. The first recognized temporal marker starts the date phrase; it cannot be swallowed into the label when parsing fails. Numeric targets and names that look like dates, such as May, remain ambiguous or unsupported. Conditions and many idioms remain unsupported. Selectable corrections, finite weekday groups and bounded recurrence are documented in the [schedule contract](schedule-contract.md). This is limited sentence recognition, not general prose extraction.

The strict calculator and API must understand the whole date phrase. They use a fixed English grammar. Surrounding prose, vague amounts such as “a few,” ambiguous numeric dates, and date ranges are unsupported by the API.

Invalid dates, unsupported words, and incomplete phrases return an error instead of a partial answer. Supported years are 0001–9999, with up to 200 characters and 20 changes per phrase.

For previous behavior and test cases, see the [compatibility notes](parser-compatibility.md) and [engine design](phoenix.md).
