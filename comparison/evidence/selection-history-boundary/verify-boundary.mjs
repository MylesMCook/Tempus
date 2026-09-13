import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const sdk=await import(pathToFileURL(process.argv[2]).href);
const context={timezone:'America/Chicago',reference:'2026-09-12T16:00:00Z'};
const invalid={...context,selection:{contextKey:'unused',id:'unused',previous:Array(1)}};
for(const call of [()=>sdk.parse('today',invalid),()=>sdk.parseMany(['today'],invalid),()=>sdk.parseMany([],invalid),()=>sdk.createParser(invalid)])assert.throws(call,TypeError);
const input='Call Sam 11/01/2026 at 1:30am';let result=sdk.parse(input,context);let selection;
while(result.status==='needs-clarification' && result.clarification){
 const choice=result.clarification.choices.find(c=>c.id==='2026-11-01'||c.id==='2026-11-01T07:30:00Z');assert.ok(choice);
 selection=sdk.appendSelection(selection,{contextKey:result.clarification.contextKey,id:choice.id});result=sdk.parse(input,{...context,selection});
}
assert.equal(result.status,'resolved');assert.equal(result.value.calculation.result.iso,'2026-11-01T07:30:00.000Z');
assert.deepEqual(sdk.createParser({...context,selection}).parse(input),result);
assert.deepEqual(sdk.parseMany([input],{...context,selection}),[result]);
console.log(JSON.stringify({status:'passed',node:process.version,checks:'four malformed-history entry calls reject immediately; valid multi-answer reminder agrees across single, batch and reusable APIs'}));
