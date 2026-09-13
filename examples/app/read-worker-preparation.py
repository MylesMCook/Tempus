# /// script
# requires-python = ">=3.11"
# dependencies = ["icalendar==7.3.0", "recurring-ical-events==3.8.2"]
# ///
"""Read lifecycle-check downloads without writing calendars."""
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
assert report["status"] == "passed"
assert {run["browser"] for run in report["runs"]} == {"chromium", "firefox", "webkit"}
rows = []
for run in report["runs"]:
    assert run["status"] == "passed" and not run["errors"]
    assert {f["filename"] for f in run["files"]} == {f'{run["browser"]}-{suffix}.ics' for suffix in ["retry", "edited", "title"]}
    for file in run["files"]:
        data = (folder / file["filename"]).read_bytes()
        assert hashlib.sha256(data).hexdigest() == file["sha256"]
        count, title = (5, "Call Sam") if "retry" in file["filename"] else (3, "Final title" if "-title" in file["filename"] else "Call Jo")
        calendar = icalendar.Calendar.from_ical(data)
        events = calendar.walk("VEVENT")
        assert len(events) == count
        assert len({(str(e["UID"]), str(e.get("RECURRENCE-ID", "master"))) for e in events}) == count
        assert all(str(e["SUMMARY"]) == title and "DTEND" not in e and "RRULE" not in e for e in events)
        starts = [e.decoded("DTSTART") for e in events]
        local = [start.astimezone(ZoneInfo("America/Chicago")) for start in starts]
        assert all((d.hour, d.minute, d.second) == (12, 0, 0) for d in local)
        assert [d.date() for d in local] == [local[0].date() + timedelta(days=i) for i in range(count)]
        expanded = recurring_ical_events.of(calendar).between(datetime(2026, 1, 1, tzinfo=timezone.utc), datetime(2037, 1, 1, tzinfo=timezone.utc))
        assert sorted(e.decoded("DTSTART") for e in expanded) == sorted(starts)
        rows.append({**file, "count": count, "title": title, "status": "passed"})
print(json.dumps({"files": rows, "scope": "Separate readers check actual lifecycle downloads, counts, identity, titles and daily starts; no independent captured-reference oracle or calendar-client import."}, indent=2))
