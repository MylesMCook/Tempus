# Current SDK on local workerd

Current archive `a7f9e298c3c3152e0cddc7e439819ed0aba83a2471e81adc78a646e9737ca21b` passes diagnostic version 4 on local workerd through Wrangler 4.131.1. The installed 56 files match the archive; no SDK implementation or package bytes changed.

The added task is `Buy apples for mom at 1:30am on 11/01/2026`, Chicago, reference September 12, 2026. Authored title, November 1 and second-1:30-AM answers produce a point at 07:30 UTC. Every unresolved stage refuses export. The task checks original input, event/source spans and strict-calculator separation; changing mom to dad invalidates all earlier answers and blocks export again.

`pending`, `assuming` and `provided` reminder wording remains unresolved with its original input, no offered title interpretation and no export. These conservative rejections are safeguards, not completed conditional-scheduling tasks.

All nineteen files pass the pinned Python icalendar/recurring-ical-events readers. The updated reader also passes the historical version-3 output. Original eighteen file contents and failure/recovery fields match byte for byte. TypeScript strict installed-consumer compilation and scoped lint pass. Logs, reader results, source snapshots and archive hashes are retained here.

Run the current diagnostic copied into the verified consumer installation with `pnpm exec wrangler dev --config INSTALL/wrangler.verify.jsonc --local --ip 127.0.0.1 --port 8788`; read `/verify` and pass its JSON to `uv run --locked examples/sdk/read-worker-files.py RESULT`. The route accepts only a fixed authored diagnostic, not arbitrary user input. This run used loopback and was stopped after verification.

This is local workerd and separate file-reader evidence. It does not establish deployed Cloudflare behavior, calendar-client import, independent consumer evaluation, public API stability, physical-device behavior or full-current offline browser coverage. The latter still retains the older e70 artifact scope. No push, deployment or calendar write occurred.
