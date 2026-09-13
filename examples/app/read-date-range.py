# /// script
# requires-python = ">=3.11"
# dependencies = ["recurring-ical-events==3.8.2", "icalendar==7.3.0"]
# ///
import hashlib
import json
import sys
from pathlib import Path
from datetime import timezone
import icalendar

root = Path(sys.argv[1])
source = json.loads((root / "report.json").read_text())
assert source["status"] == "passed" and len(source["runs"]) == 4
assert {(run["id"], run["width"]) for run in source["runs"]} == {(kind, width) for kind in ["relative", "corrected"] for width in [320, 1280]}
expected = {
    "relative": ["2026-09-13T17:00:00+00:00", "2026-09-18T17:00:00+00:00"],
    "corrected": ["2026-11-01T07:30:00+00:00", "2026-11-02T18:00:00+00:00"],
}
report = []
for run in source["runs"]:
    assert run["status"] == "passed"
    filename = f"{run['id']}-{run['width']}.ics"
    raw = (root / filename).read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    assert digest == run["sha256"]
    events = icalendar.Calendar.from_ical(raw).walk("VEVENT")
    assert len(events) == 1
    event = events[0]
    times = [event.decoded(field).astimezone(timezone.utc).isoformat() for field in ["DTSTART", "DTEND"]]
    assert times == expected[run["id"]]
    assert str(event["SUMMARY"]) == "Call Sam" and "DURATION" not in event
    report.append({"file": filename, "sha256": digest, "times": times, "status": "passed"})
print(json.dumps(report, indent=2))
