# Two-column calculator layout

Objective: implement the approved desktop input/result layout, stacked on mobile, preserving calculator behavior.

- Approved: larger input, compact examples in the empty result pane, result and steps on the right, settings below input, collapsed developer details.
- Scope: home page, DatePicker layout, home navigation/footer alignment. No parser, API, dependency or data changes.
- Implemented and verified: two-column layout at desktop widths; input/result/settings stack below 1024px; smaller examples, larger input, quieter developer disclosure. Existing callbacks and parser/API behavior preserved.
- Passed: changed-file format/lint/types; `pnpm build`; `pnpm test --run --maxWorkers=2` (71 files, 1200 passed, 1 expected failure); `git diff --check`.
- Browser checks passed: `verify-layout.mjs` at 320/390/768/1054/1280px (dates, intervals, recurrence, clarification focus, errors, no overflow); existing calculator (6 runs), reminder download and context-reset journeys (320/1280px each).
- Evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-layout-final-20261015-1254/report.json` and adjacent screenshots; sibling `tempus-calculator-20261015-1253`, `tempus-reminder-20261015-1254`, `tempus-context-20261015-1254` directories.
- Initial check limitations (resolved below): 311 formatting failures and missing Next.js types from a stray untracked `next-env.d.ts`. Initial concurrent tests timed out; the first isolated/two-worker reruns passed.
- Complete locally; no commit, push or publication. No physical-device, screen-reader or calendar-client import checks.

## Check cleanup and calculation transparency review

- Requested: fix all formatting/Next.js type failures, then obtain Cici's read-only review of calculation transparency.
- Root cause confirmed: Git `core.autocrlf=true` writes CRLF while repository blobs and formatter use LF. Added repository-local `.gitattributes` and ran the existing formatter; immutable evidence remains excluded by existing configuration.
- Removed stray untracked `next-env.d.ts` after preserving it at `C:/Users/myles.cook/AppData/Local/Temp/tempus-next-env-before-20261015.d.ts`. No Next.js dependency or callers exist in this app.
- Default test parallelism reproduced a 5-second comparison-test timeout and 10-second Worker-import hook timeout. Capped Vitest at two workers, matching the prior complete passing run, without changing assertions or timeouts; documented in AGENTS.md.
- With two workers, report generation and a Git/temp-file integration test still exceeded the default five seconds. Those two tests now use explicit 30-second integration budgets, matching the existing comparison test. No assertion or unit-test timeout changed.
- Complete: formatting/Next.js cleanup and Cici review. Recommendations and unapproved acceptance proposals are linked below.

## Approved dependency remediation

- Full formatting/lint/types, 1200 tests (plus one expected failure), and production build passed. `pnpm validate` then failed its dependency audit: 11 high and 2 critical advisories, including unpatched `braces@3.0.3` through Tailwind 3.
- User approved dependency remediation and Tailwind 4/build-plugin migration, preserving the UI. No deployment authorization.
- Implemented: Tailwind/PostCSS 4.3.3, tailwind-merge 3.7.0, existing JS theme retained, old shadows/outlines/cursor/palette preserved. Scoped patch overrides remove the remaining advisories without upgrading the Cloudflare toolchain. Generated `.playwright-cli` artifacts stay local and are excluded from source checks.
- Verified: `pnpm validate` passes end to end (317 formatted files, lint/types, 71 test files with 1200 passed and one existing expected failure, production build, audit). `pnpm audit --audit-level=low` reports no known vulnerabilities; `pnpm why braces` returns no dependency chain. No assertions removed; two integration tests have explicit 30-second budgets.
- Browser evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-tailwind4-layout-20261015` (five widths, five states, screenshots); sibling `tempus-tailwind4-calculator-20261015` (six clipboard/API runs). Developer/privacy pages at 390px have no horizontal overflow. Chrome only; physical devices/assistive technology remain untested.
- Verified built-app calendar export/context recovery on port 5175 at 320/1280px using `verify-context-reset.mjs`, including invalid-timezone recovery and reference refresh. Evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-tailwind4-built-context-20261015/report.json`. Offline frozen-lockfile validation also passed.
- Complete locally; no commit, push or deployment. Cici's transparency proposals await a separate implementation decision. Build emits existing large-chunk warnings; no bundle optimization is in scope. Tailwind 4 requires modern browsers: [official upgrade guide](https://tailwindcss.com/docs/upgrade-guide).
- Cici's read-only trace review is complete: [recommendations and proposed scenarios](docs/calculation-transparency-review.md). No transparency UI edits approved or implemented.

## October 28 audit remediation

- New advisories failed `pnpm validate` at audit: 7 high (undici via miniflare, zod, vite-plus bundled launch-editor) plus moderates. User approved full upgrades.
- Implemented: undici override 7.30.1, fast-uri override 3.1.9, vite-plus/vite-plus-core 1.4.0 (Vitest 5), zod ^4.6.7. Zod 4 dropped `invalid_type_error`; the retired `preserveDayOfMonth` message now uses `error`. A new test failed on the generic zod 4 message before the fix and passes after. Other `/api/parse` validation `details` wording follows zod 4.
- Audit exception: GHSA-mrhx-c7xc-m3w5 ignored in `pnpm-workspace.yaml`. Only rwsdk's pinned puppeteer smoke-test and vibe-rules helpers still carry zod 3; Tempus does not run them and they do not validate request input. Remove when rwsdk moves to zod 4.
- Superseded: user asked for no exceptions. The exception is removed; overrides `puppeteer-core@25.4.0: 25.16.0` (its chromium-bidi uses zod 4) and `vibe-rules>zod: 4.6.7` (uses only basic schema calls) leave one zod (4.6.7). Both packages load and the vibe-rules CLI runs. `pnpm audit --audit-level=low` reports no known vulnerabilities.
- Verified: `pnpm install --frozen-lockfile`, then `pnpm validate` passes (323 formatted files, lint/types, 72 test files with 1237 passed and one existing expected failure, build, audit 0 unignored). `wrangler deploy --dry-run` succeeds. No browser journeys run; no commit, push or deployment.

## Approved calculation transparency implementation

- User approved all Cici recommendations, preserving exact calculation values and rerunning checks.
- Scope: shared CalculationTrace, its existing tests, a browser journey and documentation. Point/interval/recurrence callers reuse the same component; no engine or API changes.
- Implemented: visible pinned local reference; one Read as line; previous-result explanation; approximation callouts; exact signed elapsed time only at offset changes. UTC inputs, original endpoint strings, detail notes and closed-by-default disclosures preserved.
- Red/green evidence: 10 trace tests failed on missing behavior before the component edit; all 17 pass afterward, including DST 23/24/25-hour cases, subtraction, subsecond precision, clamping and approximation.
- Verified: `pnpm validate` passes (71 files, 1209 tests passed and one existing expected failure; build; audit with no known vulnerabilities). `git diff --check` passes and no engine/API source changed. Initial build was blocked by the prior preview holding `dist/client`; stopping that preview allowed full validation to pass unchanged.
- Browser evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-transparency-dev-20261015-r2` (18 point cases plus range traces, keyboard disclosure, exact endpoints); `tempus-transparency-calculator-20261015` (six clipboard/API runs). January's month chain correctly reports 671 elapsed hours for the second step because it crosses March's offset change.
- Verified built assets on port 5175: `verify-transparency.mjs` passed 18 point cases plus range/recurring-date trace checks at 320/1280px. Evidence and screenshots: `C:/Users/myles.cook/AppData/Local/Temp/tempus-transparency-built-20261015`. Exact engine endpoints, original notes, reference, signed/subsecond elapsed text, keyboard disclosure and no horizontal overflow checked.
- Complete locally; no commit, push or publication. Chrome only; Firefox/Safari, physical devices and assistive technology remain untested.

## Date ladder and historical debug refinement

- User rejected the first transparency pass, then approved the readable ladder direction, requested shadcn refinement and pointed to the old debug option as the preferred detailed UX.
- Inspected January commit `39c7202` and its DebugPanel components. Restored the grouped summary/input/base/operations/final structure with actual current engine fields. The date ladder and Debug calculation are independently accessible and initially closed.
- Uses official-registry shadcn Card/Badge/Alert source with existing dependencies and semantic theme tokens. Root TypeScript path mapping now lets the shadcn CLI discover the real component directory. No project dependency additions or engine/API changes.
- Exact local/UTC values, offsets, epoch milliseconds, reference, warnings, original details and unchanged raw calculation JSON are available in Debug. Unsupported old token categories, parser timings and browser-derived date facts were not recreated.
- Cici reviewed the design, historical-debug plan and final source. Its timeline alignment, JSON region naming and excess-landmark findings were fixed. A real long-number fixture failed the mobile overflow assertion before the wrapping repair and passed afterward.
- Verified: `pnpm validate` passes after the final accessibility/wrapping edits (321 formatted files, lint/types, 71 test files, 1214 passed and one existing expected failure, production build, audit with no known vulnerabilities). `git diff --check` passes; no engine/API source changed.
- Browser evidence: 22 point cases at 320/1280px plus range/recurrence debug callers pass on the dev server and built preview; every structured snapshot and the complete JSON match the SDK calculation. Final built evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-shadcn-debug-built-20261015-final` (report and walkthrough/debug screenshots). Six clipboard/API runs pass: `tempus-shadcn-debug-calculator-20261015-r2`.
- Design/review details: [calculation transparency review](docs/calculation-transparency-review.md). No commit, push or deployment requested. Chrome only; physical devices and assistive technology remain untested.

## Historical debug parity review

- User requested a direct Cici comparison and fixes. Cici compared four actual January debug sources with the current implementation; [review and decisions](docs/calculation-transparency-review.md).
- Added the useful missing result/total-duration summary, per-step elapsed durations, pinned weekday/timezone context, highlighted debug warnings/adjustments, zero-step explanation and exact whitespace-preserving engine input. Kept full endpoints and the unchanged engine JSON.
- User approved Copy debug JSON scenarios. Implemented exact-payload copying, polite success/error status, manual-copy recovery and feedback tied to the current serialized calculation. No browser/device metadata enters the report.
- Narrow evidence: 28 component tests pass. The browser journey failed before copy/status existed, then 22 cases at 320/1280px passed, including injected clipboard denial, real successful write/readback, exact write-argument equality, new-calculation feedback reset, signed/subsecond durations and existing range/recurrence checks. Evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-debug-parity-dev-20261015-r3`.
- Verified: `pnpm validate` passes (321 formatted files, lint/types, 71 test files, 1220 passed and one existing expected failure, production build, zero audit vulnerabilities). `git diff --check` passes. No engine/API or dependency changes.
- Built preview verification passes 22 point cases at 320/1280px, plus independent range/recurrence panels. New copy actions were exercised for point, both interval endpoints and recurrence; readback matches each panel's JSON. Final report/screenshots: `C:/Users/myles.cook/AppData/Local/Temp/tempus-debug-parity-built-20261015-final`.
- Complete locally; no commit, push or publication. Chrome only; other browsers and assistive technology remain untested.

## Reference/selection explanation correction

- User reported “friday next week” had the wrong starting date and explicitly requested nesting Debug within calculation steps.
- Reproduced: engine reference October 15 → selected Friday October 23, with zero arithmetic steps. The UI incorrectly labeled the already-selected anchor Starting date. The result itself was correct.
- Implemented reference-first explanation, the engine's recorded date-selection rule, a distinct Date selected checkpoint and existing arithmetic adjustments/notes. Zero arithmetic no longer implies that selecting a relative date required no calculation. Debug contents and copy behavior are preserved, now nested under steps.
- Red test demonstrated the missing reference/selection distinction; dev browser journey passes 26 cases at 320/1280px, including “friday next week,” “next friday,” hidden nested Debug, exact JSON and copy recovery. Evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-selection-dev-20261015`.
- Superseded by the readable selection follow-up below. No engine/API/dependency changes; no publication requested.

### Readable selection follow-up

- User found “Select the date / Use today … Start at midnight” confusing. Cici recommended one date checkpoint, with technical selection rules retained in Debug.
- Implemented: removed the instruction block; kept reference time; date-only clocks follow caller precision/all-day metadata across point, range and occurrence views. Explicit midnight and now keep clocks. Exact engine/debug values unchanged.
- Verified: 33 component tests; pnpm validate passed all formatting/lint/types, 71 test files (1225 passing tests plus one existing expected failure), production build and audit (zero vulnerabilities). Dev and built-preview browser runs each passed 32 cases at 320/1280px, including exact debug JSON and real clipboard recovery. Evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-readable-built-20261015` and `tempus-readable-validate-final-20261015.txt`. Review evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-cici-readable.txt`.

### Taste, usability, then microinteraction polish

- User explicitly requested Claude apply Laws of Taste and Laws of UX first, then microinteractions as the final 3 percent. Scope: calculation walkthrough presentation; exact engine/debug values, copy behavior and native disclosures preserved.
- Claude supplied a source-informed proposal, without browser access: `C:/Users/myles.cook/AppData/Local/Temp/tempus-taste-ux-response.txt`. Thesis: one quiet date column, result emphasized, reference separated as context.
- Static pass: neutral timeline, smaller intermediate dates, stronger final result, grouped reference context, operation notes nearer resulting dates, readable supporting text grouped with Debug. Cognitive Load and Law of Proximity are the two UX lenses. No new controls or dependencies.
- Static component tests (33), browser cases (32) and desktop/mobile screenshot review passed before motion. Added 160ms native-open reveal, 150ms chevrons, immediate close, reduced-motion support. Final source review found no layout blockers; tightened native open timing and released settled transforms. Full validation passed (71 files,1225+1 expected,build,audit0) before the final CSS tightening. Final CSS check/types/build passed, and dev plus built-preview runs each passed 34 browser cases (320/1280px, normal/reduced motion, repeated Enter/Space, immediate open/close, nested reopen, settled transforms and exact JSON/copy). Evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-taste-motion-built-20261015`, `tempus-taste-validate-final-20261015.txt`, `tempus-taste-final-check-build-20261015.txt`. Engine/API unchanged. No publish; Chrome only.

### Screenshot-driven grouping refinement

- User approved Cici's screenshot criticisms: tighten operation/notes grouping, quiet reference context, attach date-only note to result, simplify repeated labels/arrows. Preserve exact calculations and nested rich Debug.
- Implemented a quiet wrapping Reference time line with full year/local abbreviation/timezone, chip-aligned notes, consistent note spacing, no redundant down arrows or first-date label, and result-adjacent date-only/zero-arithmetic notes. Dropped the redundant Debug pointer sentence. Existing motion preserved.
- Cici plan review: `C:/Users/myles.cook/AppData/Local/Temp/tempus-tighten-plan.txt`. Debug component source is identical to pre-pass; engine/API diff empty. Verified: component tests35; pnpm validate passes71files,1227 tests plus1existing expected failure, build and audit0. Dev and built-preview transparency runs each pass34 cases; calculator runner passes6. Cici inspected actual320/1280 screenshots and found all four criticisms resolved, no blockers. Built evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-tighten-built-20261015`; validation log `tempus-tighten-validate-20261015.txt`; final visual review `tempus-tighten-final-visual-review.txt`. No publication; Chrome only.

### Clarification, debug, calendar and developer-panel review

- User requested Cici review/fix all four marked panels. Confirmed intended phrase was now plus; approved confirmation before calculating, retained input/context invalidation and ordinary titles. Then explicitly required simple-code and no automatic correction engine.
- Added one validated `no plus` confirmation branch in the shared interpreter using the existing context-bound choice mechanism. No fuzzy matching, dependency or new state; strict calculator/API unchanged. Relevant tests first failed on the wrong event-title question, then passed. Accepted behavior documented in `docs/date-rules.md`.
- Cici reviewed actual four-panel captures: `C:/Users/myles.cook/AppData/Local/Temp/tempus-panels-cici-plan.txt`. Applied ruled Debug rows preserving every field and exact JSON, unboxed endpoint comparisons, date-first calendar export and grouped title/download, local-vs-server developer columns with action-adjacent privacy. Existing API/download handlers retained. Did not recapture reference at confirmation or add a second wrong-title choice as Cici suggested; those conflict with approved behavior.
- Browser checks cover typo confirmation/reset, unchanged exact debug/local copy payloads, no API requests on open/copy, real API match, mocked rate limit, offline/retry, stale responses and downloaded point/range/recurrence files. Verified by the final validation and browser evidence below. One test waited for title preparation too early; corrected the runner to wait after the edit without changing app behavior.

- Final Cici review (`C:/Users/myles.cook/AppData/Local/Temp/tempus-panels-cici-final.txt`) judged the four-panel implementation ready. Its context-key concern is covered by raw-input/reference/timezone/wrong-choice tests. Added a non-resolved fallback to avoid any future repeat prompt; clarified request privacy wording; changed local-value wrapping so offsets stay whole. Added rendered offset-line assertions and keyboard horizontal scrolling of the labelled raw JSON region. Full validate passes72files/1236tests+1expected,build,audit0; focused74 tests pass. Dev and built panel journeys pass320/1280 including actual point/range/recurrence files, exact copies and API failures/recovery. Calculator6 passes. Strict HTTP API still rejects unconfirmed typo400. Final production transparency run passes34 cases, including offset wrapping and keyboard JSON scrolling. The first parallel run timed out on initial load; a separate unchanged run passed. Evidence: `C:/Users/myles.cook/AppData/Local/Temp/tempus-panels-built-20261015` and `tempus-panels-validate-final-20261015.txt`.

### Production closeout

- User explicitly approved commit, push and production deployment. All final local validation and browser evidence above applies to this release; both Cloudflare dry runs pass. Production delivery uses the existing main-branch workflow, with exact version IDs retained in its run log. Previous production versions are recorded in docs/release-checklist.md for rollback.

## Diagnostic triage (2026-10-28)

- User approved the scenarios in [date rules](docs/date-rules.md#title-followed-by-for): titled “for N from now” asks one time or span; titled “for <date>” reaches the date question; untitled durations unchanged. `validation: "preview-only"` kept as a documented legacy label.
- Implemented in `src/shared/interpret-date.ts` title proposal only. No grammar, API or dependency changes. “Call Sam for <date>” (recipient path) still asks for a duration; left open.
- Red/green: two new `event-title.test.ts` cases failed without the change (single title choice; duration question), then all 33 passed.
- Verified: `pnpm validate` format/lint/types pass, 72 test files (1239 passed, 1 existing expected failure), build passes. Its audit step fails on new undici advisories via `@cloudflare/vite-plugin>miniflare` (7 high); no dependency changed here. Built preview (5175, Chrome, desktop only): timer shows both choices and “once” gives one time; “Book it for 9/10/2026 at noon.” reaches the September/October choice.
- No commit, push or deployment requested.

## Developers page alignment

- User said the Developers page felt disconnected and approved the in-app mockup. Scope: `src/routes/developers-page.tsx` and nav/footer width in `src/document.tsx`. Copy, `/api/parse` contract and keyboard-scrollable code regions unchanged.
- Implemented: Home-scale header, three clickable integration cards, package/API sections as Home-style cards with code beside text at desktop, nav/footer full width everywhere except Privacy (kept narrow).
- Verified: `pnpm check` passes; Developers unit assertions 6/6; Chrome dev-server check at 320/390/1280 for `/`, `/developers`, `/privacy` has no horizontal overflow, Tab reaches the code region with a visible ring, card links reach their sections.
- Not verified: `verify-worker-preparation.mjs` stopped in its offline calendar step on the dev server, before its Developers part. Its 320px "code sample must overflow" assertion also fails against the original page (the sample wraps), so it was already stale. No built-preview run. No commit.
