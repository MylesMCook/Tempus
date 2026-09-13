# Static packed SDK startup and complete journeys

September 13, 2026. Installed archive `a8a1cbb41947e294d08d82a3fcb39dddd485574daff86b22f3e20e7423bc35ca` passes the built static-browser checks below. No parser, calendar policy, SDK package byte or application behavior changed in this milestone. The new local server and startup probe make browser evidence reproducible without development hot reload.

## Verified behavior

- The server verifies the installed package and example against the package-verification record, bundles the installed TypeScript consumer, and serves only two static assets on loopback. Build and source hashes are retained. Unknown routes and non-GET methods return 404.
- Nine startup probes pass: three fresh contexts each in Chrome 153.0.8010.36, Playwright Firefox 148.0.2 and WebKit 26.4 at 320 px. Each holds JavaScript delivery, enters the complete invoice reminder before initialization, then releases the hash-verified module. The original text survives; numeric-date and repeated-clock choices produce the expected November 1 interval, 07:30–08:00 UTC. Editing invoice #123 to #124 invalidates choices and disables export. No unexpected navigation or external request occurred.
- Six static browser runs pass the existing keyboard-to-download suite at 320/1280. WebKit uses Option-Tab. All 84 downloaded files pass separate icalendar 7.3.0 and recurring-ical-events 3.8.2 readers, covering complete recurrence, count, date-list and range outputs.
- Lint/type checks pass. The task-local static server was stopped afterward; the existing main app on 5174 remains running.

The startup probe uses pointer activation for clarification; keyboard evidence comes from the separate journey suite. Artificially withholding a module is a correctness experiment, not a network benchmark or phone emulation. The startup probe creates no download. Its numeric-label-specific correction path now has packed Chrome/Firefox/WebKit evidence in addition to earlier Node and main-app Chrome checks.

## What the earlier failure means

The [previous development-server run](../identifier-runtime/README.md) failed once while parsing empty result text on Chrome 320 before downloading a file. The server logged a restart and reload near startup. The example updates normal parse results synchronously; a new document starts with empty result text while its module loads. This is a plausible explanation, not established causality: the original run lacked navigation timestamps.

The new static workflow removes hot reload from release verification. It does not fix or explain the original development-server failure, erase that report, or prove every startup race impossible. Nine controlled starts and six authored journeys are bounded observations. Historical ordinary-Tab WebKit and rapid-download failures also remain open.

## Scope and reproduction

Use the [built browser example instructions](../../../examples/sdk/README.md#verify-the-built-browser-example): `serve-packed.mjs`, then `verify-startup.mjs`, `verify-browser.mjs` and the separate Python reader. Use a verified installation and new output directories; no deployment or calendar-account access is required. The retained JavaScript bundle is gzip-compressed to keep generated code out of source linting; its decompressed hash matches build.json.

The unchanged archive's [Node/Worker verification](../identifier-runtime/README.md) and [CPU/resource measurements](../current-sdk-costs/README.md) remain separate evidence. No actual calendar-client import, physical iOS/Android device, retail Safari/Firefox, screen reader, independent participant, peak-memory or energy measurement was added. The product goal and all nine matrix requirements remain unchanged. No superiority or full-release claim is established.
