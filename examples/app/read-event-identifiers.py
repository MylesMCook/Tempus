# /// script
# requires-python = ">=3.11"
# dependencies = ["icalendar==7.3.0", "recurring-ical-events==3.8.2"]
# ///
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
import icalendar
import recurring_ical_events

folder = Path(sys.argv[1])
report = json.loads((folder / "report.json").read_text())
assert report["status"] == "passed"
keys = ["invoice", "schedule", "title"] + (["quantity"] if report.get("version") in (2, 3, 4, 5, 6) else [])
if report.get("version") in (3, 4, 5, 6):
    keys.append("recipient")
if report.get("version") in (4, 5, 6):
    keys.append("clock-first")
if report.get("version") in (5, 6):
    keys.append("quantity-list")
if report.get("version") == 6:
    keys.append("recipient-lowercase")
assert len(report["runs"]) == len(keys) * 2
assert {(r["id"], r["width"]) for r in report["runs"]} == {(key, width) for key in keys for width in [320,1280]}
expected = {
    "recipient-lowercase": ("Buy apples for mom", ["2026-11-01T07:30:00+00:00"], "2026-11-01T08:00:00+00:00"),
    "quantity-list": ("Buy 3 apples and 2 pears", ["2026-11-01T07:30:00+00:00"], "2026-11-01T08:00:00+00:00"),
    "clock-first": ("Buy apples for Sam", ["2026-11-01T07:30:00+00:00"], None),
    "recipient": ("Buy apples for Sam", ["2026-11-01T07:30:00+00:00"], "2026-11-01T08:00:00+00:00"),
    "quantity": ("Buy 3 apples", ["2026-11-01T07:30:00+00:00"], "2026-11-01T08:00:00+00:00"),
    "invoice": ("Pay invoice #123", ["2026-11-01T07:30:00+00:00"], "2026-11-01T08:00:00+00:00"),
    "schedule": ("Visit room 3", ["2026-09-14T17:00:00+00:00", "2026-09-21T17:00:00+00:00", "2026-09-28T17:00:00+00:00"], None),
    "title": ("Room 3", ["2026-09-13T17:00:00+00:00"], None),
}
rows = []
for run in report["runs"]:
    assert run["status"] == "passed" and not run["errors"]
    data = (folder / run["file"]).read_bytes()
    assert hashlib.sha256(data).hexdigest() == run["sha256"]
    calendar = icalendar.Calendar.from_ical(data)
    events = calendar.walk("VEVENT")
    title, starts, end = expected[run["id"]]
    assert [e.decoded("DTSTART").isoformat() for e in events] == starts
    assert all(str(e["SUMMARY"]) == title and "RRULE" not in e for e in events)
    if end:
        assert events[0].decoded("DTEND").isoformat() == end
    else:
        assert all("DTEND" not in e for e in events)
    expanded = recurring_ical_events.of(calendar).between(datetime(2026,1,1,tzinfo=timezone.utc),datetime(2028,1,1,tzinfo=timezone.utc))
    assert sorted(e.decoded("DTSTART").isoformat() for e in expanded) == sorted(starts)
    rows.append({"file": run["file"], "status":"passed", "starts":starts,"title":title})
print(json.dumps({"files":rows,"scope":"Separate file readers and fixed authored oracle; not calendar-client import or independent product evaluation."},indent=2))
