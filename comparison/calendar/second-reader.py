# /// script
# requires-python = ">=3.11"
# dependencies = ["recurring-ical-events==3.8.2", "icalendar==7.3.0"]
# ///
"""Read generated development files; never import them into a calendar account."""

import argparse
import hashlib
import json
import platform
from zoneinfo import ZoneInfo
from datetime import datetime, timezone, timedelta
from importlib.metadata import version
from pathlib import Path

import icalendar
import recurring_ical_events
from icalendar.timezone import tzp
from icalendar.timezone.zoneinfo import ZONEINFO

parser = argparse.ArgumentParser()
parser.add_argument("--require-rule-conformance", action="store_true")
parser.add_argument("--browser-file", type=Path, help="Optional captured four-range September file")
parser.add_argument("--unbounded-browser-file", type=Path, help="Optional captured Tokyo Monday reminder file")
parser.add_argument("--timezone-candidates", type=Path, help="Generated ongoing timezone fixtures and expected checkpoints")
parser.add_argument("--tzif-build", type=Path, help="Optional verified pinned TZif build for independent source-offset checks")
parser.add_argument("--ongoing-events", type=Path, help="Authored ongoing event probe directory")
parser.add_argument("--override-coverage", type=Path, help="Full-range candidate directory; sample explicit distant windows")
parser.add_argument("--client-import-pack", type=Path, help="Unimported finite client diagnostic pack")
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
results = root / "comparison/results"


def expand(path, start=None, end=None):
    content = path.read_bytes()
    calendar = icalendar.Calendar.from_ical(content)
    events = recurring_ical_events.of(calendar).between(
        start or datetime(2026, 1, 1, tzinfo=timezone.utc),
        end or datetime(2028, 1, 1, tzinfo=timezone.utc),
    )
    def value(event, field):
        decoded = event.decoded(field if field in event else "dtstart")
        if isinstance(decoded, datetime):
            return decoded.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
        return decoded.isoformat()

    rows = [[value(event, field) for field in ("dtstart", "dtend")] for event in events]
    return {
        "file": str(path), "sha256": hashlib.sha256(content).hexdigest(),
        "observed": rows, "titles": [str(event.get("summary", "")) for event in events],
    }


probe = json.loads((results / "calendar/rule-probe.json").read_text())
rule = expand(results / "calendar/dtend-duration.ics")
if rule["sha256"] != probe["fixtureSha256"]:
    raise RuntimeError("Rule fixture changed since the JavaScript probe ran.")
rule["expected"] = probe["expected"]
rule["conforms"] = rule["observed"] == rule["expected"]
journeys = json.loads((results / "journeys.json").read_text())
files = []
for journey in journeys["records"]:
    if journey["status"] != "passed":
        raise RuntimeError(f"Source journey failed: {journey['id']}")
    observed = expand(results / "journey-files" / f"{journey['id']}.ics")
    # Bind this check to the exact bytes validated in the current source replay.
    stage = next(step for step in journey["steps"] if step["action"] == "file-validation")
    observed["expected"] = journey.get("calendarDates", journey["expected"])
    observed["passed"] = (
        observed["sha256"] == stage["fileSha256"]
        and observed["observed"] == observed["expected"]
        and observed["titles"] == [journey.get("event", "call Sam")] * len(observed["expected"])
    )
    files.append(observed)

if args.browser_file:
    observed = expand(args.browser_file.resolve())
    observed["expected"] = [
        [f"2026-09-{day}T14:00:00.000Z", f"2026-09-{day}T22:00:00.000Z"]
        for day in (14, 15, 17, 18)
    ]
    observed["passed"] = (
        observed["observed"] == observed["expected"]
        and observed["titles"] == ["call Sam"] * 4
    )
    observed["scope"] = "Previously captured browser file, not a fresh browser download"
    files.append(observed)

unbounded_files = []
for path in [results / "calendar/unbounded-fixed-tokyo.ics"] + (
    [args.unbounded_browser_file.resolve()] if args.unbounded_browser_file else []
):
    observed = expand(
        path, datetime(2026, 9, 12, tzinfo=timezone.utc),
        datetime(2026, 10, 5, tzinfo=timezone.utc),
    )
    events = icalendar.Calendar.from_ical(path.read_bytes()).walk("VEVENT")
    rules = events[0].get("RRULE", {}) if len(events) == 1 else {}
    observed["expected"] = [
        [f"{day}T15:30:00.000Z", f"{day}T16:00:00.000Z"]
        for day in ("2026-09-13", "2026-09-27", "2026-10-04")
    ]
    observed["ongoingWeeklyRule"] = (
        len(events) == 1 and rules.get("FREQ") == ["WEEKLY"]
        and rules.get("BYDAY") == ["SU"] and "UNTIL" not in rules and "COUNT" not in rules
    )
    # A distant query detects a preview-sized finite replacement independently
    # of the near-term exception check. It does not prove infinite expansion.
    distant = expand(
        path, datetime(2048, 1, 1, tzinfo=timezone.utc),
        datetime(2048, 1, 6, tzinfo=timezone.utc),
    )
    observed["distantObserved"] = distant["observed"]
    observed["distantExpected"] = [["2048-01-05T15:30:00.000Z", "2048-01-05T16:00:00.000Z"]]
    observed["passed"] = (
        observed["ongoingWeeklyRule"] and observed["observed"] == observed["expected"]
        and observed["titles"] == ["call Sam"] * 3
        and distant["observed"] == observed["distantExpected"]
        and distant["titles"] == ["call Sam"]
    )
    unbounded_files.append(observed)

timezone_files = []
tzif_manifest = None
if args.tzif_build:
    tzif_manifest = json.loads((args.tzif_build / "build-manifest.json").read_text())
    if tzif_manifest["archiveSha256"] != "0cb2aa8e333c3dc049badc42a0c61f21987b8cd44e107fa900bad764aacc7767" or tzif_manifest["exitCode"] != 0:
        raise RuntimeError("Unexpected pinned timezone build.")
if args.timezone_candidates:
    manifests = sorted(args.timezone_candidates.glob("*.json"))
    if not manifests:
        raise RuntimeError("No timezone candidate manifests found.")
    for manifest in manifests:
        expected = json.loads(manifest.read_text())
        content = manifest.with_suffix(".ics").read_bytes()
        if hashlib.sha256(content).hexdigest() != expected["sha256"]:
            raise RuntimeError(f"Timezone fixture hash mismatch: {manifest.name}")
        # Disabling TZID lookup is essential: this must read our serialized
        # definition, not substitute the machine's installed IANA zone.
        zone = icalendar.Timezone.from_ical(content).to_tz(lookup_tzid=False)
        source_zone = None
        if tzif_manifest:
            source_file = args.tzif_build / "compiled" / expected["timezone"]
            if hashlib.sha256(source_file.read_bytes()).hexdigest() != tzif_manifest["files"][expected["timezone"]]:
                raise RuntimeError("Pinned TZif hash mismatch.")
            with source_file.open("rb") as source:
                source_zone = ZoneInfo.from_file(source, key=expected["timezone"])
        failures = []
        source_failures = []
        for checkpoint in expected["checkpoints"]:
            instant = datetime.fromisoformat(checkpoint["instant"].replace("Z", "+00:00"))
            local = instant.astimezone(zone)
            observed = {"civil": local.replace(tzinfo=None).isoformat(timespec="seconds"), "offset": local.utcoffset().total_seconds()}
            if observed["civil"] != checkpoint["civil"] or observed["offset"] != checkpoint["offset"]:
                wall = datetime.fromisoformat(checkpoint["civil"])
                candidates = sorted({wall.replace(tzinfo=zone, fold=fold).astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z") for fold in (0, 1)})
                failures.append({"expected": checkpoint, "observed": observed,
                                 "localToUtcCandidates": candidates,
                                 "roundTripInstant": local.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")})
            if source_zone:
                source_local = instant.astimezone(source_zone)
                source_observed = {"civil": source_local.replace(tzinfo=None).isoformat(timespec="seconds"), "offset": source_local.utcoffset().total_seconds()}
                if source_observed["civil"] != checkpoint["civil"] or source_observed["offset"] != checkpoint["offset"]:
                    source_failures.append({"expected": checkpoint, "observed": source_observed})
        timezone_files.append({"timezone": expected["timezone"], "sha256": expected["sha256"],
                               "checkpoints": len(expected["checkpoints"]), "failures": failures,
                               "sourceChecked": source_zone is not None, "sourceFailures": source_failures,
                               "passed": not failures and not source_failures})

class EmbeddedZones(ZONEINFO):
    def knows_timezone_id(self, tzid):
        return tzid == "UTC"

    def timezone(self, name):
        return self.utc if name == "UTC" else None

event_files = []
if args.ongoing_events:
    event_report = json.loads((args.ongoing_events / "report.json").read_text())
    for entry in event_report["records"]:
        path = args.ongoing_events / f"{entry['id']}.ics"
        if hashlib.sha256(path.read_bytes()).hexdigest() != entry["fileSha256"]:
            raise RuntimeError("Ongoing event fixture hash mismatch.")
        # Fresh cache per file. Keep original bytes, but disallow substitution
        # of a system zone for the supplied embedded definition.
        tzp.use(EmbeddedZones())
        try:
            first = datetime.fromisoformat(entry["expected"][0][0].replace("Z", "+00:00"))
            last = datetime.fromisoformat(entry["expected"][-1][1].replace("Z", "+00:00"))
            observed = expand(path, first, last + timedelta(seconds=1))
        finally:
            tzp.use_default()
        observed["id"] = entry["id"]
        observed["expected"] = entry["expected"]
        observed["passed"] = observed["observed"] == entry["expected"] and observed["titles"] == ["call Sam"] * len(entry["expected"])
        event_files.append(observed)

coverage = []
if args.override_coverage:
    import time
    started = time.perf_counter()
    path = args.override_coverage / "chicago.ics"
    manifest = json.loads((args.override_coverage / "report.json").read_text())
    content = path.read_bytes()
    if hashlib.sha256(content).hexdigest() != manifest["fileSha256"]:
        raise RuntimeError("Coverage file hash mismatch.")
    tzp.use(EmbeddedZones())
    try:
        calendar = icalendar.Calendar.from_ical(content)
        query = recurring_ical_events.of(calendar)
        for year in (2026, 2037, 2100, 2400, 9999):
            for month in (3, 11):
                start = datetime(year, month, 1, tzinfo=timezone.utc)
                end = datetime(year, month, 25, tzinfo=timezone.utc)
                expected = []
                day = start
                march = 1 + (6-datetime(year,3,1).weekday()) % 7 + 7
                november = 1 + (6-datetime(year,11,1).weekday()) % 7
                while day < end:
                    if day.weekday() == 6 and day.date().isoformat() not in manifest["context"]["exceptions"]:
                        daylight = (3, march) < (day.month, day.day) <= (11, november)
                        instant = day + timedelta(hours=5 if daylight else 6)
                        expected.append([value.isoformat(timespec="milliseconds").replace("+00:00", "Z") for value in (instant, instant+timedelta(hours=4))])
                    day += timedelta(days=1)
                try:
                    events = query.between(start, end)
                    observed = [[event.decoded(field).astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z") for field in ("dtstart", "dtend")] for event in events]
                    coverage.append({"year":year,"month":month,"expected":expected,"observed":observed,"passed":observed==expected})
                except Exception as error:
                    coverage.append({"year":year,"month":month,"expected":expected,"error":str(error),"passed":False})
    finally:
        tzp.use_default()
    (args.override_coverage / "python-reader.json").write_text(json.dumps({"scope":"Ten sampled windows in actual full-range candidate; not every occurrence or calendar-client import","fileSha256":manifest["fileSha256"],"elapsedSeconds":time.perf_counter()-started,"windows":coverage},indent=2)+"\n")


client_files = []
if args.client_import_pack:
    manifest = json.loads((args.client_import_pack / "manifest.json").read_text())
    try:
        tzp.use(EmbeddedZones())
        for case in manifest["records"]:
            observed = expand(args.client_import_pack / case["file"])
            if observed["sha256"] != case["sha256"]:
                raise RuntimeError("Client diagnostic file changed after manifest generation")
            observed.update({"id":case["id"],"expected":case["expected"],"passed":observed["observed"]==case["expected"],"clientImport":"not-run"})
            client_files.append(observed)
    finally:
        tzp.use_default()
    (args.client_import_pack / "python-reader.json").write_text(json.dumps({"python":platform.python_version(),"readerVersions":{name:version(name) for name in ("icalendar","recurring-ical-events")},"scriptSha256":hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),"scope":"File-reader behavior only; no actual client import","records":client_files},indent=2)+"\n")

report = {
    "python": platform.python_version(),
    "versions": {name: version(name) for name in (
        "recurring-ical-events", "icalendar", "python-dateutil", "tzdata", "x-wr-timezone"
    )},
    "scriptSha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
    "lockSha256": hashlib.sha256(Path(__file__).with_suffix(".py.lock").read_bytes()).hexdigest(),
    "expansionWindow": "2026-01-01 through 2028-01-01 UTC",
    "ruleProbe": rule, "boundedFiles": files, "unboundedFiles": unbounded_files,
    "timezoneCandidates": timezone_files,
    "ongoingEventCandidates": event_files,
    "overrideCoverage": coverage,
    "clientImportDiagnostics": client_files,
    "timezoneSourceBuild": {
        "revision": tzif_manifest["revision"],
        "archiveSha256": tzif_manifest["archiveSha256"],
        "manifestSha256": hashlib.sha256((args.tzif_build / "build-manifest.json").read_bytes()).hexdigest(),
    } if tzif_manifest else None,
    "unboundedExpansionWindows": ["2026-09-12 through 2026-10-05 UTC", "2048-01-01 through 2048-01-06 UTC"],
    "limitations": [
        "Two implementations agreeing is not proof of RFC conformance; the DTEND probe records a known disagreement with the standard.",
        "Scripted development files and pinned libraries; not a calendar-client import, user study or general conformance suite.",
        "This bounded query covers these fixtures only; it must not validate arbitrary unbounded files or schedules outside its window.",
    ],
}
(results / "calendar/second-reader.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps({"ruleConforms": rule["conforms"], "boundedFilesPassed": sum(row["passed"] for row in files), "boundedFiles": len(files), "unboundedFilesPassed": sum(row["passed"] for row in unbounded_files), "unboundedFiles": len(unbounded_files), "timezoneFilesPassed": sum(row["passed"] for row in timezone_files), "timezoneFiles": len(timezone_files)}))
print(json.dumps({"ongoingEvents": [{"id": row["id"], "passed": row["passed"]} for row in event_files]}))
if not all(row["passed"] for row in files + unbounded_files + timezone_files + event_files + coverage + client_files) or (args.require_rule_conformance and not rule["conforms"]):
    raise SystemExit(1)
