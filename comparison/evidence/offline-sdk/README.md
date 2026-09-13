# Loaded SDK tasks without network access

September 13, 2026. Current archive `bd06963f2facb68dce9e2aadb79b21d9cfd2583a004a60b6e7b33e9706f0aa7e` passes six offline-after-load keyboard/download runs. No SDK implementation, package byte, calendar policy or application behavior changed in this milestone.

## Verified boundary

The static example loads from loopback using the installed package. The runner then disables networking in each disposable browser context, waits for navigator.onLine to become false, and makes a control fetch that must fail. After that, it runs the existing fourteen complete keyboard/correction/download journeys at each viewport. All subsequent request events are recorded; any request beyond the failed control makes the offline check fail.

Chrome 153.0.8010.36, Playwright Firefox 148.0.2 and WebKit 26.4 pass at 320 and 1280 px. WebKit uses Option-Tab. All six control fetches fail as expected, and no further network request is observed during the journeys. Original input, date/DST choices, count policies, complete recurrence/list/range files and edit invalidation retain the existing assertions.

The 84 actual downloads pass separate icalendar 7.3.0 and recurring-ical-events 3.8.2 readers. The reader now also checks the offline control and request record when the report declares offline mode. Lint/type checks pass. The task-local static server was stopped; the main app remains on 5174. The computer and shared services were never disconnected.

## What this does not establish

This verifies tasks in an already-loaded SDK integration. It does not verify website cold start without a network, cache persistence, service workers, the main app's API replay behavior, offline browser restart, or offline package installation on a machine with an empty dependency cache. It is not a physical-phone, battery, peak-memory, screen-reader or actual calendar-client import test.

The initial HTML/module fetch is online. These are fourteen authored tasks per browser/viewport, not independent user observations or general language coverage. Downloads are paced. Historical rapid-download, ordinary-Tab WebKit and first-run development-server failures remain retained; this run does not explain or fix them. No performance or competitive-superiority claim follows.

## Reproduction

Use the [offline-after-load instructions](../../../examples/sdk/README.md#verify-tasks-after-disconnecting): start `serve-packed.mjs` against a verified installation, then run `verify-browser.mjs` with `--webkit-option-tab --offline-after-load` into a new directory and run the separate Python reader. Stop only the task-local server afterward.

This refreshes the full keyboard/download suite for the same archive as the [numeric formatter optimization](../numeric-formatter/README.md), whose Node 22/26, local Worker, replay and resource checks retain their own scopes. It does not replace independent evaluation. All nine product requirements remain unchanged. No publication, deployment, cloud change or calendar write occurred.
