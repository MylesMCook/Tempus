# Calendar preparation off the main thread

September 13, 2026. The app prepares recurring calendar reviews and files in a local module worker after Export to calendar is opened. Download remains a separate explicit click on the current file. Ordinary point/range file generation and the public synchronous SDK API remain unchanged.

Requests are tied to the current interpretation, reference, decisions and title. An old response cannot enable download after those change, even before effect cleanup runs. Closing, cancelling or superseding a request terminates its worker; completion/error also terminates it. Title edits wait 150 ms before starting work. Cancellation offers retry, and restarting clock choices clears the answer and resumes preparation. Worker failures leave download disabled; there is no blocking fallback.

The internal review/file entry computes one complete preflight and uses it to render the file. Callers cannot supply a prevalidated plan. The public file helper retains its signature and behavior. This removes the first worker implementation's duplicate preflight without removing validation, traces or clock policy.

## Measured result and cost

The prior paginated app observed 214/208 ms main-thread tasks at 320/1280px while opening a 1,000-event review. The final built app observed no long tasks during that interval in either run. It still took about 299/306 ms from activation through prepared review and a subsequent animation frame. This does not meet a 100 ms ready-result target, and two observations cannot establish p95. The initial duplicate-preflight worker took about 489/496 ms; those exploratory development runs are retained separately, not treated as a controlled paired benchmark.

The built worker is 511,564 bytes, or 143,674 bytes with Node gzip. It is loaded only for recurring export. The initial application JavaScript is 897,831 bytes / 261,121 Node-gzip bytes. Both assets are retained compressed with uncompressed hashes. This avoids a UI stall by adding a worker context and deferred transfer; it is not a memory, energy or total-transfer reduction. The existing large-chunk warning remains.

## Evidence

- `lifecycle-built`: actual module workers in Chrome 153, Playwright Firefox 148 and WebKit 26.4 under the shipped CSP, at 320px. The harness deliberately delays real messages after cancellation and simulates unavailable Worker construction. Cancel/retry, edited title/input, late responses and restart-after-cancelled-clock-choice pass. Every worker is terminated after the checked actions. Nine actual downloads pass separate Python readers for count, identity, title and daily starts.
- `large-built`: both 320px and 1280px traverse all 100 pages, retain input/title, download the full 1,000-event file and reset review after editing to five events. Both full files pass separate readers. Reference-oracle limitations remain in the reader report. These are desktop viewport tests, not physical phones or independent participants.
- `clock-failed` retains a timeout after three excluded-clock journeys. Its cause is unconfirmed. The instrumented `clock-retry` passes all eight cases and their separate readers; no scenario was removed or relaxed.
- Current packed SDK `e5a7e1d134e1f25597d14d93f5078a77b84fd3db5402dca3ebd1d783d7758bf5`: all 56 installed files match; six examples pass on Node 22/26; public export names are unchanged. Six paced browser runs and local workerd pass, with 84 browser files and fifteen Worker files read separately. The retained 31-case/22-journey replay matches full results, stages and file hashes.
- Source/comparison checks pass: 891 tests passed with one expected failure. Build and lint/type checks pass. The unrelated Rust formatting failure still prevents a whole-repository pass. There was no fresh security scan or deployed Cloudflare verification.

The SDK parsing bundle is byte-identical to measured formatter candidate 37662762: 525,387 minified / 149,194 gzip bytes. Its earlier shared CPU comparison is reuse by bundle parity, not a new timing run. The combined calendar bundle is now 543,685 / 154,882 bytes. No competitive correction/export, physical-device, peak-memory, energy or actual client-import result is claimed.

## Reproduce locally

Build with `pnpm build`, then run `node examples/app/serve-built.mjs`. It serves the built assets with `public/_headers` on loopback port 5175; it does not emulate the API or deploy anything. The initial built runs used an equivalent task-local static server applying the same header file. The durable server's response headers were checked separately.

Run these against the built server, with an installed Playwright entry and new output directories:

```sh
TEMPUS_APP_URL=http://127.0.0.1:5175 node examples/app/verify-worker-preparation.mjs PLAYWRIGHT-ENTRY NEW-LIFECYCLE-OUTPUT
TEMPUS_APP_URL=http://127.0.0.1:5175 node examples/app/verify-large-export.mjs PLAYWRIGHT-ENTRY NEW-LARGE-OUTPUT
uv run --locked examples/app/read-worker-preparation.py NEW-LIFECYCLE-OUTPUT
uv run --locked examples/app/read-large-export.py NEW-LARGE-OUTPUT
```

The lifecycle clock scenario is authored for the recorded September 2026 reference period; revise its declared fixture before a future-date run, rather than silently treating expired scenarios as passes. Use the existing SDK package/browser/Worker runners for packed verification. Stop task-local servers afterward. Nothing here authorizes publication or calendar writes.

## Remaining gates

Physical phones, screen readers, actual client imports and independent task evaluation remain unavailable. Varied-zone RSS growth, total preparation wait, first-use transfer and worker memory/energy need further work. No universal responsiveness or competitive superiority claim follows from these tests.
