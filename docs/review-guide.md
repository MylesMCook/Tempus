# Review TempusTotal

[Try the calculator](https://tempus-total.funnydomainname.com/), or run it locally from the README. Critique is welcome, including confusing behavior and features that should be removed.

Focus on one question at a time:

1. Can a first-time user enter a phrase, understand the result, and copy it without opening help? Are settings and explanations easy to find when needed?
2. Does **See how it works** explain the actual calculation, including calendar clamping, written order, and approximation warnings?
3. Do calendar and timezone rules match the documented behavior? Which useful phrases still fail?
4. Does **Check API result** return the same instant and a useful error when it cannot? Is it clear that this action sends the phrase to a server?
5. Is the code easy to run, test, and change? Identify concrete complexity or missing regression coverage.

## Reproducible checks

Use reference `2026-01-26T19:30:00.000Z` and timezone `America/Chicago` in the API or unit tests:

| Phrase                     | Expected UTC instant       |
| -------------------------- | -------------------------- |
| `3 weeks ago`              | `2026-01-05T19:30:00.000Z` |
| `tomorrow`                 | `2026-01-27T06:00:00.000Z` |
| `jan 31 2026 plus 1 month` | `2026-02-28T06:00:00.000Z` |

Also check an invalid phrase, a fractional month with its warning, and recovery after changing a timezone or format. The [oracle fixtures](../src/shared/date-engine/oracle-fixtures.ts) and [compatibility tests](../src/shared/compatibility.test.ts) cover more calendar cases.

Report what you tried, what you expected, and what happened. Include the captured reference and timezone for date issues. Remove personal information from copied diagnostics. Report vulnerabilities privately using [SECURITY.md](../SECURITY.md).
