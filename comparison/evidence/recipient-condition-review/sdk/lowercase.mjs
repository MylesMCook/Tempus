import assert from 'node:assert/strict';
import {parse,appendSelection} from '@tempus-date/core';
import {prepareCalendarFile} from '@tempus-date/core/calendar';
const context={timezone:'America/Chicago',reference:'2026-09-12T16:00:00Z'};
const input='Buy apples for mom on 11/01/2026 at 1:30am for 30 minutes';
const metadata={uid:'11111111-2222-4333-8444-555555555555',stamp:context.reference,title:'Buy apples for mom'};
let selection;
for(const id of ['event:title','2026-11-01','interval:start:2026-11-01T07:30:00Z']) {
 const r=parse(input,{...context,selection});assert.equal(r.status,'needs-clarification');
 assert.ok(r.clarification.choices.some(c=>c.id===id));assert.equal(prepareCalendarFile(r,metadata).ok,false);
 selection=appendSelection(selection,{contextKey:r.clarification.contextKey,id});
}
const r=parse(input,{...context,selection});assert.equal(r.status,'resolved');
assert.equal(r.event.text,metadata.title);assert.equal(input.slice(r.event.span.start,r.event.span.end),metadata.title);
assert.equal(input.slice(r.source.span.start,r.source.span.end),r.source.text);
assert.equal(r.value.start.result.iso,'2026-11-01T07:30:00.000Z');assert.equal(r.value.end.result.iso,'2026-11-01T08:00:00.000Z');
const file=prepareCalendarFile(r,metadata);assert.equal(file.ok,true);assert.match(file.text,/DTSTART:20261101T073000Z/);assert.match(file.text,/DTEND:20261101T080000Z/);
const edited=input.replace('mom','dad');assert.deepEqual(parse(edited,{...context,selection}),parse(edited,context));
assert.equal(prepareCalendarFile(parse(edited,{...context,selection}),metadata).ok,false);
console.log(JSON.stringify({status:'passed',node:process.version,input,file,editInvalidation:true}));
