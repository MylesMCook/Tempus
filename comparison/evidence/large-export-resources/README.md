# Large export review and resource limits

September 13, 2026. SDK archive `3766276269c5e863a4660b7f47bfff9cdf5b93d20afeebdf06b79385520b666b` is unchanged. The app now renders ten export-review events per page, exposes the complete count, supports previous/next keyboard actions, and resets the page when input or export choices change. Download still builds the complete file with the existing validation.

## Observed problem and scoped improvement

An exploratory Chrome 1280px run rendered 1,000 rows and observed a 528 ms main-thread task when opening a daily 1,000-event export. The console observation is retained in exploratory-before.json; it is not a paired benchmark or an immutable old-source snapshot.

After pagination, the authored browser journey traverses every page at 320px and 1280px, checks labels 1–1,000 without duplication, retains the input/title, downloads all 1,000 events, and verifies an edit to five events resets review to the first page. Both runs pass with no page errors or horizontal overflow. Direct focus/Enter is exercised; this is not full Tab-order, physical-phone or independent-user evidence.

Opening review through a subsequent animation frame took about 231/234 ms at 320/1280px, with observed main-thread tasks of 214/208 ms. This remains a responsiveness failure. Pagination removes unnecessary DOM work but does not make complete schedule preflight asynchronous. The next change needs a responsive preparation path with cancellation and stale-response protection, preserving the same calendar policy.

## Packed SDK resources

The runner checks all installed package files against the retained package-verification manifest. One Node 26 process parsed 5,970 distinct ambiguous date phrases across all 597 bundled zone names and ten reference contexts. Years ranged from 2027 to 7996; all outcomes required clarification and retained input. This is an authored stress workload, not typical usage or accuracy evidence.

Post-GC JS heap was 8.69 MiB after the first cycle and 8.95 MiB after the tenth. Process RSS grew from 46.02 MiB before import to 202.64 MiB after the last cycle: about 156.63 MiB growth. The last four RSS snapshots were near 202 MiB, but ten cycles cannot prove bounded retention or absence of a leak. This exceeds the provisional 128 MiB containment figure used for the smaller fixed desktop workload. Stress-specific acceptance still needs review. Native allocations, JIT and allocator retention are included; this is not peak memory, isolated library memory or energy measurement.

Twenty warm file-generation calls per case, after the stress workload, produced these p50/p95 times:

| Authored task                                  |     p50 / p95, ms | Result                          |
| ---------------------------------------------- | ----------------: | ------------------------------- |
| 1,000 daily noon points                        |   79.114 / 84.493 | Complete file                   |
| 1,000 daily noon events, 30 minutes each       | 137.377 / 146.104 | Complete file                   |
| 1,000 Monday events beyond the ten-year window |   34.930 / 40.167 | Explicit block; no partial file |

The two successful cases meet the provisional one-second SDK generation target. They do not pass browser responsiveness, hardest-clock export, physical-device or actual client-import gates. Timing excludes initial parsing and user review. No competitor equivalent-task measurement was made here.

## Independent file readers and retained failures

The Python readers validate both SDK files and both downloaded app files: 1,000 daily starts at Chicago noon, consecutive civil dates across DST, 30-minute elapsed duration where requested, titles, master/override identities and complete expanded occurrence equality. SDK first dates use the fixed reference oracle. App readback checks continuity and the complete set, not its captured reference. No real calendar client was used.

The first reader incorrectly expected unique UIDs per VEVENT. This implementation uses one finite recurrence set: one master with RDATEs plus 999 RECURRENCE-ID overrides sharing one UID. The reader now checks uniqueness of the UID/RECURRENCE-ID pair and expansion equality. The failed reader is retained; no exporter change was made to satisfy it.

The initial memory probe stopped on `Call person 0 on 03/04/2027 at noon`, which returns unsupported, while `Call Sam on 03/04/2027 at noon` offers clarification. Its runner and failure are retained in failed-probe. The revised resource workload varies supported numeric date phrases and contexts. This does not fix or score the rejected numeric event label as a completed task.

## Reproduce

- `node --expose-gc comparison/performance/resources.mjs VERIFIED-INSTALL NEW-OUTPUT`
- With the local app at loopback port 5174: `node examples/app/verify-large-export.mjs PLAYWRIGHT-ENTRY NEW-OUTPUT`
- `uv run --locked examples/app/read-large-export.py OUTPUT` for each successful output directory.

Build and lint/type checks pass for the pagination and runners. The SDK is byte-unchanged; its previous Node/browser/Worker evidence remains scoped to that archive. The full repository check remains blocked by unrelated Rust formatting. All work stays local; no calendar writes or external publication occurred.
