import json,math,gzip,collections
from pathlib import Path
p=Path(__file__).resolve().parent
read=lambda n:json.loads((p/n).read_text())
def stats(a):
 a=sorted(a)
 return {'p50':a[math.ceil(len(a)*.5)-1],'p95':a[math.ceil(len(a)*.95)-1],'n':len(a)}
result={}
for label,browser in [('packed',False),('browser',True)]:
 d=read(label+'/report.json');result[label]={}
 for engine in ['tempus','gpu-time']:
  runs=[r for r in d['runs'] if r['engine']==engine]
  v={'coldMs':stats([r['importThroughFirstMs' if browser else 'readyThroughFirstParseMs'] for r in runs])}
  for size in [1,10,100]:
   v[str(size)]=stats([t for r in runs for m in r['measurements'] if m['size' if browser else 'batchSize']==size for t in m['samplesMs']])
  v['throughputPerSecond']=100000/v['100']['p50']
  v['families']={}
  for i,name in enumerate(['point','weekday','overnightRange','weeklyRecurrence']):
   v['families'][name]=stats([t for r in runs for m in r['measurements'] if m['size' if browser else 'batchSize']==1 for j,t in enumerate(m['samplesMs']) if j%4==i])
  if not browser:
   v['postGcGrowthMiB']={k:stats([(r['memoryBytes']['afterMeasuredWork'][k]-r['memoryBytes']['beforeImport'][k])/1048576 for r in runs]) for k in ['rss','heapUsed']}
  result[label][engine]=v
runs=read('profile/report.json')['runs']
result['lanes']={name:stats([t for r in runs for t in r['measurements'][name]['samplesMs']]) for name in runs[0]['measurements']}
old=json.loads((p.parent/'snapshot-resources/after-profile/report.json').read_text())
result['unchangedProfileOutputs']=all(r['outputHashes']==old['runs'][0]['outputHashes'] for r in runs)
assert result['unchangedProfileOutputs']
result['profiles']={}
for f in (p/'profile').glob('*.gz'):
 d=json.loads(gzip.decompress(f.read_bytes()))
 if '.heapprofile' in f.name:
  todo=[d['head']];total=0
  while todo:
   n=todo.pop();total+=n['selfSize'];todo.extend(n['children'])
  result['profiles'][f.name]={'sampledAllocationBytes':total}
 else:
  counts=collections.Counter(d.get('samples',[]));nodes={n['id']:n for n in d['nodes']}
  result['profiles'][f.name]={'samples':len(d.get('samples',[])),'topSelfSamples':[{'function':nodes[i]['callFrame']['functionName'],'samples':c} for i,c in counts.most_common(8)]}
(p/'summary.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='profiles'},indent=2))
