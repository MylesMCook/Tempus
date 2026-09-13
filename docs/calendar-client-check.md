# Calendar-client check

**Not run. No calendar import is authorized.** The existing import request remains unanswered; the new diagnostic pack is not covered by an approval.

Use this pack to distinguish file-reader behavior from actual client behavior before choosing an ongoing-DST export workaround. It does not replace complete app export/import journeys.

## Reproduce the files

```sh
node comparison/calendar/client-import-pack.mjs
uv run --locked --python 3.13 comparison/calendar/second-reader.py \
  --client-import-pack comparison/results/calendar/client-import-pack \
  --ongoing-events comparison/results/calendar/ongoing-events \
  --timezone-candidates comparison/results/calendar/ongoing-timezones
```

The second command exits 1 for the recorded conformance failures. Generation succeeds when the diagnostic pack is structurally bounded and its UTC control passes; that is not a claim that its DST cases pass the reader.

The four files, exact UTC expectations, file hashes and review instructions are in `comparison/results/calendar/client-import-pack/`. Each file describes one synthetic series with three expected occurrences. Total size is 2,375 bytes. The files contain no alarms, attendees, organizer, attachments, remote URLs or scheduling METHOD. A client's own defaults may still add notifications.

| Case                   | Key expected result                               | ical.js 2.2.1              | Python readers             |
| ---------------------- | ------------------------------------------------- | -------------------------- | -------------------------- |
| Exact UTC control      | March 1/8: 07:00–09:00Z; March 15: 06:00–08:00Z   | Pass                       | Pass                       |
| Local DTEND recurrence | Same two elapsed hours; March 8 ends at 04:00 CDT | Fails: one hour on March 8 | Fails: one hour on March 8 |
| Repeated clock         | November 1 uses first 01:30, or 06:30Z            | Fails: chooses second      | Pass                       |
| Missing clock          | March 8 uses pre-gap offset: 08:30Z               | Fails: returns 07:30Z      | Fails: returns 07:30Z      |

The UTC control explicitly repeats DTSTART in RDATE. The JavaScript iterator omitted the initial DTSTART when it appeared only in DTSTART; the repeated value makes the control usable without changing its expected set. The generated manifest documents that behavior.

Expectations follow [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545), sections 3.3.5, 3.3.10 and 3.8.5.3, with [verified erratum 4271](https://www.rfc-editor.org/errata/eid4271), checked September 13. Version 1 incorrectly expected generated missing clocks to be skipped. Version 2 corrects that expectation: invalid dates are skipped, but missing clocks use the pre-gap offset. Both readers still fail the corrected case by one hour. The unchanged version 1 pack, ongoing probes and Python report are retained under `comparison/results/calendar/history/before-erratum-4271/`. This correction does not change Tempus's explicit-confirmation policy. The authored modern-US timezone deliberately uses an opaque TZID to avoid substituting the app's provider or a host database. It is a control for these 2026 dates, not a complete timezone source.

## After explicit authorization

Use a named disposable local calendar; import each exact hashed file once. Record client/OS version, viewing timezone, imported UIDs, all dates/endpoints, recurrence count, missing or extra occurrences, and whether each remains one editable series. Inspect default alarms. The point cases specify no duration; record any duration the client adds separately.

If the UTC control fails, resolve import or inspection first. If a DST case differs, retain the original observation before judging it against the expected semantics. Do not alter expectations to match the client. Record screenshot or exported readback evidence where available, keeping file parsing separate from the imported state.

Do not import into a personal/shared calendar. Cleanup needs authorization unless included in the import approval. A client passing these finite cases does not prove unbounded export, physical-device compatibility, all supported zones or general Tempus accuracy.
