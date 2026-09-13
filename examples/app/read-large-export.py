# /// script
# requires-python = ">=3.11"
# dependencies = ["icalendar==7.3.0", "recurring-ical-events==3.8.2"]
# ///
"""Validate full large files; never write calendar accounts."""
import hashlib
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo
import icalendar
import recurring_ical_events

folder = Path(sys.argv[1])
report = json.loads((folder / "report.json").read_text())
is_app = "runs" in report
files = [run["file"] for run in report["runs"]] if is_app else [
    {"filename": row["id"] + ".ics", "sha256": row["sha256"]}
    for row in report["exports"] if row["expectedCount"]
]
if is_app:
    assert report["status"] == "passed"
    assert {run["width"] for run in report["runs"]} == {320, 1280}
    assert all(run["reviewedEvents"] == 1000 and not run["errors"] for run in report["runs"])
zone = ZoneInfo("America/Chicago")
results = []
for item in files:
    data = (folder / item["filename"]).read_bytes()
    assert hashlib.sha256(data).hexdigest() == item["sha256"]
    calendar = icalendar.Calendar.from_ical(data)
    events = calendar.walk("VEVENT")
    assert len(events) == 1000
    # One finite recurrence set: a master plus uniquely identified overrides share one UID.
    assert len({str(event["UID"]) for event in events}) == 1
    assert len({(str(event["UID"]), str(event.get("RECURRENCE-ID", "master"))) for event in events}) == 1000
    assert sum("RECURRENCE-ID" in event for event in events) == 999
    dates = []
    for event in events:
        assert "RRULE" not in event and "DURATION" not in event
        assert str(event["SUMMARY"]) == "Call Sam"
        start = event.decoded("DTSTART")
        local = start.astimezone(zone)
        assert (local.hour, local.minute, local.second) == (12, 0, 0)
        dates.append(local.date())
        if "duration" in item["filename"] or is_app:
            assert event.decoded("DTEND") - start == timedelta(minutes=30)
        else:
            assert "DTEND" not in event
    assert dates == [dates[0] + timedelta(days=i) for i in range(1000)]
    if not is_app:
        assert dates[0].isoformat() == "2026-09-12"
    expanded = recurring_ical_events.of(calendar).between(
        datetime(2026, 1, 1, tzinfo=timezone.utc), datetime(2037, 1, 1, tzinfo=timezone.utc)
    )
    assert len(expanded) == 1000
    assert sorted(event.decoded("DTSTART") for event in expanded) == sorted(event.decoded("DTSTART") for event in events)
    results.append({**item, "events": 1000, "firstLocalDate": str(dates[0]), "lastLocalDate": str(dates[-1]), "status": "passed"})
print(json.dumps({"files": results, "scope": "Separate Python readers verify complete files, dates, durations, titles and unique UID/recurrence identities. SDK first date has a fixed oracle; app checks continuity, not its captured reference. No actual client import."}, indent=2))
