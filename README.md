# TempusTotal

A phrase in, a date out. TempusTotal calculates dates locally in your browser and shows each step. The Cloudflare API runs the same TypeScript engine.

[Try the calculator](https://tempus-total.funnydomainname.com/) · [Review guide](docs/review-guide.md) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)

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

`GET /api/parse` accepts `expression` (required), `timezone`, `reference` (an ISO instant with offset), and `format` (a date-fns format). Omit reference to use the request time; pass it to reproduce a result. Unknown or repeated parameters return HTTP 400. Responses use `Cache-Control: no-store`. The public endpoint allows approximately 120 requests per minute per IP at each Cloudflare location. HTTP 429 asks you to retry after 60 seconds; HTTP 503 means the limiter is unavailable. URLs over 4,096 characters return HTTP 414. Browser calculations do not use this allowance.

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

Requires Node.js 22.12 or newer and pnpm 10.33.0. No Cloudflare account, token, database, or global Vite+ installation is needed for local development.

Stack: React, TypeScript, Vite+, existing Tailwind/Radix components, and a stateless Cloudflare Worker. Temporal polyfill 0.5.1 handles zoned arithmetic; date-fns-tz handles display formatting. No database or accounts. Browser preferences are validated on load; retired fields are discarded.

```bash
git clone https://github.com/MylesMCook/TempusTotal.git
cd TempusTotal
pnpm install --frozen-lockfile
pnpm dev

# Before submitting a change
pnpm check
pnpm test
pnpm build
```

- `src/shared/date-engine/grammar.ts`: full-consumption parser and typed operations.
- `src/shared/date-parser.ts`: pure evaluator and execution trace; explicit reference and timezone.
- `src/shared/parse-api.ts`: validated API adapter.
- `worker/index.ts`: HTTP boundary.
- `src/features/parser/`: calculator, trace, API replay, and preferences.
- `/privacy`: storage and request disclosure.

## Deployment

Cloudflare deployment is optional and requires your own account. CI validates pull requests without credentials; deployment is opt-in for maintainers. See the [Cloudflare deployment notes](docs/cloudflare-workers.md) for configuration, checks, and rollback.

## License

[MIT](LICENSE). Adapted UI components retain their [third-party notices](THIRD_PARTY_NOTICES.md).
