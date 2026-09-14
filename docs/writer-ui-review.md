# Copy and UI simplification

Writer review shortened the README, SDK quickstart, capability matrix and release checklist. Full SDK policies remain in the packaged reference; earlier matrix and release records are preserved. No parser rules or dependencies changed.

## Website

- **Cognitive Load:** repeated before/after dates and generic explanations made short calculations long. The trace now shows the starting date and each result once. Clamp, approximation and offset notes remain visible; reference details stay in Calculation inputs. Arithmetic steps open by default; a plain date does not repeat its result in an open trace.
- **Law of Proximity:** schedule data appeared both as date cards and an expanded text preview. The preview stays beside the format selector but starts collapsed. Selecting a format opens its full output. Copy still includes the complete finite set.
- Removed repeated introductory copy and stale developer guidance. Geist, native disclosures and existing correction controls remain.

## Verification

1,181 tests pass, with the existing expected calendar-reader failure. Types, lint, formatting, build and Cloudflare dry run pass. SDK quickstart examples run; local Markdown links resolve and the archive includes the reference.

[Browser/SDK journeys](../comparison/evidence/writer-ui/browser-contract.json) cover calculation, correction, complete copy and export in Chromium, Firefox and WebKit. [Offline/keyboard journeys](../comparison/evidence/writer-ui/offline-keyboard.json) pass; [separate readers](../comparison/evidence/writer-ui/calendar-readers.json) validate nine files. The offline run preceded final developer/privacy wording edits; parsing and output code were unchanged afterward.

[Layout checks](../comparison/evidence/writer-ui/layout.json) cover 320, 390 and 1280 CSS pixels, with no horizontal overflow and automatic full JSON preview after selection. The 390px calculation screenshot was visually inspected. [Word counts](../comparison/evidence/writer-ui/word-counts.json) measure shorter entry documents, not removal of their historical evidence.

These are authored desktop checks. They do not prove physical-phone usability, independent task success or actual calendar-client imports. The engine bundle is unchanged; this is a reduction in visible repetition, not a performance claim.

## Published result

PR #6 merged as `6c8a414`. Cloudflare version `228380e5-5b2f-4ec9-8ca4-69adebe55f4d` is live. [Production checks](../comparison/evidence/writer-ui/live-report.json) pass for both hostnames and three browser engines, including the collapsed schedule preview opening on JSON selection. CI also passed its dependency audit. No calendar account was written.
