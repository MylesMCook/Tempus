# Main-app copy recovery

Six built-app Chrome 153 journeys pass: point reminder, timed interval and counted schedule at widths 320 and 1280. Each starts keyboard navigation at the phrase input and reaches its copy button using Tab, then activates it with Enter.

A deliberately injected clipboard denial produces the blocked-copy message, preserves the input and leaves retry available. After restoring the native clipboard method, retry succeeds; the test reads only the text just written by this task and checks the event, date/time, timezone and range/preview wording. Editing Sam to Jo clears the success state. Invalid input removes the copy action. No page errors were observed.

The schedule copy is explicitly an upcoming-occurrence preview, not a calendar export. The interval includes its exclusive-end label; the point retains its event and timezone. These tests verify browser clipboard write/read, not cross-application paste or reminder delivery.

No app or SDK implementation changed. The built app uses the reviewed item-list source; the latest SDK archive remains 5866c6b3. The executed runner is retained with the hash from the report. A subsequent tooling-only cleanup removes a template-type lint warning and ensures failed future runs are labelled failed; it does not change successful-path assertions. Scoped lint passes after cleanup.

The denial is simulated, not an actual OS permission-dialog test. Desktop Chrome widths are not physical phones; Firefox/WebKit clipboard behavior, accessibility technology, native permission recovery and unfamiliar-user completion remain unverified. Clipboard content that existed before this test was never read. No calendars, accounts, deployment or publication were touched.

Reproduce against a task-local built server with `TEMPUS_APP_URL=http://127.0.0.1:5175 node examples/app/verify-copy-recovery.mjs /absolute/playwright-core/index.mjs /new/output-directory`. The runner requires a new directory and records source hashes, tab counts, copied task text and outcome for each case.
