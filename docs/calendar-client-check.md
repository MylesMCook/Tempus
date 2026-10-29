# Calendar-client check

**Not run yet.** On October 29, 2026 the user chose to import the app pack by hand into throwaway calendars in Google Calendar, Apple Calendar and Outlook, following the checklist below. No agent signs in to any account. The DST diagnostic pack is not covered by that approval.

There are two packs. The **app pack** holds the files the app downloads today. The **DST diagnostic pack** below isolates clock-change cases. Run the app pack first.

## App pack: manual import checklist

Generate the files (no network, no calendar access):

```sh
pnpm build:sdk
node comparison/calendar/app-import-pack.mjs
```

This writes ten `.ics` files and `manifest.json` to `comparison/results/calendar/app-import-pack/`. The manifest lists each file's phrase, hand-written expectation, first events in UTC and SHA-256. Every title starts with `Tempus test`, so the events are easy to find and delete.

None of the files contains an alert, attendee, location or URL. Each file has a fixed event ID, so importing the same file twice shows whether an app updates or duplicates.

### Before you start, in each app

Menu names change between versions; these are the usual routes.

| Step                      | Google Calendar (web)                                                       | Apple Calendar (Mac)                                                                    | Outlook (web or new Outlook)                                                                   |
| ------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Show Central Time         | Settings › General › Time zone: **(GMT-06:00) Central Time - Chicago**      | Settings › Advanced › turn on time zone support, then pick **Chicago** at the top right | Settings › General › Language and time › Time zone: **(UTC-06:00) Central Time (US & Canada)** |
| Make a throwaway calendar | Other calendars › + › Create new calendar: `Tempus import test`             | File › New Calendar › **On My Mac**: `Tempus import test` (keeps it off iCloud)         | Add calendar › Create blank calendar: `Tempus import test`                                     |
| Import one file           | Settings › Import & export › Import: pick the file and `Tempus import test` | File › Import: pick the file, then choose `Tempus import test`                          | Add calendar › Upload from file: pick the file and `Tempus import test`                        |
| Clean up afterwards       | Settings › `Tempus import test` › Remove calendar › Delete                  | Right-click `Tempus import test` › Delete                                               | Right-click `Tempus import test` › Delete                                                      |

Write down the app version or "web" and the date you tested.

### Import and check each file

Import each file once, open each event, and mark **OK** or write what you saw instead. Check the title too: every event should be titled `Tempus test` plus the file name, for example `Tempus test 02-thirty-minutes`.

| File                              | What to check (Central Time)                                                                              | Google | Apple | Outlook |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- | ------ | ----- | ------- |
| `01-start-only.ics`               | Fri Oct 30, 2026 at 12:00 PM. The file has no end: write the length the app shows (0, 30, 60 min, other). |        |       |         |
| `02-thirty-minutes.ics`           | Fri Oct 30, 2026, 12:00–12:30 PM.                                                                         |        |       |         |
| `03-hour-across-clock-change.ics` | Sun Mar 14, 2027, 1:30 AM to 3:30 AM. One real hour across the spring clock change.                       |        |       |         |
| `04-timed-range.ics`              | Tue Nov 3, 2026, 9:00–11:00 AM.                                                                           |        |       |         |
| `05-all-day-date.ics`             | All day on Fri Oct 30, 2026 only. Nothing on Oct 31.                                                      |        |       |         |
| `06-all-day-range.ics`            | All day Mon Nov 2 to Wed Nov 4, 2026. Nothing on Nov 5.                                                   |        |       |         |
| `07-date-list.ics`                | Two separate events, Mon Nov 2 and Wed Nov 4, 2026, each at 12:00 PM.                                     |        |       |         |
| `08-weekly-ongoing.ics`           | One series, Mondays 9:00–9:30 AM, no end date. Nov 2, 2026 and Mar 15, 2027 both at 9:00 AM.              |        |       |         |
| `09-weekly-three-times.ics`       | Exactly Mon Nov 2, 9 and 16, 2026, 9:00–9:30 AM. Nothing on Nov 23.                                       |        |       |         |
| `10-monthly-ongoing.ics`          | One series on the 1st of each month at 12:00 PM, no end date. Nov 1, 2026 is 12:00 PM.                    |        |       |         |

### Then check these once per app

| Question                                                                                                | Google | Apple | Outlook |
| ------------------------------------------------------------------------------------------------------- | ------ | ----- | ------- |
| Import `02-thirty-minutes.ics` a second time. One event (updated) or two (duplicate)?                   |        |       |         |
| Switch the app's time zone to New York. Does `02-thirty-minutes` move to 1:00–1:30 PM? Switch back.     |        |       |         |
| Did any event get an alert or notification you did not add?                                             |        |       |         |
| Can you open `08-weekly-ongoing` and edit the whole series as one, or did it import as separate events? |        |       |         |
| Does the event description show the original phrase and timezone?                                       |        |       |         |
| Any import warning, rejected file or missing event?                                                     |        |       |         |

The app gives every download a new event ID, so in the app re-downloading always duplicates today. The second-import answer shows whether stable IDs (deferred decision D9) would help.

### Where to record results

Fill in the three tables above in your copy of this page, or send the answers back in chat and they will be copied here. Keep screenshots out of Git if they show account names or other calendars. Delete each `Tempus import test` calendar when done.

## DST diagnostic pack

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
