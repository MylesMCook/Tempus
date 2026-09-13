import argparse, json, subprocess, hashlib, gzip
from pathlib import Path
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
parser = argparse.ArgumentParser(description="Independent 400-year check of the authored four-hour weekly candidate")
parser.add_argument("probe", type=Path)
parser.add_argument("build_manifest", type=Path)
parser.add_argument("candidate", type=Path)
parser.add_argument("zone_file", type=Path)
parser.add_argument("output", type=Path)
args = parser.parse_args()
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
identity=json.loads(args.build_manifest.read_text())
if sha(args.probe) != identity["probeBinarySha256"]:
    raise ValueError("Reader binary differs from its build record")
for library, expected in identity.get("icuLibraries", {}).items():
    if sha(Path(library)) != expected:
        raise ValueError("Linked ICU library differs from its build record")
manifest=json.loads((args.candidate/"manifest.json").read_text())
file=args.candidate/"candidate.ics"
if sha(file) != manifest["fileSha256"] or manifest["durationSeconds"] != 14400:
    raise ValueError("Unexpected candidate identity")
base=args.output
base.mkdir(parents=True,exist_ok=False)
zone_file=args.zone_file
with zone_file.open('rb') as stream: zone=ZoneInfo.from_file(stream)
reports=[];raw=[]
for year in range(2026,2426,12):
    start=datetime(year,3,1,tzinfo=timezone.utc);end=datetime(min(year+12,2426),3,1,tzinfo=timezone.utc)
    expected=[];day=start.date()
    while day<end.date():
        if day.weekday()==6 and day.isoformat()!='2026-11-08':
            instant=datetime(day.year,day.month,day.day,tzinfo=zone).astimezone(timezone.utc)
            expected.append([instant.isoformat(timespec='milliseconds').replace('+00:00','Z'),(instant+timedelta(hours=4)).isoformat(timespec='milliseconds').replace('+00:00','Z')])
        day+=timedelta(days=1)
    data=subprocess.check_output([str(args.probe.resolve()),str(file),start.strftime('%Y%m%dT%H%M%SZ'),end.strftime('%Y%m%dT%H%M%SZ')],text=True,timeout=10)
    observed=[[datetime.fromtimestamp(t,timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z') for t in row] for row in json.loads(data)]
    matches=observed==expected
    reports.append({'from':start.isoformat(),'throughExclusive':end.isoformat(),'expectedCount':len(expected),'observedCount':len(observed),'matches':matches})
    raw.append({'from':start.isoformat(),'expected':expected,'observed':observed})
with gzip.open(base/'cycle-rows.json.gz','wt') as output: json.dump(raw,output)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
report={'candidateSha256':sha(file),'buildManifestSha256':sha(args.build_manifest),'oracleTzifSha256':sha(zone_file),'runnerSha256':sha(Path(__file__)),'rowsSha256':sha(base/'cycle-rows.json.gz'),'records':reports,'scope':'All occurrences in one 400-year Gregorian cycle for one weekly four-hour Chicago rule and one exclusion; not other rules, years after 2426, client import or independent intent evaluation'}
(base/'cycle.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'windows':len(reports),'matched':sum(r['matches'] for r in reports),'occurrences':sum(r['expectedCount'] for r in reports)}));raise SystemExit(1 if any(not r['matches'] for r in reports) else 0)
