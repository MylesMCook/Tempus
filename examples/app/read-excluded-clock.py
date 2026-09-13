# /// script
# requires-python = ">=3.11"
# dependencies = ["recurring-ical-events==3.8.2", "icalendar==7.3.0"]
# ///
import hashlib
import json
import sys
from pathlib import Path
from datetime import datetime, timezone
import icalendar
import recurring_ical_events
root = Path(sys.argv[1])
result = json.loads((root / "report.json").read_text())
assert result["status"] == "passed" and len(result["runs"]) == 8
expected = {
    "fold-earlier": ["2026-11-08", "2026-11-15", "2026-11-22"],
    "fold-later": ["2026-11-08", "2026-11-15"],
    "gap-earlier": ["2026-03-15", "2026-03-22", "2026-03-29"],
    "gap-later": ["2026-03-15", "2026-03-22"],
}
assert {(r["id"], r["width"]) for r in result["runs"]} == {(kind, width) for kind in expected for width in [320, 1280]}
report = []
for run in result["runs"]:
    assert run["status"] == "passed"
    name = f"{run['id']}-{run['width']}.ics"
    raw = (root / name).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == run["sha256"]
    calendar = icalendar.Calendar.from_ical(raw)
    for event in calendar.walk("VEVENT"):
        assert "RRULE" not in event and "DTEND" not in event and "DURATION" not in event
        assert str(event["SUMMARY"]) == "Call Sam"
        assert "Excluded dates use count slots" in str(event["DESCRIPTION"])
    events = recurring_ical_events.of(calendar).between(datetime(2026, 1, 1, tzinfo=timezone.utc), datetime(2036, 1, 1, tzinfo=timezone.utc))
    starts = sorted(event.decoded("DTSTART").astimezone(timezone.utc).isoformat() for event in events)
    assert starts == [f"{day}T07:30:00+00:00" for day in expected[run["id"]]], starts
    report.append({"file": name, "status": "passed", "starts": starts})
print(json.dumps(report, indent=2))
