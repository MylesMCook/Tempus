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

Current state: Phoenix rebuild complete and live. Remaining operational follow-up: replace the GitHub deployment token through the required credential handoff. Parser rebuild is complete; current UI work is tracked below.

## Compatibility follow-up — live

- [x] Live “3 weeks ago” returns August 21 from September 11 in Chicago, with a 21-day subtraction and matching API replay. User-reported failure not yet reproduced; requested observed error/date.
- [x] Compare pre-audit and pre-Phoenix implementations; research Chrono and GNU date's documented language and edge cases.
- [x] Measured 47 phrases across original, audited v1, and initial Phoenix; added 58 independent compatibility oracles. Restored useful grammar and labelled calendar approximations. See `docs/parser-compatibility.md`.
- [x] 255 tests, source/type/build checks, three-host-timezone suite, browser/API match, visible approximations, error recovery, and diagnostic copy feedback. Narrow-screen DOM measured no horizontal overflow.
- [x] Pushed `ad5355e`; deployed version `60fd1a59-ae81-4628-96a9-7e2f1080ea48`, client `index-8bf3uT5u.js`. Public browser and fixed-reference API checks passed for ago, mixed fractions, aliases, exact half years, labelled month approximations, and trailing-text rejection.
- [x] GitHub run `34674040184` passed check/test/build; its deploy failed. The manual release succeeded independently.
- Remaining uncertainty: the original “3 weeks ago” failure has not been reproduced. The diagnostic copy action now captures the exact inputs and error/result for follow-up.

## ADHD-oriented calculator — live

- [x] Put the phrase and result first; offer three quick examples and disclose optional controls.
- [x] Make copy completion visible; preserve live trace, warnings, errors, settings, and API replay.
- [x] Verify desktop/mobile and keyboard paths, parser regression suite, types, and production build.
- [x] Pushed `844f00d` to main; OAuth deployment `5176f388-7812-4330-8562-5ddc9d67dee9` is live with client `index-DqeNL3PR.js`. Public copy feedback, approximation trace, and API parity verified.

Decision: apply the I Have ADHD plugin's low-distraction and visible-state guidance without storing phrases or changing calculation semantics.

Verification: 255 tests; source/type/build checks; desktop, 390px and 320px browser paths, keyboard copy/example navigation, format/timezone/phrase recovery, approximation trace, and matching API replay. Details: [UX review](docs/phoenix-ux-review.md#adhd-oriented-follow-up--september-12-2026).

GitHub run `34699827081` passed check/test/build and failed deployment. Manual deployment succeeded independently. Worktree closeout is documentation-only; the existing automated-deployment credential handoff remains open. Rollback: revert `844f00d`, rebuild, and deploy through the same path.

## Secondary controls — live

- [x] Replace five competing cards with controls grouped by task: examples at input, settings and explanation at result, developer tools below.
- [x] Verified 390px/320px containment, keyboard disclosures, example-to-result focus, copy feedback, settings, error diagnostics, live approximation trace, API parity, 255 tests, checks, types, and build.
- [x] Pushed `1fea2d2`; deployed `3948799c-afe0-49b9-970c-2ec8997fe2ad` with client `index-CytiqxH9.js`. Public grouped controls, trace, copy feedback, and HTTP 200 API parity verified.

Secondary-controls rollback: revert `1fea2d2`, rebuild, and deploy through the existing OAuth path. No parser, preference-storage, dependency, or hosting configuration changes.

GitHub run `34700146532` passed check/test/build and failed automated deployment. The verified manual release succeeded independently.

## Open-source and security readiness — release verified

- [x] Codex Security standard source scan at `81dce96`: 97 files reviewed, no confirmed source-backed vulnerabilities. History secret/metadata scans found no detections. See [security review](docs/security-review.md) for scope and limits.
- [x] Patched dependencies; final audit reports zero advisories. Vite+ 0.3.1 resolves the intermittent type-checker failure found during clean-install verification.
- [x] Prepared MIT license, third-party attribution, contributor/security docs, critique issue forms, review guide, and credential-free CI with opt-in deployment.
- [x] Fresh `ebef472` checkout passed frozen install, checks, 260 tests, and build. Tests also passed under UTC, America/New_York, and Asia/Tokyo during hardening. Main checkout checks, tests, build, and deploy dry run passed before release.
- [x] Deployed `e385941f-1556-4e6e-81a3-3048c91ac257`; client `index-BAk8XBE-.js`. Read back Cloudflare's 120/minute per-IP limiter, 100 ms CPU budget, query redaction, preview URLs disabled, and unchanged production domain mapping.
- [x] Both custom domain and workers.dev: home/privacy/API 200, unknown API route 404, unsupported method 405, and preflight 200; security headers and no-store API responses verified. Fixed-reference API returned February 28 from January 31 plus one month. Live browser copy, API parity, error recovery, and approximation trace passed.
- [x] Release commits pushed to main; GitHub CI run `34702196985` passed on `832c39a`. Automated deployment was intentionally skipped and stays disabled until its credential handoff is complete and deployment is explicitly enabled.
- [ ] Cloudflare zone-wide TLS/WAF and account access-policy review: existing OAuth lacks read permissions; dashboard is signed out. HTTPS redirect and valid certificate are observed, but these do not prove zone configuration.
- [ ] Confirm MIT/publication and enable private vulnerability reporting when publishing. Repository remains private.

Evidence: `/Users/mylescook/Documents/Codex/2026-09-12-tempustotal-open-source/`. Formal scan ID `d759b8fa-a7c2-46aa-9d43-3616a58d3e67`. The scan predates hardening; focused regression/runtime checks cover this release separately. Query redaction does not erase old logs. Rate limits are approximate per edge location, not a global spending cap.

Rollback: previous live version `3948799c-afe0-49b9-970c-2ec8997fe2ad`. Revert the hardening/toolchain commits together, restore that lockfile, rebuild, deploy, and verify both production addresses. No stateful data migration or shared host changes occurred.

## Developer copy and formatting — live

- [x] Replace API prose wall with a clear empty state, decoded request fields, structured reference, and concise comparison status. Preserve explicit request action and privacy disclosure.
- [x] Writer pass complete. Verified 390px/320px/1280px containment, keyboard disclosures, empty state, decoded fields, URL/response copy feedback, stale status, HTTP 400 and successful recovery. No browser console errors; 260 tests, checks, types and build pass.
- [x] Pushed `220051f`; GitHub CI `34702768861` passed. Deployed `adf61c72-542b-4578-bb90-c297fdb2ab91`, client `index-D8Lsn2vx.js`. Both production hosts serve the current client/security headers; live 390px layout, empty state, request details, copy feedback and API parity verified.

Scope: presentation and feedback only; parser and Cloudflare protections stay unchanged.

Copy/formatting rollback: revert `220051f`, rebuild and deploy through the documented path. Existing Cloudflare account-review and automated-deployment credential handoffs remain unchanged.
