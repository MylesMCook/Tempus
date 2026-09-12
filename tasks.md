# Phoenix rebuild

## Objective

Rebuild TempusTotal around explicit timezone/reference inputs, sequential calendar arithmetic, a truthful live trace, and matching browser/API results. Current contract and evidence: [Phoenix](docs/phoenix.md).

## Status

- [x] Preserve clean baseline `bf92c81` and define v2 semantics; evaluate RedwoodSDK/language alternatives. Retain one TypeScript engine in React and Cloudflare.
- [x] Replace heuristic parser/evaluator with typed grammar, Temporal arithmetic, exact fractions, bounded validation, and execution trace.
- [x] Rebuild calculator, display preferences, examples, and API replay; migrate stored preferences without the retired arithmetic switch.
- [x] 183 tests, source/type/build checks, frozen install, three-host-timezone suite, and browser replay at desktop/tablet/mobile. Fixed observed mobile overflow and grouping issues.
- [x] Update API migration documentation, privacy copy, and Writer/Laws of UX critique. Historical v1 audits marked superseded.
- [x] Landed `e1eb6ce` on main and pushed. Wrangler OAuth deployment succeeded; public calculator, trace, API parity, HTTP errors/no-store, asset, and privacy navigation verified.

## Operational boundary

No database, host service, DNS, or credential changes. Existing GitHub Cloudflare deployment token is invalid; automated deployment remains a separate credential handoff. CI validation and manual deployment are reported separately.

Rollback: revert the Phoenix implementation commit, install the resulting lockfile, rebuild, and deploy through the same path. Existing timezone/date-format storage remains compatible with v1.

Release: `868ac2ab-b176-4063-8fee-0e602449436f`; client `index-DBLeC7iA.js`. GitHub run `34673173157` passed check/test/build and failed deployment; manual deployment succeeded independently. See the release evidence in `docs/phoenix.md`.

Current state: Phoenix rebuild complete and live. Remaining operational follow-up: replace the GitHub deployment token through the required credential handoff. No further app changes are pending.

## Compatibility follow-up — live

- [x] Live “3 weeks ago” returns August 21 from September 11 in Chicago, with a 21-day subtraction and matching API replay. User-reported failure not yet reproduced; requested observed error/date.
- [x] Compare pre-audit and pre-Phoenix implementations; research Chrono and GNU date's documented language and edge cases.
- [x] Measured 47 phrases across original, audited v1, and initial Phoenix; added 58 independent compatibility oracles. Restored useful grammar and labelled calendar approximations. See `docs/parser-compatibility.md`.
- [x] 255 tests, source/type/build checks, three-host-timezone suite, browser/API match, visible approximations, error recovery, and diagnostic copy feedback. Narrow-screen DOM measured no horizontal overflow.
- [x] Pushed `ad5355e`; deployed version `60fd1a59-ae81-4628-96a9-7e2f1080ea48`, client `index-8bf3uT5u.js`. Public browser and fixed-reference API checks passed for ago, mixed fractions, aliases, exact half years, labelled month approximations, and trailing-text rejection.
- [x] GitHub run `34674040184` passed check/test/build; its deploy failed. The manual release succeeded independently.
- Remaining uncertainty: the original “3 weeks ago” failure has not been reproduced. The diagnostic copy action now captures the exact inputs and error/result for follow-up.
