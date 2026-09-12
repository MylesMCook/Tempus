# Phoenix rebuild

## Objective

Rebuild TempusTotal around explicit timezone/reference inputs, sequential calendar arithmetic, a truthful live trace, and matching browser/API results. Current contract and evidence: [Phoenix](docs/phoenix.md).

## Status

- [x] Preserve clean baseline `bf92c81` and define v2 semantics; evaluate RedwoodSDK/language alternatives. Retain one TypeScript engine in React and Cloudflare.
- [x] Replace heuristic parser/evaluator with typed grammar, Temporal arithmetic, exact fractions, bounded validation, and execution trace.
- [x] Rebuild calculator, display preferences, examples, and API replay; migrate stored preferences without the retired arithmetic switch.
- [x] 183 tests, source/type/build checks, frozen install, three-host-timezone suite, and browser replay at desktop/tablet/mobile. Fixed observed mobile overflow and grouping issues.
- [x] Update API migration documentation, privacy copy, and Writer/Laws of UX critique. Historical v1 audits marked superseded.
- [ ] Land on main, push, deploy through authorized Wrangler OAuth fallback, and verify the public client/API.

## Operational boundary

No database, host service, DNS, or credential changes. Existing GitHub Cloudflare deployment token is invalid; automated deployment remains a separate credential handoff. CI validation and manual deployment are reported separately.

Rollback: revert the Phoenix implementation commit, install the resulting lockfile, rebuild, and deploy through the same path. Existing timezone/date-format storage remains compatible with v1.

Next action: mainline closeout and live verification. Do not mark the deployment complete before checking the actual public calculator and API.
