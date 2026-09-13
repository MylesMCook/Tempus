# Security review — September 12, 2026

This is a dated review record, not a security certification.

## Evidence

- Codex Security completed a standard source scan of `81dce963f255bb1fe04cd8209b753e38518f8c7b`. Independent architecture, HTTP, baseline, and UI-support reviews covered 97 source and support files. No source-backed vulnerabilities were confirmed. Scan ID: `d759b8fa-a7c2-46aa-9d43-3616a58d3e67`.
- Gitleaks 8.30.1 reported no secrets in reachable Git history before this release. Historical metadata checks found no matching local home-directory paths or private network addresses in 411 unique blobs. Pattern scans cannot establish that every historical value is safe to publish.
- Targeted dependency updates removed all advisories reported by `pnpm audit` at review time. The audit covers the installed dependency graph, including development tools. Advisory databases change over time.
- Fresh-checkout verification exposed intermittent false module-resolution errors in Vite+ 0.1.24 (oxlint-tsgolint 0.23.0), matching [upstream issue 987](https://github.com/oxc-project/tsgolint/issues/987). The release uses Vite+ 0.3.1 with its newer type checker; the earlier version is not the release toolchain.
- The hardened build passes 260 tests, source/type checks, and production build. The new tests exercise limiter success, denial, failure, URL limits, and preflight without sending abusive traffic to the public service. Browser calculation, copy feedback, and HTTP 200 API parity work under the production content policy.

The formal scan predates the hardening patch. Its result does not certify the patch, dependencies, live Cloudflare settings, account credentials, or third-party infrastructure. The patch receives focused diff, type, regression, and runtime checks separately.

## Release protections

- Exact API route and method handling; validated, bounded query values; 4,096-character URL ceiling; no database, authenticated resource, or server-side outbound request.
- A Cloudflare rate-limit binding allows approximately 120 requests per 60 seconds per client IP at each edge location. A 100 ms per-invocation CPU budget bounds compute. Neither is a global request or spending cap.
- API responses are uncached and carry browser security headers. Static responses use a same-origin content policy, no embedding, no referrer, restricted browser permissions, and host-only HSTS. Inline styles remain allowed for existing UI components.
- Worker observability remains enabled with query-string redaction. Version preview URLs are disabled. The custom domain and production workers.dev endpoint use the same Worker protections.
- CI uses pinned action commits, read-only repository permissions, frozen installation, checks, tests, build/type validation, and dependency auditing. Deployment requires an explicit repository opt-in and `main`; pull requests do not receive deployment credentials.

## Live verification

Release commit `ebef472` deployed as Worker version `e385941f-1556-4e6e-81a3-3048c91ac257`, with client `index-BAk8XBE-.js`. A fresh checkout passed frozen installation, checks, all 260 tests, and build. The account API read back the rate limiter, CPU budget, query redaction, and disabled preview URLs. Both production hostnames returned the expected page/API/status responses and security headers. The live browser verified calculation, copy feedback, matching API replay, error recovery, and approximation trace. Limiter denial and failure were tested locally with mocks, not by exhausting production allowances.

## Operational boundaries

The account API confirmed the production custom domain and Worker mapping. HTTPS redirects work. The current Wrangler session cannot read the zone's TLS settings or managed WAF rules, and the dashboard is signed out. Zone configuration and account security policies therefore remain unverified. Do not infer account-wide MFA status from the account's MFA-enforcement setting.

The GitHub deployment token needs replacement through the credential handoff. A manual OAuth deployment does not establish that automated deployment works. Keep deployment opt-in disabled until a successful authorized CI deployment is observed.

The public stateless API intentionally has no authentication. Shared networks share its IP allowance; distributed requests can exceed a single location's limit. Query redaction does not erase old logs or govern other hosting records. The client bundle still exceeds Vite's 500 kB warning threshold; unused legacy UI components also produce peer-dependency warnings on a fresh resolution. These are follow-up maintenance issues, not confirmed source vulnerabilities.

## Publication checklist

- Confirm the proposed MIT license and permission to publish the repository and its history.
- Enable and verify GitHub private vulnerability reporting when the repository becomes public.
- Keep credentials out of source; `.env*` and `.dev.vars*` are ignored. Local agent settings have been removed from tracking.
- Record clean-install, CI, deployment, and live-response evidence in `tasks.md` before release closeout.
- Complete the Cloudflare zone/account review with an authorized signed-in session; retain the remaining uncertainty until that review is done.

## Current local API review — September 13, 2026

The formal scan above does **not** cover the current scheduling parser, calendar SDK or full working-tree diff. Its zero-confirmed-findings result must not be carried forward as a current release verdict. A complete current security review remains open.

This follow-up inspected `worker/index.ts`, `src/shared/parse-api.ts`, `src/shared/format-date.ts` and the API replay UI. The Worker and Wrangler file have no working-tree changes. The shared API change replaces host-based formatting with pinned timezone formatting; it retains the strict input schema and length limits. Formatting errors return a controlled 400 response. Source inspection confirms explicit user-triggered same-origin replay, request timeout, no-store fetches and stale-response labeling. This is not a fresh production or account-settings check.

The Worker retains its public stateless contract: GET/OPTIONS only, URL size limit, allowed/duplicate parameter checks, approximate edge rate limiting that fails closed when unavailable, uncached JSON and response security headers. Wildcard CORS remains intentional for this unauthenticated calculation API. No new request-boundary defect was identified in this limited source review. No public traffic, load test, calendar write or cloud mutation was performed.

Current API, timezone integration and compatibility regressions were run locally; their result is recorded in the release-verification log. They support regression behavior, not a full security finding search. Dependency advisories, the rest of the changed parser/export code, deployment credentials, zone TLS/WAF and account policy remain separate release checks.

## Dependency advisory refresh — September 13, 2026

`pnpm audit --json` with pnpm 10.33.0 exits 0 with no reported advisories and zero vulnerabilities at every severity. Separate `--prod` and `--dev` queries also exit 0 with no advisories. The initial report's dependency-category counters were not treated as proof of development coverage; the separate queries establish their respective requested scopes. These are advisory-database matches at query time, not a source audit or a guarantee that dependencies contain no vulnerabilities.

Raw full/production/development reports, command results and lockfile/report hashes are retained in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-dependency-audit/`. No dependencies were updated. This refresh replaces the old advisory snapshot for the current lockfile only; parser/export source review and operational security checks remain open.

## Current diff scan — September 13, 2026

Codex Security scan `60fbecb4-09a0-4f24-be6c-7b420894a2ea` completed with **partial coverage and no reportable findings**. It reviewed 107 of 108 prepared inventory items against `d91a7ca0e67f7f2cf5661e9674901201e8039610`. The generated timezone payload was sampled; exhaustive decoding and independent provenance verification remain deferred. This is a static source review, not a production-readiness verdict.

The frozen working-tree digest was `codex-security-snapshot/v1:sha256:97808865a5eee91f9765938fde4e10a1587bd106790b4fd1f4494933059bfeef`. Subsequent documentation edits are outside that snapshot. Canonical findings, coverage, manifest and report remain in the local Codex Security workbench.

The review covered parser and clarification state, calendar serialization and recurrence bounds, SDK boundaries, browser downloads, API exposure and operator-run diagnostic tools. It established no reportable security candidate. A suspected stale timezone selection was ruled out: timezone changes and preference resets explicitly clear choices before updating settings. No application execution, exploit reproduction, public traffic, cloud mutation or calendar write occurred during this scan.

Evidence limits remain: matching archive-listed installed files does not prove the complete runtime dependency closure; hashing a selected oracle file does not authenticate its IANA origin. Generated diagnostic results were not independently rerun in this review. Live Cloudflare settings, actual calendar imports, physical devices and independent evaluation remain separate open release gates.

## Post-scan implementation follow-up

A limited local source review covers the later civil-date cache, negative/uncertain reminder guards and Edit schedule button. It found no new security-boundary issue in this scope. It is not a new formal scan and does not amend sealed scan `60fbecb4…`.

A byte comparison of archives `0341e306…` and `3ec6621c…` identifies only three changed package files: `dist/date-engine/zoned-date.js`, its declaration, and `dist/interpret-date.js`. No package files were added or removed; manifests, exports, dependencies, calendar serializer and timezone payload bytes match. The complete path/hash record is `previous-archive-diff.json` beside the modifiers archive in the SDK verification scratch directory.

The cache is private to each internal ZonedDate instance and holds an immutable Temporal civil value. Public calculation results are snapshots; no shared input-result cache or new public export was introduced. The reminder guards run after the existing 200-character input boundary and prevent an event result; they introduce no I/O or executable interpretation. Strict HTTP API input still routes to calculateDate rather than the scheduling interpreter. The Edit schedule control only focuses the existing input and moves its caret; it neither changes the phrase nor initiates download or calendar writes.

Evidence considered includes the 712 source tests, bounded modifier audit, scoped browser recovery and current installed-archive checks. These are supporting regression evidence, not proof that all vulnerabilities are absent. New diagnostic tooling, independent provenance, live hosting settings and operational behavior remain outside this follow-up. No public probes, exploit reproduction, cloud changes or calendar writes occurred.

## Date-list follow-up review

A limited local review covers the new list resolver, interpreter integration, selection history, SDK argument snapshots, calendar serializer and current-interpretation download wiring. It identified misleading collection export copy (all entries were called ranges), which was corrected. No additional security-boundary issue was identified in this scope. This is not a new formal scan and does not amend the sealed scan result.

The list grammar requires every clause to match before resolution. Invalid/duplicate entries do not return an exportable partial collection. Numeric, time-scope and clock answers must match offered IDs inside the original input/timezone/reference context. Replacing a date or time answer clears dependent choices. Accumulation, interpreter replay and SDK validation share the 64-prior-answer bound; a packed probe accepts 64, rejects 65 and confirms stale answers do not alter the requested instant. Prior browser checks exercise edit/restart invalidation.

Serialization keeps date-only entries as DATE values, optional interval ends, text escaping, UTF-8 line folding and UUID/title validation. The download closure belongs to the current render, and its parent key includes input, reference, timezone and interpretation. Parsing/file preparation contain no new network or calendar side effects. Strict HTTP API v2 still routes to calculateDate, not the list interpreter.

Comparing archives `953106eb…` and `52d5c981…` shows eight changed files (including declarations/README), the two new list module files and no removals. The package manifest and declared dependencies are unchanged. Exact reviewed source hashes, archive differences and boundary/UI probes are retained in `/Users/mylescook/Documents/Codex/2026-09-13-tempus-list-review/`. This does not independently authenticate dependencies/timezone provenance, review all new diagnostic tooling, validate calendar-client imports or establish live hosting security.

## September 13: focused export-boundary follow-up

The [current local export-boundary review](../comparison/evidence/export-boundary-review/README.md) found no confirmed stale-file bypass in its limited source scope. Three built-app desktop runs verify cancellation, late-response handling, title/input changes, failure recovery and termination; separate readers validate nine files. The calendar guide now distinguishes ordinary resolved SDK values from host authorization and current-input state.

This follow-up is not a completed formal security scan or whole-diff review. It does not refresh the deployed/Cloudflare evidence above, establish third-party host authorization, or close broader post-scan coverage, dependency/provenance, physical-device or calendar-import gaps.

[Local privacy boundary review](../comparison/evidence/privacy-boundary/README.md) checks in-memory input, preferences-only storage and explicit API replay, and adds clipboard/calendar-file disclosure. The scoped browser checks pass; this is not a fresh full security scan, Cloudflare-state audit or physical-device test.
