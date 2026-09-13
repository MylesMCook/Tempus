"""Development oracle for the TZif investigation; never reads system zone data."""
import datetime as dt
import hashlib
import json
from pathlib import Path
import struct
import sys
from zoneinfo import ZoneInfo

if len(sys.argv) not in (2, 3):
    raise SystemExit('Usage: tzif-oracle.py compiled-build-directory [previous-oracle-clocks.jsonl]')
base = Path(sys.argv[1]).resolve()
manifest = json.loads((base / 'build-manifest.json').read_text())
additional_clocks = {}
clock_source_hash = None
if len(sys.argv) == 3:
    clock_bytes = Path(sys.argv[2]).read_bytes()
    clock_source_hash = hashlib.sha256(clock_bytes).hexdigest()
    for line in clock_bytes.decode().splitlines():
        row = json.loads(line)
        if row['zone'] not in manifest['files']:
            raise SystemExit('Previous clock references an unavailable zone.')
        # Preserve prior inputs, but independently resolve expectations against the new data.
        wall = dt.datetime.fromisoformat(row['wall'].removesuffix('Z'))
        if wall.tzinfo is not None:
            raise SystemExit('Expected a civil clock without an offset.')
        additional_clocks.setdefault(row['zone'], set()).add(wall)
compiled = base / 'compiled'
selected = {'America/Chicago', 'Australia/Lord_Howe', 'Pacific/Apia', 'Asia/Kathmandu',
            'Africa/Casablanca', 'Asia/Gaza', 'Europe/Dublin', 'America/Yellowknife'}
utc = dt.timezone.utc
epoch = dt.datetime(1970, 1, 1, tzinfo=utc)
count = 0
zones = []
output = base / 'tzif-boundary-oracle.jsonl'

def header(data, pos, width):
    ut, standard, leaps, times, types, chars = struct.unpack_from('>6I', data, pos + 20)
    return pos + 44, pos + 44 + times * (width + 1) + types * 6 + chars + leaps * (width + 4) + ut + standard, times, types

with output.open('w') as out:
    for path in sorted(compiled.rglob('*')):
        if not path.is_file():
            continue
        data = path.read_bytes()
        if data[:4] != b'TZif':
            continue
        name = path.relative_to(compiled).as_posix()
        if hashlib.sha256(data).hexdigest() != manifest['files'].get(name):
            raise SystemExit('Compiled file differs from manifest: ' + name)
        with path.open('rb') as handle:
            zone = ZoneInfo.from_file(handle, key=name)
        # Full-zone seasonal samples, including before common history and after stored transitions.
        walls = {dt.datetime(year, month, 15, 12) for year in (1, 1900, 1996, 1999, 2010, 2026, 2100, 2400, 9999)
                 for month in (1, 4, 7, 10, 12)}
        walls.update(additional_clocks.get(name, ()))
        if name in selected:
            _, end, _, _ = header(data, 0, 4)
            at, _, times, types = header(data, end, 8)
            transitions = struct.unpack_from(f'>{times}q', data, at)
            indices = data[at + times * 8:at + times * 9]
            offsets = [struct.unpack_from('>i', data, at + times * 9 + i * 6)[0] for i in range(types)]
            for i, instant in enumerate(transitions):
                if not -2208988800 <= instant <= 4133980800:  # 1900 through 2100
                    continue
                for offset in (offsets[indices[i - 1] if i else 0], offsets[indices[i]]):
                    for delta in (-1, 0, 1):
                        walls.add((epoch + dt.timedelta(seconds=instant + offset + delta)).replace(tzinfo=None))
        for wall in sorted(walls):
            values = set()
            for fold in (0, 1):
                instant = wall.replace(tzinfo=zone, fold=fold).astimezone(utc)
                if instant.astimezone(zone).replace(tzinfo=None) == wall:
                    values.add(instant.isoformat(timespec='milliseconds').replace('+00:00', 'Z'))
            out.write(json.dumps({'zone': name, 'wall': wall.isoformat(timespec='seconds') + 'Z', 'expected': sorted(values)}) + '\n')
            count += 1
        zones.append({'name': name, 'sha256': hashlib.sha256(data).hexdigest(), 'cases': len(walls)})
if {row['name'] for row in zones} != set(manifest['files']):
    raise SystemExit('Compiled zone inventory differs from build manifest.')
report = {'cases': count, 'zones': zones, 'oracleSha256': hashlib.sha256(output.read_bytes()).hexdigest(),
          'buildManifestSha256': hashlib.sha256((base / 'build-manifest.json').read_bytes()).hexdigest(),
          'additionalClockSourceSha256': clock_source_hash,
          'limits': 'Inspected development samples and selected-zone boundaries, not independent evaluation or calendar import.'}
(base / 'tzif-oracle-manifest.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'cases': count, 'zones': len(zones), 'oracleSha256': report['oracleSha256']}))
