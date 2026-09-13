import json,subprocess,hashlib
from pathlib import Path
root=Path('/Users/mylescook/Documents/Codex')
out=root/'2026-09-13-tempus-current-resource-audit'
paths={'before':root/'2026-09-13-tempus-list-review-sdk','after':root/'2026-09-13-tempus-snapshot-sdk'}
runs=[]
for trial in range(5):
 for name in (['before','after'] if trial%2==0 else ['after','before']):
  p=paths[name]
  args=['node','--expose-gc','comparison/performance/profile.mjs',str(p/'node_modules/@tempus-date/core'),str(p/'tempus-date-core-0.1.0.tgz'),str(out),'paired']
  result=json.loads(subprocess.check_output(args,text=True))
  runs.append({'trial':trial,'candidate':name,**result})
assert all(r['outputHashes']==runs[0]['outputHashes'] for r in runs)
report={'runs':runs,'archives':{n:hashlib.sha256((p/'tempus-date-core-0.1.0.tgz').read_bytes()).hexdigest() for n,p in paths.items()},'scope':'Five alternating pairs of fresh Node processes; complete output hashes match. Warm OS cache; authored lanes; not independent device/user evidence.'}
(out/'paired.json').write_text(json.dumps(report,indent=2)+'\n')
print('Five alternating pairs, full output equality passed')
