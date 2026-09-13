# /// script
# requires-python = ">=3.11"
# dependencies = ["recurring-ical-events==3.8.2", "icalendar==7.3.0"]
# ///
"""Independently read the two downloaded reminder files; never import a calendar."""
import hashlib
import json
import sys
from datetime import timezone
from pathlib import Path

import icalendar

if len(sys.argv) != 2:
    raise SystemExit("Usage: uv run --locked read-reminder.py RUN-directory")
root = Path(sys.argv[1]).resolve()
source = json.loads((root / "report.json").read_text())
assert source["status"] == "passed"
assert [run["width"] for run in source["runs"]] == [320, 1280]
assert all(run["status"] == "passed" for run in source["runs"])
scenario = source.get("scenario", "item-year")
expected_by_scenario = {
    "item-year": ["2026-12-31T18:00:00+00:00", "2027-01-01T18:00:00+00:00"],
    "omitted-month": ["2026-09-30T17:00:00+00:00", "2026-10-02T17:00:00+00:00", "2026-10-04T17:00:00+00:00"],
    "context-utc": ["2026-09-30T12:00:00+00:00", "2026-10-02T12:00:00+00:00", "2026-10-04T12:00:00+00:00"],
}
assert scenario in expected_by_scenario
expected = expected_by_scenario[scenario]
report = []
for run in source["runs"]:
    path = root / f"year-{run['width']}.ics"
    raw = path.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    assert digest == run["sha256"]
    events = icalendar.Calendar.from_ical(raw).walk("VEVENT")
    starts = [event.decoded("DTSTART").astimezone(timezone.utc).isoformat() for event in events]
    assert starts == expected
    assert all(
        str(event["SUMMARY"]) == "Call Sam" and "DTEND" not in event and "DURATION" not in event
        for event in events
    )
    report.append({"file": path.name, "sha256": digest, "starts": starts, "status": "passed"})
print(json.dumps(report, indent=2))
