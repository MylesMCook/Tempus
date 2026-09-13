import json, math, collections
from pathlib import Path
p=Path(__file__).resolve().parent
q=lambda a,v: sorted(a)[max(0,math.ceil(len(a)*v)-1)]
stats=lambda a:{'p50':q(a,.5),'p95':q(a,.95),'n':len(a)}
read=lambda n:json.loads((p/n).read_text())
report={}
for label,path,browser in [('beforeNode','before-packed/report.json',False),('afterNode','after-packed/report.json',False),('beforeChrome','browser/report.json',True),('afterChrome','after-browser/report.json',True)]:
 d=read(path);r={}
 for engine in ['tempus','gpu-time']:
  runs=[r for r in d['runs'] if r['engine']==engine]
  r[engine]={'coldMs':stats([v['importThroughFirstMs' if browser else 'readyThroughFirstParseMs'] for v in runs]),'families':{}}
  for size in [1,10,100]:
   values=[t for v in runs for m in v['measurements'] if m['size' if browser else 'batchSize']==size for t in m['samplesMs']]
   r[engine][str(size)]=stats(values)
  r[engine]['throughput']=100000/r[engine]['100']['p50']
  for i,name in enumerate(['point','weekday','overnight range','weekly recurrence']):
   values=[t for v in runs for m in v['measurements'] if m['size' if browser else 'batchSize']==1 for j,t in enumerate(m['samplesMs']) if j%4==i]
   r[engine]['families'][name]=stats(values)
  if not browser:
   r[engine]['postGcGrowthMiB']={key:stats([(v['memoryBytes']['afterMeasuredWork'][key]-v['memoryBytes']['beforeImport'][key])/1048576 for v in runs]) for key in ['rss','heapUsed']}
 report[label]=r
paired=read('paired.json'); report['paired']={}
for lane in paired['runs'][0]['measurements']:
 report['paired'][lane]={}
 for candidate in ['before','after']:
  runs=[r for r in paired['runs'] if r['candidate']==candidate]
  report['paired'][lane][candidate]=stats([t for r in runs for t in r['measurements'][lane]['samplesMs']])
  report['paired'][lane][candidate]['cpuMsPerOperation']=q([sum(r['measurements'][lane]['cpuMicros'].values())/100000 for r in runs],.5)
 report['paired'][lane]['perPairMedianChangePercent']=[100*(q(next(r for r in paired['runs'] if r['candidate']=='after' and r['trial']==i)['measurements'][lane]['samplesMs'],.5)/q(next(r for r in paired['runs'] if r['candidate']=='before' and r['trial']==i)['measurements'][lane]['samplesMs'],.5)-1) for i in range(5)]
report['sampledAllocationBytes']={}
for folder in ['profile','after-profile']:
 report['sampledAllocationBytes'][folder]={}
 for f in (p/folder).glob('*.heapprofile'):
  d=json.loads(f.read_text());todo=[d['head']];size=0
  while todo:
   n=todo.pop();size+=n['selfSize'];todo.extend(n['children'])
  report['sampledAllocationBytes'][folder][f.stem]=size
(p/'summary.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
