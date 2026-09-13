# /// script
# requires-python = ">=3.11"
# dependencies = ["icalendar==7.3.0"]
# ///
import hashlib
import json
import sys
from pathlib import Path
from icalendar import Calendar

folder = Path(sys.argv[1])
report = json.loads((folder / "report.json").read_text())
assert report["status"] == "passed"
assert [r["width"] for r in report["runs"]] == [320, 1280]
rows = []
for run in report["runs"]:
    assert run["status"] == "passed" and not run["errors"]
    data = (folder / run["file"]).read_bytes()
    assert hashlib.sha256(data).hexdigest() == run["sha256"]
    events = Calendar.from_ical(data).walk("VEVENT")
    starts = [event.decoded("DTSTART").isoformat() for event in events]
    assert starts == ["2026-11-01T07:30:00+00:00", "2026-09-30T17:00:00+00:00"]
    assert all(str(e["SUMMARY"]) == "Call Sam" and "RRULE" not in e and "DTEND" not in e for e in events)
    rows.append({"file": run["file"], "startsInSerializedOrder": starts})
print(json.dumps({"status": "passed", "files": rows, "scope": "Authored file values and serialized order; no calendar-client import or client display-order claim."}, indent=2))
