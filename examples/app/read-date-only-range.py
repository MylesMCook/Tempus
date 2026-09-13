# /// script
# requires-python = ">=3.11"
# dependencies = ["recurring-ical-events==3.8.2", "icalendar==7.3.0"]
# ///
import hashlib
import json
import sys
from pathlib import Path
from datetime import date, datetime, timezone
from importlib.metadata import version
import icalendar
import recurring_ical_events
root = Path(sys.argv[1])
report = json.loads((root / "report.json").read_text())
assert report["status"] == "passed"
assert len(report["runs"]) == 4
assert {(r["id"], r["width"]) for r in report["runs"]} == {(kind, width) for kind in ["exclusive", "inclusive"] for width in [320, 1280]}
records = []
for run in report["runs"]:
    assert run["status"] == "passed"
    raw = (root / run["file"]).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == run["sha256"]
    calendar = icalendar.Calendar.from_ical(raw)
    base = calendar.walk("VEVENT")
    assert len(base) == 1
    event = base[0]
    assert type(event.decoded("DTSTART")) is date and type(event.decoded("DTEND")) is date
    assert event.decoded("DTSTART").isoformat() == "2026-09-13"
    expected_end = "2026-09-18" if run["id"] == "exclusive" else "2026-09-19"
    assert event.decoded("DTEND").isoformat() == expected_end
    assert str(event["SUMMARY"]) == "Time off"
    assert all(field not in event for field in ["RRULE", "DURATION"])
    expanded = recurring_ical_events.of(calendar).between(datetime(2026, 1, 1, tzinfo=timezone.utc), datetime(2036, 1, 1, tzinfo=timezone.utc))
    assert len(expanded) == 1
    records.append({"file": run["file"], "sha256": run["sha256"], "start": "2026-09-13", "exclusiveEnd": expected_end, "status": "passed"})
print(json.dumps({"readers": {name: version(name) for name in ["icalendar", "recurring-ical-events"]}, "files": records, "scope": "Actual downloaded file validation; no calendar-client import or independent language evaluation."}, indent=2))
