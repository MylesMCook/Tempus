# Local size pruning

The engine contract and supported behavior are unchanged. This pass removes unused application scaffolding; it is not a new release or a competitive performance result.

## Changes

- Remove 45 unused UI component/helper files, three orphan hooks, the inactive React Router entrypoints and root HTML document. Keep the five UI components used by the Redwood application.
- Remove 35 direct dependencies and 105 package-version entries from the lockfile. Comparison with the dirty-state backup shows no new package versions. No package store or caches were pruned; installed disk usage barely changed.
- Remove the obsolete static-build server helper; document the actual production preview command. Give Vite+ an explicit workspace target after removing the old HTML entrypoint.

## Delivery measurements

Production CSS fell from approximately 57.78 KB to 18.16 KB (69% raw reduction), and from 10.74 KB to 4.75 KB compressed using the build reporter (56%). Unused JavaScript was already tree-shaken, so the JavaScript payload is essentially unchanged.

The retained main application chunk is 1,214,029 bytes, or 342,742 bytes using Node gzipSync. It includes a 517,401-byte calendar Worker. A separate Worker experiment reduced the main chunk to 695,922 bytes, but the combined main/Worker gzip grew from 342,742 to 343,643 bytes. The first schedule preparation after going offline then failed. The experiment was reverted; the inline Worker preserves offline use after the application has loaded.

Pinned timezone data, Temporal and its integer support account for roughly 85% of the minified core package in the preceding profile. The main application also needs timezone formatting, so moving parsing alone into a Worker would not eliminate both calendar stacks. No timezone coverage was removed and no decoder, dependency or runtime architecture was added without a demonstrated benefit. Further size work should first isolate formatting versus computation costs and measure a complete journey, including offline preparation.

## Verification

- `pnpm check`, `pnpm test` and `pnpm build` pass: 1,164 tests pass, with one existing expected failure concerning an independent reader's Chicago pre-DST conversion. The large-client-chunk warning remains.
- The production playground matches the existing packed SDK in Chromium, Firefox and WebKit for arithmetic, correction, complete recurrence output, semantic calendar files and stale/negative input handling.
- Worker lifecycle, offline-after-load and developer keyboard journeys pass in all three browsers at 320px and 1280px. Nine downloaded lifecycle files pass the separate Python readers; offline files are checked by ical.js.
- The 390px schedule screenshot was visually inspected: all five dates, output preview, copy and disclosure controls remain visible without horizontal overflow.

Raw evidence and the pre-change dirty-state backup are under `/Users/mylescook/Documents/Codex/2026-09-13-tempus-pruning`: `source-before.tgz`, `baseline.json`, `lockfile-audit.json`, `final-assets.json`, `separate-worker.json`, `separate-worker-offline.txt`, `journeys/report.json`, `worker/report.json`, `calendar-reader.json`, `schedule-390.png`, `build.log` and `tests.log`.

These are authored desktop checks. Physical phones, assistive technology, independent users, peak memory, energy and actual calendar-client imports remain unverified. No push, publication, deployment or calendar write was performed.
