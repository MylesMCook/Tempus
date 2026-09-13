"""Expand synthetic files with a separately built libical; never import calendars."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument("probe", type=Path)
parser.add_argument("build_manifest", type=Path)
parser.add_argument("output", type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
pack = root / "comparison/results/calendar/client-import-pack"
manifest = json.loads((pack / "manifest.json").read_text())
sha = lambda raw: hashlib.sha256(raw).hexdigest()
identity = json.loads(args.build_manifest.read_text())
if identity["version"] != "4.0.5" or identity["sourceArchiveSha256"] != "cc09a3ac41d60e6144e644bd3fcf97d47106d659c4a0b8965102581401e67c9c":
    raise ValueError("Unexpected libical source identity")
if sha(Path(identity["sourceArchive"]).read_bytes()) != identity["sourceArchiveSha256"]:
    raise ValueError("Source archive differs from the build record")
if sha(args.probe.read_bytes()) != identity["probeBinarySha256"] or sha((root / "comparison/calendar/libical-probe.c").read_bytes()) != identity["probeSourceSha256"]:
    raise ValueError("Probe differs from the build record")
for library, expected in identity.get("icuLibraries", {}).items():
    if sha(Path(library).read_bytes()) != expected:
        raise ValueError("Linked ICU library differs from the build record")
args.output.mkdir(parents=True, exist_ok=False)
records = []


def inspect(name, file, expected):
    raw = subprocess.check_output(
        [str(args.probe.resolve()), str(file.resolve()), "20260101T000000Z", "20270101T000000Z"],
        text=True, timeout=10,
    )
    observed = [[datetime.fromtimestamp(t, timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z") for t in row] for row in json.loads(raw)]
    records.append({"id": name, "file": str(file), "sha256": sha(file.read_bytes()), "expected": expected, "observed": observed, "matches": observed == expected})


for entry in manifest["records"]:
    file = pack / entry["file"]
    if sha(file.read_bytes()) != entry["sha256"]:
        raise ValueError("Diagnostic pack changed after its manifest was generated")
    inspect(entry["id"], file, entry["expected"])

# Independently authored UTC endpoints. Four hours and 24 hours are elapsed;
# one calendar day retains the local midnight, including a 23/25-hour day.
source = (pack / "dtend-duration.ics").read_bytes().decode()
for season, first, starts, ends in [
    ("spring", "20260301", ["2026-03-01T06:00:00", "2026-03-08T06:00:00", "2026-03-15T05:00:00"], [
        ["2026-03-01T10:00:00", "2026-03-08T10:00:00", "2026-03-15T09:00:00"],
        ["2026-03-02T06:00:00", "2026-03-09T06:00:00", "2026-03-16T05:00:00"],
        ["2026-03-02T06:00:00", "2026-03-09T05:00:00", "2026-03-16T05:00:00"],
    ]),
    ("autumn", "20261025", ["2026-10-25T05:00:00", "2026-11-01T05:00:00", "2026-11-08T06:00:00"], [
        ["2026-10-25T09:00:00", "2026-11-01T09:00:00", "2026-11-08T10:00:00"],
        ["2026-10-26T05:00:00", "2026-11-02T05:00:00", "2026-11-09T06:00:00"],
        ["2026-10-26T05:00:00", "2026-11-02T06:00:00", "2026-11-09T06:00:00"],
    ]),
]:
    for duration, finish in zip(["PT14400S", "PT86400S", "P1D"], ends):
        name = f"{season}-{duration}"
        text = source.replace("20260301T010000", f"{first}T000000").replace(
            "DTEND;TZID=Tempus/Chicago-control:20260301T030000", f"DURATION:{duration}"
        ).replace("tempus-client-diagnostic-v2-dtend-duration", f"tempus-duration-probe-{name}")
        file = args.output / f"{name}.ics"
        file.write_bytes(text.encode())
        inspect(name, file, [[a + ".000Z", b + ".000Z"] for a, b in zip(starts, finish)])

report = {
    "reader": "libical 4.0.5",
    "buildManifestSha256": sha(args.build_manifest.read_bytes()),
    "build": identity,
    "runnerSha256": sha(Path(__file__).read_bytes()),
    "probeSourceSha256": sha((root / "comparison/calendar/libical-probe.c").read_bytes()),
    "probeBinarySha256": sha(args.probe.read_bytes()),
    "packManifestSha256": sha((pack / "manifest.json").read_bytes()),
    "records": records,
    "limitations": "Finite synthetic Gregorian probes; opaque embedded timezone enforced; no detached exceptions, client import, device or full-range conformance claim",
}
(args.output / "report.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps({"matched": sum(row["matches"] for row in records), "cases": len(records), "failed": [row["id"] for row in records if not row["matches"]]}))
raise SystemExit(1 if any(not row["matches"] for row in records) else 0)
