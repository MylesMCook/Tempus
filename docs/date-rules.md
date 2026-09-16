# Date rules

Try a phrase in the [calculator](https://tempus.funnydomainname.com/). **Show calculation steps** shows the starting date and each change.

## Starting date

The selected timezone controls the calculation and display. The browser starts with your timezone; the API defaults to UTC. For scheduling phrases, select the timezone in the setting rather than writing it inside the phrase. Inline timezone names and abbreviations receive recovery guidance; they are not silently applied or ignored.

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

The strict calculator rejects repeated or nonexistent local times during clock changes. The interpreter can offer explicit choices; it does not silently pick one.

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

The browser recognizes short event phrases such as `Call Sam tomorrow at noon`. It keeps the event text and asks about ambiguous dates. It does not create reminders. This is limited English recognition, not extraction from arbitrary prose; see the [schedule contract](schedule-contract.md) for supported labels, corrections and recurrence.

The strict calculator and API must understand the whole date phrase. They use a fixed English grammar. Surrounding prose, vague amounts such as “a few,” ambiguous numeric dates, and date ranges are unsupported by the API.

Invalid dates, unsupported words, and incomplete phrases return an error instead of a partial answer. Supported years are 0001–9999, with up to 200 characters and 20 changes per phrase.

For previous behavior and test cases, see the [compatibility notes](archive/parser-compatibility.md) and [engine design](archive/phoenix.md).

## Calculator questions

Supported question forms include `What is …?`, `What date is …?`, `What time is …?`, `What date will it be …?`, `Calculate …`, and `What time was it … ago?`. Use either “date” or “time” in the latter forms.

Everything after the prefix must match the calculator grammar. Contradictory tense, conditions and inline timezone instructions are rejected. For other phrasing, use an explicit starting date and ordered changes.
