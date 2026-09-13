# /// script
# requires-python = ">=3.11"
# dependencies = ["icalendar==7.3.0"]
# ///
"""Read the authored transition fixture without consulting a named system timezone."""
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from importlib.metadata import version
import icalendar

folder = Path(sys.argv[1])
output = folder / "python-readback.json"
if output.exists():
    raise FileExistsError(output)
raw = (folder / "timezone.ics").read_bytes()
original = json.loads((folder / "report.json").read_text())
assert hashlib.sha256(raw).hexdigest() == original["fixtureSha256"]
component = icalendar.Timezone.from_ical(raw)
assert str(component["TZID"]) == "Probe/Seasonal"
zone = component.to_tz(lookup_tzid=False)
rows = []
for case in original["rows"]:
    instant = datetime.fromisoformat(case["instant"])
    local = instant.astimezone(zone)
    observed = local.replace(tzinfo=None).isoformat()
    offset = int(local.utcoffset().total_seconds())
    roundtrip = local.astimezone(timezone.utc)
    rows.append({"instant": case["instant"], "expected": case["expected"], "observed": observed,
                 "offset": offset, "matches": observed == case["expected"] and offset == case["offset"] and roundtrip == instant})
report = {"reader": "icalendar", "version": version("icalendar"), "fixtureSha256": original["fixtureSha256"],
          "lookupTzid": False, "rows": rows, "conforms": all(row["matches"] for row in rows),
          "scope": "Nine authored instants; embedded timezone only. Not a calendar-client import or general conformance test."}
output.write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps({"conforms": report["conforms"], "matches": sum(row["matches"] for row in rows), "total": len(rows)}))
if not report["conforms"]:
    sys.exit(1)
