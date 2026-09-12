# Product pass — LIVE; GitHub deployment token pending

## Objective and boundaries

- [x] Clean `main` checkout at start. Rollback boundary: the product-pass commit; use a revert through the normal deployment workflow.
- [x] Preflight: React/Vite and local Cloudflare Worker; no database, auth, remote bindings, analytics, or environment files. App requests only same-origin GET `/api/parse`. Preferences use localStorage.
- Safe mutation mode: disposable browser sessions, synthetic expressions, explicit clipboard writes, loopback app at `http://127.0.0.1:5173`. The product pass used no personal data or external mutations. The subsequent explicit git-it-out request authorizes mainline landing and the configured deployment.
- Surface: `/` phrase → result → copy, examples, settings and recovery; supporting API playground; `/privacy` navigation.
- Non-goals: parser grammar changes, timezone-aware calendar arithmetic, integrations, release, privacy-policy rewrite.

## Evidence-linked thesis

High confidence: a date calculator for someone who needs a concrete date from a phrase, with a secondary developer API. Evidence: README, `src/shared/date-parser.test.ts`, input/examples/copy in `date-picker.tsx`, GET-only Worker.
Alternative: primarily a developer sandbox, supported by the old hero and prominent playground. Calculator-first entry better fits the functioning phrase/copy workflow; disclosed API tooling preserves developer use.
Display timezone does not affect calendar arithmetic: the parser accepts no timezone option. Browser and server calendar results can differ. The UI now explains this boundary.
Visual direction: compact utility, readable date first, machine formats subordinate. Existing Tailwind/Radix components retained; no new dependencies.
Revisited after replay: all 27 advertised examples produce results; settings, API and copy remain reachable. Findings supported this thesis; no speculative features added. API default preserve-day behavior and parser grammar remain unchanged.

## Workflow ledger

| Journey                      | Baseline evidence                                                                                                                   | Change and same-journey replay                                                                                                                                                                                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phrase → date → copy         | Browser: tomorrow displayed September 12, 2026 among three equal outputs; input had no visible label                                | Label, primary date, initial guidance, disclosed ISO/timestamp. Fresh session: tomorrow → Saturday, September 12, 2026; Date copied. ISO and timestamp copy also report successful writes.                                                                              |
| Examples and invalid input   | Browser: gibberish → parse error; long vertical examples                                                                            | Wrapped examples and categories; selected examples focus the input. All 27 examples return results; gibberish still gives recovery guidance and valid input recovers.                                                                                                   |
| Format/timezone and recovery | Browser: invalid custom format silently displayed ISO; timezone control showed Browser defaultUS Central                            | Explicit invalid-format message and disabled date copy; reset restores normal date. Tokyo plus yyyy-MM-dd HH:mm persisted across reload and displayed tomorrow as 2026-09-12 14:00 for the same browser instant. Unique timezone entries.                               |
| API request and recovery     | Browser: separate expression; old HTTP 200 remained beside changed settings. Source: formatting ignored timezone and errors escaped | Shared expression; old response labelled after edits; Enter runs request. now at 22:24Z displayed 07:24 next day in Tokyo. Gibberish → HTTP 400; offline → error; online retry → HTTP 200. Invalid format → 400 regression test. Time-sensitive responses use no-store. |

## Verification

- [x] Baseline: 36 tests; source check passed without warnings/lint/type errors. Desktop/mobile baseline screenshots: `/tmp/tempus-before-desktop.png`, `/tmp/tempus-before-mobile.png`.
- [x] Local browser: 1440×900, 1024×768, 390×844; no page overflow. Result, examples, settings, API disclosure and response inspected.
- [x] Keyboard: tab selection/focus, Enter submits API form, Escape closes settings and restores trigger focus, response JSON keyboard-scrollable. Named settings dialog.
- [x] Fresh browser: empty input, disabled Clear, initial guidance; tomorrow → result → successful copy feedback. No browser exceptions; only Vite/React development messages.
- [x] Accessibility: settled calculator, API and settings states have zero automated violations. Initial toast contrast report was measured during fade-in; settled audit passes. Manual review confirmed closed Radix aria-controls points to the dialog mounted on open; foreground/background and focus styles inspected. No screen-reader device test.
- [x] Privacy link and Back to Home navigation.
- [x] Final screenshots: `/tmp/tempus-after-desktop.png`, `/tmp/tempus-after-tablet.png`, `/tmp/tempus-after-mobile.png`; format error: `/tmp/tempus-format-error.png`.
- [x] `vp check`, `vp test` (40 passed), `tsc -b`, `vp build`, `git diff --check`.

## Operational notes and remaining uncertainty

- Cloudflare inspector initially attempted all-interface binding. Automatic review rejected it; config now disables inspector and binds app to loopback. Safe local server subsequently started.
- Existing runtime warning: installed workerd supports 2026-03-17 while config requests 2026-03-29; local fallback used. No dependency or runtime upgrades performed. Exact production compatibility remains unverified; CI check, tests and build passed on Linux during closeout.
- Browser clipboard-read permission was denied. Copy promises completed successfully and corresponding toasts appeared; clipboard readback not verified.
- Relative calendar semantics and production timezone differences are unchanged and now explained. Parser-wide edge cases and policy prose remain outside this bounded pass.
- Task-local pnpm store is ignored, not deleted. No lockfile changes. Local dev server remains available for review.
- Closeout: user authorized mainline landing and the normal GitHub Actions deployment. Main requires linear history and conversation resolution, with no required PR or review gate. Deployment status is authoritative in the repository’s Deploy Cloudflare Worker workflow; live verification is reported in the closeout handoff.

## Closeout result

- Product commit `3618415` landed on `main` and was pushed.
- [Deployment run 34654551112](https://github.com/MylesMCook/TempusTotal/actions/runs/34654551112) passed check, all 40 tests, and build. GitHub deployment failed before upload: invalid Cloudflare token (10000/9109).
- User subsequently authorized token repair and completion. Existing local Wrangler OAuth login was valid; no OAuth credentials were copied into GitHub.
- Documented manual fallback deployed the verified build successfully. Cloudflare version: `2ba1d02e-a3e8-4f8e-86ab-1d74a2f9d7eb`.
- Production verification: new asset `index-wYGksTIy.js`; browser calculator tomorrow → September 12, 2026; `/privacy` renders; live playground returns HTTP 200; Tokyo formatting verified; invalid format returns HTTP 400; API responses use no-store.
- Token summary prepared in Cloudflare: `TempusTotal GitHub Actions deploy`, Workers Scripts:Edit restricted to the existing account. Not created yet; browser credential policy requires user handoff at the final step.
- Next action: finish token creation, install it as repository `CLOUDFLARE_API_TOKEN` without displaying its value, then run and verify the GitHub deployment workflow. Production is live; automatic deployment is still blocked by the old invalid secret.
- Documentation-only closeout commits skip CI while the invalid secret remains. No app or workflow changes are included in those commits.

## Writer and Laws of UX follow-up

- [x] Reviewed copy against browser behavior, source, and Cloudflare logging documentation.
- [x] Selected Mental Model, Cognitive Load, and Law of Proximity; bounded fixes cover privacy claims, API consequences, duplicate examples, settings guidance, and error recovery.
- [x] Critique validator, `vp check`, 40 tests, `tsc -b`, production build, and diff check passed.
- [x] Browser: invalid phrase → example recovery; tomorrow result; settings guidance and Escape; API Enter → HTTP 200/400; privacy and return navigation. Desktop privacy and 390×844 mobile privacy/settings visually inspected; expanded API has no horizontal page overflow.
- [x] Landed `90ba06b` on main; deployed with Wrangler OAuth. Version `c3526ca2-368d-42a7-a4f1-26f75685946d`, client asset `index-DA5_1BFx.js`.
- [x] Live browser verified updated calculator text, tomorrow result, simplified API form, HTTP 200, and revised privacy page.
- [x] GitHub run `34668553448` passed check/test/build; deployment step failed. Manual deployment succeeded independently.
- Automatic GitHub deployment remains blocked by its invalid token. No credential changes in this pass.

## Live calculation explanation

- [x] Extend parser debug output with actual operation snapshots and settings support; use the same result for the calculator and explanation.
- [x] Add an accessible “See how it works” disclosure that updates with input and settings, including empty and invalid states.
- [x] Trace correctness and local browser replay passed: keyboard disclosure, live edits, sorted operations, month setting changes, timezone display, invalid input/format recovery, and Clear. Desktop and 390×844 mobile inspected; expanded trace has no page overflow.
- [x] `vp check`, 112 tests, `tsc -b`, production build, and diff check passed. Arithmetic suite also passed under UTC, America/New_York, and Asia/Tokyo.
- [x] Landed `30f4dd9`; Wrangler OAuth deployment succeeded. Version `b8416345-67d7-4991-b2fc-1589b67defc8`; client `index-zTWUnGxm.js`.

## Parser correctness and system audit

- [x] Reproduced 21 failures in the initial 25-case audit; fixed month-end/leap-year rollover, weekday selection, explicit relative anchors, incomplete phrase acceptance, overflow, and debug settings/order.
- [x] Added exact expectations for all 27 advertised examples, multi-timezone/DST coverage, storage corruption/write-failure handling, and Worker request-contract tests. See `docs/parser-system-audit.md` for defined semantics and remaining boundaries.
- [x] Live browser verified trace disclosure, reordered operations, January 31 → February 28 correction, API UTC result, and overflow → HTTP 400. No captured browser errors.
- [x] GitHub run `34669453354` passed check/test/build; deployment still fails with the existing invalid credential. Manual release verified independently.
- Rollback: revert `30f4dd9`, rebuild and redeploy; no data migration or host-service changes. Remaining semantic boundaries are recorded in `docs/parser-system-audit.md`.
