# TempusTotal

A phrase in, a date out. TempusTotal calculates dates locally in your browser and shows each step. The Cloudflare API runs the same TypeScript engine.

## Calculation rules

- The chosen IANA timezone controls calculation and display. Browser default: your timezone. API default: UTC.
- `now` and offset-only phrases start at a captured reference instant. `today`, weekdays, and named dates start at midnight. Add `at 14:30` or `at 2 pm` to set a clock time.
- Changes run in written order. `jan 30 2026 plus 2 days plus 1 month` is March 1; swapping those changes gives March 2.
- Whole months and years clamp at each step. January 31 plus one month plus one month is March 28. Fractional years first convert into whole months. Remaining fractions use the original calculator’s approximation: 30.436875 days/month or 365.25 days/year, rounded to the nearest calendar day. Approximations appear beside the result and in `warnings`; half a year is exactly six months.
- Whole days/weeks follow the calendar; their fractional remainder is elapsed time. `0.01 days` is exactly 14 minutes 24 seconds. Hours and smaller units are always elapsed durations. Resolution is one millisecond, with no rounding.
- Dates and clock times that do not exist, repeated local times during clock changes, unsupported words, and incomplete phrases return errors. The parser uses a finite English grammar, not an LLM.
- A bare weekday means its next occurrence, excluding today. `friday next week` uses a Monday-start week. Named dates without a year use the reference year. A bare day number finds its next valid occurrence, including today.
- Supported calendar years: 0001–9999. Maximum phrase length: 200 characters; maximum changes: 20.

See [Phoenix](docs/phoenix.md) for architecture decisions, audit findings, and verification.

## Supported phrasing

Examples include `3 weeks ago`, `3 wks earlier`, `2 days 3 hours ago`, `one and a half weeks ago`, `1½ weeks ago`, `two hundred and three days ago`, `Sep. 14`, `14 September 2026`, `tomorrow at noon`, and `day before yesterday`. Abbreviations include hr/min/sec/ms, wk, mo, and yr. A fortnight is 14 days; a quarter is 3 months. `this friday` includes today; `friday this week` means the Monday-start calendar week.

The parser consumes the whole phrase. Vague quantities such as “few”, arbitrary surrounding prose, ambiguous numeric dates, and date ranges remain unsupported. Use **Copy calculation details** to capture the exact phrase, timezone, reference, format, and result/error when reporting a problem. See the [compatibility audit](docs/parser-compatibility.md).

## API v2

`GET /api/parse` accepts `expression` (required), `timezone`, `reference` (an ISO instant with offset), and `format` (a date-fns format). Omit reference to use the request time; pass it to reproduce a result. Unknown or repeated parameters return HTTP 400. Responses use `Cache-Control: no-store`.

```bash
curl --get 'https://tempus-total.funnydomainname.com/api/parse' \
  --data-urlencode 'expression=jan 31 2026 plus 1 month' \
  --data-urlencode 'timezone=America/Chicago' \
  --data-urlencode 'reference=2026-01-26T19:30:00.000Z' \
  --data-urlencode 'format=yyyy-MM-dd HH:mm'
```

The result includes `engineVersion: 2`, `date: "2026-02-28T06:00:00.000Z"`, Unix `timestamp` in milliseconds, optional `formatted`, the captured `reference`, `timezone`, starting `anchor`, actual `steps`, and final `result`. Failures return HTTP 400 with an error and recovery guidance. No partial result is returned.

**Migration from v1:** remove `preserveDayOfMonth`; it now returns an explicit error. `settings` and heuristic `meta` were replaced with calculation inputs and the executed trace. Calendar arithmetic now uses the requested timezone and written order. The compatibility follow-up restores fractional month/year expressions with visible approximation warnings. This is an intentional semantic change; old clients should check `engineVersion`.

## Development

Stack: React, TypeScript, Vite+, existing Tailwind/Radix components, and a stateless Cloudflare Worker. Temporal polyfill 0.5.1 handles zoned arithmetic; date-fns-tz handles display formatting. No database or accounts. Browser preferences are validated on load; retired fields are discarded.

```bash
vp install --frozen-lockfile
vp dev
vp check
vp test
pnpm exec tsc -b
vp build
```

- `src/shared/date-engine/grammar.ts`: full-consumption parser and typed operations.
- `src/shared/date-parser.ts`: pure evaluator and execution trace; explicit reference and timezone.
- `src/shared/parse-api.ts`: validated API adapter.
- `worker/index.ts`: HTTP boundary.
- `src/features/parser/`: calculator, trace, API replay, and preferences.
- `/privacy`: storage and request disclosure.

## Deployment

The configured [GitHub Actions workflow](.github/workflows/deploy-cloudflare.yml) checks, tests, builds, and deploys to `tempus-total.funnydomainname.com`. Its Cloudflare token is currently invalid. The user-authorized recovery path uses the existing local Wrangler OAuth session after validation:

```bash
pnpm run deploy
```

See [Cloudflare deployment notes](docs/cloudflare-workers.md). No server data migration is needed. To roll back Phoenix, revert the rebuild commit, install its lockfile, rebuild, and redeploy through the same path. Browser format/timezone preferences remain compatible with v1.
