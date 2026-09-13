# /// script
# requires-python = ">=3.11"
# dependencies = ["recurring-ical-events==3.8.2", "icalendar==7.3.0"]
# ///
"""Read actual downloads from verify-browser.mjs; never import into a calendar."""
import hashlib
import json
import sys
from datetime import date, datetime, timezone
from importlib.metadata import version
from pathlib import Path
import icalendar
import recurring_ical_events

folder = Path(sys.argv[1])
result = json.loads((folder / "report.json").read_text())
assert result["status"] == "passed"
assert {(run["browser"], run["width"]) for run in result["runs"]} == {(browser, width) for browser in ["chromium", "firefox", "webkit"] for width in [320, 1280]}
assert len(result["runs"]) == 6
days = ["2026-09-13", "2026-09-20", "2026-09-27", "2026-10-04", "2026-10-11", "2026-10-18", "2026-10-25", "2026-11-01", "2026-11-08"]
weekly = [[f"{day}T{'06' if i < 7 else '07'}:30:00+00:00", f"{day}T{'07' if i < 7 else '08'}:00:00+00:00"] for i, day in enumerate(days)]
points = [[f"{day}T17:00:00+00:00"] for day in ["2026-09-30", "2026-10-02", "2026-10-04"]]
count_dates = {'weekly': ['2026-09-14', '2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12'], 'monthly': ['2026-09-30', '2026-10-31', '2026-11-30'], 'past-consume': ['2026-09-14', '2026-09-21'], 'past-upcoming': ['2026-09-14', '2026-09-21', '2026-09-28'], 'excluded-consume': ['2026-09-14', '2026-09-28'], 'excluded-replace': ['2026-09-14', '2026-09-28', '2026-10-05']}
report = []
for run in result["runs"]:
    assert run["status"] == "passed" and not run["errors"] and not run["externalRequests"]
    if result.get("offlineAfterLoad"):
        assert run["offlineControlFailed"] is True
        assert run["offlineRequests"] == [run["offlineControlUrl"]]
    expected_names = {f'{run["browser"]}-{run["width"]}-{kind}.ics' for kind in ["weekly", "list", "date-point", "all-day-range", "range", "count-weekly", "count-monthly", "count-past-consume", "count-past-upcoming", "count-excluded-consume", "count-excluded-replace", "range-exclusive", "range-inclusive", "range-mixed"]}
    assert len(run["files"]) == 14 and {file["filename"] for file in run["files"]} == expected_names
    for file in run["files"]:
        raw = (folder / file["filename"]).read_bytes()
        assert hashlib.sha256(raw).hexdigest() == file["sha256"]
        calendar = icalendar.Calendar.from_ical(raw)
        policy = next((kind for kind in ["exclusive", "inclusive", "mixed"] if file["filename"].endswith(f"-range-{kind}.ics")), None)
        if policy:
            events = calendar.walk("VEVENT")
            assert len(events) == 1
            event = events[0]
            assert str(event["SUMMARY"]) == "Call Sam" and "RRULE" not in event and "DURATION" not in event
            if policy == "mixed":
                assert all(type(event.decoded(field)) is datetime for field in ["DTSTART", "DTEND"])
                observed = [event.decoded(field).astimezone(timezone.utc).isoformat() for field in ["DTSTART", "DTEND"]]
                assert observed == ["2026-11-01T07:30:00+00:00", "2026-11-02T07:30:00+00:00"]
            else:
                assert all(type(event.decoded(field)) is date for field in ["DTSTART", "DTEND"])
                observed = [event.decoded(field).isoformat() for field in ["DTSTART", "DTEND"]]
                assert observed == ["2026-09-13", "2026-09-18" if policy == "exclusive" else "2026-09-19"]
            report.append({**file, "observed": observed, "status": "passed"})
            continue
        counted = next((kind for kind in count_dates if file["filename"].endswith(f"-count-{kind}.ics")), None)
        if counted:
            base = calendar.walk("VEVENT")
            assert all("RRULE" not in event and "DTEND" not in event and "DURATION" not in event for event in base)
            events = recurring_ical_events.of(calendar).between(datetime(2026, 1, 1, tzinfo=timezone.utc), datetime(2036, 1, 1, tzinfo=timezone.utc))
            starts = sorted(event.decoded("DTSTART").astimezone(timezone.utc).isoformat() for event in events)
            expected = [f"{day}T{'18' if day == '2026-11-30' else '17'}:00:00+00:00" for day in count_dates[counted]]
            assert starts == expected
            assert all(str(event["SUMMARY"]) == "Call Sam" for event in events)
            report.append({**file, "observed": starts, "status": "passed"})
            continue
        precision = "date-point" if file["filename"].endswith("-date-point.ics") else "all-day-range" if file["filename"].endswith("-all-day-range.ics") else None
        if precision:
            events = calendar.walk("VEVENT")
            assert len(events) == 1
            event = events[0]
            assert type(event.decoded("DTSTART")) is date
            assert event.decoded("DTSTART").isoformat() == ("2026-09-12" if precision == "date-point" else "2026-09-13")
            if precision == "all-day-range":
                assert type(event.decoded("DTEND")) is date and event.decoded("DTEND").isoformat() == "2026-09-15"
            if precision == "date-point":
                assert "DTEND" not in event
            assert str(event["SUMMARY"]) == "Call Sam" and "DURATION" not in event
            report.append({**file, "status": "passed", "precision": precision})
            continue
        if file["filename"].endswith("-range.ics"):
            events = calendar.walk("VEVENT")
            assert len(events) == 1
            event = events[0]
            rows = [event.decoded(field).astimezone(timezone.utc).isoformat() for field in ["DTSTART", "DTEND"]]
            assert rows == ["2026-11-01T07:30:00+00:00", "2026-11-02T18:00:00+00:00"]
            assert str(event["SUMMARY"]) == "Call Sam" and "DURATION" not in event
            report.append({**file, "observed": rows, "status": "passed"})
            continue
        is_list = file["filename"].endswith("-list.ics")
        events = calendar.walk("VEVENT") if is_list else recurring_ical_events.of(calendar).between(datetime(2026, 1, 1, tzinfo=timezone.utc), datetime(2027, 1, 1, tzinfo=timezone.utc))
        fields = ["dtstart"] if is_list else ["dtstart", "dtend"]
        if is_list:
            assert all("DTEND" not in event and "DURATION" not in event for event in events)
        rows = [[event.decoded(field).astimezone(timezone.utc).isoformat() for field in fields] for event in events]
        assert rows == (points if is_list else weekly), file["filename"]
        assert all(str(event["SUMMARY"]) == "Call Sam" for event in events)
        report.append({**file, "observed": rows, "status": "passed"})
print(json.dumps({"readers": {name: version(name) for name in ["icalendar", "recurring-ical-events"]}, "files": report, "scope": "Authored download readback, not calendar-client import or independent evaluation"}, indent=2))
