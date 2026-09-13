# Tempus release work

## Objective and authority

Deliver Tempus as a natural-language-to-date system and coherent web playground, with RedwoodSDK routes. Preserve the [product matrix](docs/product-matrix.md), correctness, complete journeys, resource efficiency and independent evaluation requirements. User authorized deployment after testing. No calendar writes, SDK publication or unrelated cloud changes. Preserve unrelated Rust-spike work.

## Current result

- [x] Run one calculation, one ambiguous reminder and one finite recurring schedule in the current local app and packed SDK b1cbd22a.
- [x] Check calculation trace/copy/API parity, reminder correction, finite file outputs and edit invalidation. Six downloaded/generated files pass separate date/title/duration/expansion checks after correcting a reader assumption; the failed attempt is retained.
- [x] Consolidate the backlog into five problems and recommend a calculator-first preview with explicit limitations in the [release checklist](docs/release-checklist.md).
- [x] Preserve historical reports and matrix requirements. No implementation changes made for this assessment.

## Five priorities — paused for review

1. Coherent release candidate, accurate claims/privacy and package compatibility contract.
2. Independent complete-task and correction evaluation.
3. Calendar-client usefulness, faithful export and unresolved ongoing policies.
4. Physical-device and accessibility completion.
5. Final-candidate resource containment and device/energy evidence.

The checklist contains the exact three inputs, observed results, failures, proposed scope and blockers. Older records remain in its retained evidence section, [task history](task-history.md) and existing evidence directories. Narrow authored desktop checks do not establish overall superiority, independent usability, physical-phone behavior or actual imports.

## Active delivery

- [x] Read RedwoodSDK, Product Wrangler, Laws of UX, Writer and I Have ADHD guidance; preserve the date-system product boundary.
- [x] Inspect Cloudflare target and record rollback version d28852a9-a777-4bec-b023-3789001583f3. Source backup and before image are in ~/Documents/Codex/2026-09-13-tempus-redwood.
- [x] Finish RedwoodSDK web shell and coherent phrase → clarification → interpretation → output experience.
- [x] Replay three journeys, cold start, navigation, keyboard and responsive states against the production build. Check privacy, headers, local parsing and API boundary.
- [x] Deploy tested artifact to existing tempus-total Worker, verify the live site, and report remaining limitations.

Primary surface: / playground, /developers integration guide, /privacy and existing /api/parse. No accounts, reminder delivery, storage or parser expansion. Browser verification uses disposable local input; API replay is explicit. No remote data bindings beyond the existing API rate limiter. Three selected lenses: Mental Model, Hick's Law and Law of Proximity. Existing engine/SDK tests and previous three-journey reports are the baseline; framework migration must preserve their outcomes.

Alternative considered: an SDK-only product. The user's request for a usable deployed website supports an interactive playground plus integration guide; the SDK remains the underlying integration surface. Confidence is high because the user explicitly corrected the calendar-app direction.

## Delivered

Version `70cab9dd-44af-424b-b92a-08a5b239fda0` is live on both existing hostnames. Three production journeys and four file readbacks pass; local cross-browser and cold-start checks pass. The [release checklist](docs/release-checklist.md) records the exact scope and rollback version. Whole-repository formatting, physical devices, independent evaluation and package publication remain outside this completed web pass. No additional implementation is queued automatically.

## Complete schedule copying

- [x] Replace three-date clipboard previews with complete bounded output, retaining count/exclusion and DST policies. Text, Markdown and full JSON require no added dependency.
- [x] Share recurrence clock decisions between copy and calendar-file preparation. Reset results when input or context changes; paginate display only; expose full output if clipboard access fails.
- [x] Production build, scoped lint and 52 targeted tests pass. Chrome, Firefox and WebKit replay five-date copying in all formats, 1,000-date copying, future clock correction, shared file decisions, edit reset, open-ended labeling, clipboard denial and desktop widths 320/390/1440. Chrome uses real clipboard permission; Firefox/WebKit clipboard writes are stubbed. One browser assertion initially matched an unrelated group and was narrowed to its accessible name.
- [x] Deployed `05e260e4-5f06-4242-b4d0-d01a0c869838`; all three browser journeys pass on the live custom domain. Rollback: `70cab9dd-44af-424b-b92a-08a5b239fda0`.

Evidence: ~/Documents/Codex/2026-09-13-tempus-complete-copy. No physical-device test or actual calendar-client import is claimed. No SDK publication or Git push.

## Black-box dogfood follow-up

- [x] Run a deployed-site dogfood pass across more than 100 distinct phrases, complete output, recurrence, ambiguity, ranges, timezone/DST, copy, calendar download, API boundaries, offline behavior, navigation, 320px layout, keyboard semantics, accessibility and one desktop performance observation.
- [x] Record ten reproducible findings in the [dogfood report](docs/dogfood-2026-09-13.md): nine medium, one low, no confirmed high or critical issues. Screenshots, videos and raw browser output remain in the local review archive.
- [x] Validate a downloaded five-occurrence file with an independent iCalendar reader. This is file validation, not calendar-client import evidence.
- [ ] Triage and fix findings in a later implementation pass. Highest product priority: cross-week weekday ranges; broadest problem: narrow natural-language variants paired with unrelated recovery messages.

No product code was changed during this audit. Physical phones, real calendar clients, assistive technology and independent users remain untested. The agent-browser daemon was repaired separately by configuring its verified installed Chrome runtime.

## Format preview follow-up

- [x] Add an initially visible, collapsible output preview next to format selection. Show exact clipboard text, Markdown source or formatted JSON using a native read-only viewer; no dependency or HTML execution. Keep the full data scrollable and manually selectable.
- [x] Verified preview/copy equality, format changes, 1,000-date output, pending choices, keyboard access (WebKit uses Option-Tab), responsive widths and clipboard-denial reopening in Chrome/Firefox/WebKit locally and live. Build and scoped lint pass. Deployed `53bb72bd-bb30-47fa-a363-e27f07739708`; rollback `05e260e4-5f06-4242-b4d0-d01a0c869838`. Native read-only viewer visually checked at 390px. Physical-phone testing remains unverified.

## Pretty-print follow-up

- [x] Replace the textarea with a keyboard-focusable code viewer. JSON retains indentation and uses syntax colors; source strings render as React text, never HTML. Long code lines scroll inside the viewer. Datasets over 100,000 characters retain complete formatted output without syntax spans.
- [x] Build, scoped lint, preview/copy equality and existing complete-output browser journeys pass locally in Chrome, Firefox and WebKit. Visually inspected the 390px JSON preview. Desktop keyboard access uses Option-Tab in WebKit.
- [x] Deployed `cb3fc196-18f6-455e-85b8-acb087157130`; all three browser replays pass on the live site, including exact preview/copy equality and syntax highlighting. Rollback: `53bb72bd-bb30-47fa-a363-e27f07739708`.
