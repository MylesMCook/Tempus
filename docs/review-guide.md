# Feedback

[Open the calculator](https://tempus.funnydomainname.com/) and try one phrase you would actually use.

1. Enter the phrase and check the date.
2. Open **Show calculation steps**. Can you tell why it returned that date?
3. [Open an issue](https://github.com/MylesMCook/Tempus/issues/new/choose) if something is wrong or confusing. Say what you expected and what happened.

You do not need to review the whole app or suggest a fix.

## Checking a wrong date

Choose **Developer tools → Copy calculation details**. This captures the exact starting time and timezone, so someone else can repeat the calculation. Remove anything private before posting.

For a code or API review, use reference `2026-01-26T19:30:00.000Z` and timezone `America/Chicago`:

| Phrase                     | Expected UTC instant       |
| -------------------------- | -------------------------- |
| `3 weeks ago`              | `2026-01-05T19:30:00.000Z` |
| `tomorrow`                 | `2026-01-27T06:00:00.000Z` |
| `jan 31 2026 plus 1 month` | `2026-02-28T06:00:00.000Z` |

**Check API result** should return the same instant as the calculator. That action sends the phrase to the server.

More cases are in the [oracle fixtures](../src/shared/date-engine/oracle-fixtures.ts) and [compatibility tests](../src/shared/compatibility.test.ts). Use [SECURITY.md](../SECURITY.md) for private vulnerability reports.
