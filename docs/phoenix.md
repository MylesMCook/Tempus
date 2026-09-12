# Phoenix: calculation contract and rebuild

## Intent and boundary

Rebuild the date-calculation product around predictable outcomes. A person enters a phrase, chooses the timezone, gets a date, and can inspect or replay the exact calculation. The API is a second client of the same engine. This follows the user's explicit rebuild request and the verified discrepancies in the prior audit. Confidence: high. The alternative, a general-purpose language interpreter, would require guessing unsupported prose; this remains a finite, documented date grammar.

Clean baseline: `bf92c81` on main, 112 tests passed. Git history preserves the rollback. Runtime remains React/Vite + one stateless Cloudflare Worker, localStorage preferences, no database or accounts. Verification uses synthetic phrases and task-local browser state; local requests stay on loopback. Existing authorization covers landing and deployment through the working Wrangler OAuth fallback. No host service, network, account, or unrelated dependency upgrades.

## New contract

1. One pure engine takes expression, timezone, and an explicit reference instant. No system timezone or localStorage inside the engine.
2. Calendar anchors resolve in the selected timezone. Date-only and weekday anchors start at midnight. Offset-only phrases start at the reference instant.
3. Operations apply in phrase order. Month/year changes clamp against each step's current date. Remove the preserve-day switch and reject its retired API parameter explicitly.
4. Whole days/weeks are calendar arithmetic. Their fractional remainder is an exact elapsed duration (half a day is 12 hours). Hours/minutes/seconds are elapsed durations. No silent rounding; resolution is one millisecond.
5. The compatibility follow-up restores month/year fractions. Whole year fractions become calendar months; remaining fractions follow the old day approximation, with a visible result warning and trace details. See `parser-compatibility.md`.
6. Invalid dates, unknown text, ambiguous numeric dates, incomplete phrases, out-of-range values, and skipped/repeated local clock times are errors. No guessed partial result. ISO dates and named-month dates are supported; an explicit `at` time can be supplied.
7. A typed parsed expression feeds one evaluator. Each executed step produces its own trace. UI/API results and trace use the same evaluator and captured reference.
8. The API returns engine version, reference instant, timezone, and the trace. Passing the same inputs reproduces the same output. This is an intentional version-2 semantic change under the rebuild request.

## Product direction

Keep the existing framework, styling, and small utility identity. Put timezone beside the phrase because it changes its meaning. Show one result, with calculation steps and machine formats available underneath. Replace the settings maze with a display-only format control. Keep the API as a disclosed replay tool; the phrase and reference stay shared. Examples teach supported forms, and errors point to the failing phrase span. No new authentication, analytics, integrations, or visual-only redesign.

## Workflow ledger

| Journey                     | Baseline                                          | Required result                                             | Implementation                           |
| --------------------------- | ------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------- |
| Named date + month, Chicago | UI Feb 28; API formatted Feb 27                   | Same Feb 28 and instant when inputs match                   | Zoned engine + captured reference replay |
| Jan 30 + 2 days + 1 month   | Months run first → Mar 2                          | Written order → Mar 1                                       | Sequential typed operations              |
| 0.01 day                    | Rounded to zero hours                             | Exactly 14 minutes 24 seconds                               | Rational duration conversion             |
| 1.5 months                  | Approximation using average month                 | Preserve compatibility with a visible approximation warning | Explicit calendar fraction conversion    |
| Debug/replay                | Separate debug path and dense implementation text | Same result, per-step evidence, compact readable trace      | Evaluator-owned trace                    |
| Invalid/ambiguous input     | Finite grammar but heuristic anchor selection     | Precise error, no partial answer, recovery                  | Full-consumption parser and spans        |
| Timezone/DST                | Host timezone decides arithmetic                  | Selected zone decides; invalid local time is explicit       | Temporal zoned/calendar operations       |
| Preferences/reload          | Hidden arithmetic switch and display timezone     | Safe migration to timezone + formatting only                | Validated stored preferences             |

## Verification plan

Independent fixed-reference oracle cases for all displayed examples, ordering, fractional precision, leap days/month ends, DST gaps/folds, zone differences, syntax failures, and API parity. Run the same cases with different host TZ values. Replay browser journeys at 1440×900, 1024×768, and 390×844, including fresh entry, keyboard, errors, copy, reference refresh, API stale/success/error states, and settings persistence. Build and verify the actual deployed client and Worker before closeout.

## Language/framework decision

Evaluated RedwoodSDK using its current overview, React Server Components, and hosting documentation on 2026-09-12. No rwsdk version is installed. RedwoodSDK adds SSR/RSC/server-function capabilities on Cloudflare; this product has no server-owned data and must evaluate locally on every edit. Retain TypeScript so exactly one engine runs in both environments, plus the existing React/Vite/Worker shell. A Rust/WASM engine would add a build and serialization boundary; Python would need a server or separate browser engine. Neither improves this bounded product enough to justify the added runtime.

Use pinned `@js-temporal/polyfill` 0.5.1 for zoned calendar arithmetic and explicit ambiguous-time rejection. Existing date-fns-tz remains presentation-only. Verified the installed API with a DST-day addition and rejected both the New York gap and repeated hour. Sources: https://docs.rwsdk.com/core/react-server-components, https://docs.rwsdk.com/core/hosting, https://tc39.es/proposal-temporal/docs/zoneddatetime.html.

## Verification and remaining limits

- 183 tests pass. Independent expected dates cover every displayed example, month-end/order changes, exact fractions, calendar/elapsed DST differences, invalid syntax/time/range, and API parity. The 181-test arithmetic/API/storage suite also passed under UTC, America/New_York, and Asia/Tokyo; the two subsequent additions cover preference migration only.
- `vp check`, `tsc -b`, production build, frozen-lockfile install, and diff check pass. The only added runtime dependency is pinned Temporal polyfill plus jsbi; incidental package-manager transitive changes were reverted.
- Browser: 1440×900, 1024×768, 390×844. Verified fresh entry; month/order/fraction cases; live trace; clock refresh; API exact match and stale response; HTTP 400; offline failure and successful retry; Tokyo/custom-format persistence; format/zone recovery; examples and focus; keyboard disclosure and arrow-key category switching; privacy and return navigation.
- Mobile replay revealed response-panel page overflow. Explicit bounded grid columns fixed it; recheck measured 375px document width in a 390px viewport. Format label/select now remain grouped on wrapping.
- Copy completed and displayed “Date copied”. Clipboard readback and physical screen-reader testing were not performed. No captured browser error/warning logs in the settled recovery run. This is focused interaction/accessibility verification, not a full WCAG certification.
- [Writer and Laws of UX review](phoenix-ux-review.md) passed its critique validator. Historical v1 audits are marked superseded.
- Bundle tradeoff: Temporal adds standards-based timezone arithmetic; the current client is about 522 kB minified / 160 kB gzip and triggers Vite's 500 kB chunk advisory. It loads once; calculations remain local. No broad dependency or framework migration was made to silence that advisory.
- Local workerd falls back to compatibility date 2026-03-17 from configured 2026-03-29. Actual production behavior must be verified after deployment.
- Finite English grammar and intentional v2 semantics remain product boundaries. Named timezones depend on each runtime's timezone database; future legislative changes can require runtime updates. This is not a claim to interpret arbitrary prose.

## Release evidence

Completion state: COMPLETE for the Phoenix rebuild and manual live release; automatic GitHub deployment remains blocked by the existing credential issue.

- Implementation `e1eb6ce` landed on main and was pushed. No release branch or PR remains open for this work.
- Wrangler deployed version `868ac2ab-b176-4063-8fee-0e602449436f`, client `index-DBLeC7iA.js`. Worker startup reported 6 ms. Public hostname: https://tempus-total.funnydomainname.com/.
- Live browser: January 30 + 2 days + 1 month → March 1 with both intermediate dates; January 31 + 1 month → February 28; now in Tokyo → API exact match; fractional years → useful error. Privacy/return path renders. Expanded live API at a 390px viewport measured 375px document width. Temporary browser viewport/network overrides were cleared.
- Direct live HTTP: Chicago month-end → `2026-02-28T06:00:00.000Z`; UTC 0.01 day → `2026-01-26T00:14:24.000Z`; New York DST gap and fractional years → HTTP 400. All checked API responses identify engine v2 and use no-store. Public HTML references the deployed client asset.
- [GitHub run 34673173157](https://github.com/MylesMCook/TempusTotal/actions/runs/34673173157) passed install/check/test/build; deployment failed at the existing credential boundary. Manual deployment and public verification succeeded separately.
- Revert `e1eb6ce`, reinstall the resulting lockfile, rebuild, and redeploy to restore the prior engine. No stateful service/data migration occurred.
