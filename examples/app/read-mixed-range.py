# /// script
# requires-python = ">=3.11"
# dependencies = ["recurring-ical-events==3.8.2", "icalendar==7.3.0"]
# ///
import hashlib
import json
import sys
from pathlib import Path
from datetime import datetime, timezone
from importlib.metadata import version
import icalendar
import recurring_ical_events
root = Path(sys.argv[1])
report = json.loads((root / "report.json").read_text())
assert report["status"] == "passed"
expected = {
    "end-written": ["2026-09-13T17:00:00+00:00", "2026-09-18T17:00:00+00:00"],
    "end-midnight": ["2026-09-13T17:00:00+00:00", "2026-09-18T05:00:00+00:00"],
    "start-written": ["2026-09-13T17:00:00+00:00", "2026-09-18T17:00:00+00:00"],
    "start-midnight": ["2026-09-13T05:00:00+00:00", "2026-09-18T17:00:00+00:00"],
    "start-fold": ["2026-11-01T07:30:00+00:00", "2026-11-02T07:30:00+00:00"],
}
assert len(report["runs"]) == 10
assert {(r["id"], r["width"]) for r in report["runs"]} == {(kind, width) for kind in expected for width in [320, 1280]}
records = []
for run in report["runs"]:
    assert run["status"] == "passed"
    raw = (root / run["file"]).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == run["sha256"]
    calendar = icalendar.Calendar.from_ical(raw)
    base = calendar.walk("VEVENT")
    assert len(base) == 1
    event = base[0]
    assert all(type(event.decoded(field)) is datetime for field in ["DTSTART", "DTEND"])
    observed = [event.decoded(field).astimezone(timezone.utc).isoformat() for field in ["DTSTART", "DTEND"]]
    assert observed == expected[run["id"]]
    assert str(event["SUMMARY"]) == "Call Sam"
    assert all(field not in event for field in ["RRULE", "DURATION"])
    expanded = recurring_ical_events.of(calendar).between(datetime(2026, 1, 1, tzinfo=timezone.utc), datetime(2036, 1, 1, tzinfo=timezone.utc))
    assert len(expanded) == 1
    records.append({"file": run["file"], "sha256": run["sha256"], "observed": observed, "status": "passed"})
print(json.dumps({"readers": {name: version(name) for name in ["icalendar", "recurring-ical-events"]}, "files": records, "scope": "Actual downloaded file validation; no calendar-client import or independent language evaluation."}, indent=2))
