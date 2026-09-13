# Exact-duration fixture control: failure retained

The historical fixture omitted PRODID, which RFC 5545 requires on VCALENDAR. The corrected control adds only that identifier. Dates, timezone transitions, recurrence and expected endpoints are unchanged. Both versions are retained; the original is not silently rewritten.

Both ical.js 2.2.1 and recurring-ical-events 3.8.2 / icalendar 7.3.0 return March 8, 2026 at 07:00–08:00Z. The expectation remains 07:00–09:00Z: the first event's DTEND defines two elapsed hours for each recurrence. Both commands exit 1 on both fixture versions. Adding PRODID does not resolve or explain the duration mismatch.

[RFC 5545 section 3.8.5.3](https://www.rfc-editor.org/rfc/rfc5545.html#section-3.8.5.3) defines exact recurring duration from DTEND; [section 3.7.3](https://www.rfc-editor.org/rfc/rfc5545.html#section-3.7.3) requires PRODID. Local ical.js source computes the duration with timezone subtraction but applies it to occurrences through civil-field addition (`event.js` / `time.js`), consistent with the observed spring-transition mismatch. This is a scoped diagnostic, not general certification of either reader.

This fixture is authored independently of Tempus's exporter. Its failure is not evidence of a current exporter defect. It does show that agreement between these readers cannot establish exact-duration correctness across an offset change. Existing ongoing-export blocks and real-client import gates remain unchanged.

From the repository root, choose a new scratch directory with an existing parent:

```sh
node comparison/calendar/duration-control.mjs comparison/evidence/duration-control/historical.ics /absolute/NEW-DURATION-CONTROL
uv run --locked comparison/calendar/duration-control.py /absolute/NEW-DURATION-CONTROL > /absolute/NEW-DURATION-CONTROL/python.json
```

Both commands are expected to exit 1 for the retained reader versions. Run the second even after the first reports nonconformance. The Node command refuses an existing output directory and checks the input's historical hash. The Python reader verifies fixture hashes and independently declares expected dates; it does not copy observed SDK output into its expectations.

Run `shasum -a 256 -c SHA256SUMS` here to verify retained bytes. Reports were formatted before freezing. No calendar-client import, external report, publication or app/SDK change occurred.
