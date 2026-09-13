# Preserve overlong input before interpretation

The main app no longer uses the input element's `maxLength=200`. It preserves the complete entered text and lets the existing parser reject phrases over 200 characters. Help text states the limit. The SDK, strict API limit, calendar engine and package archive are unchanged.

## Observed failure and repair

Before the change, inserting a 218-character boundary fixture into the built Chrome app retained only 200 characters. The removed suffix was “except on holidays”; the remaining phrase resolved to a date and offered export. The fixture pads a valid reminder to the exact limit to expose truncation deterministically. This is an authored boundary check, not a representative user study.

After the change, Chrome 153, Playwright Firefox 148 and WebKit 26.4 at 320/1280 pixels all retain the complete input. The field is marked invalid, the visible message says the phrase is too long and identifies the 200-character limit, and copy/export controls are absent. Removing only padding leaves the holiday qualifier unsupported; it does not become an accepted event. Explicitly replacing the whole input with a supported reminder restores a usable result. The narrow Chrome screenshot was inspected; no horizontal document overflow was observed in any run.

The durable `examples/app/verify-input-preservation.mjs` uses browser text insertion and keyboard replacement. It does not test native clipboard delivery, physical phones or actual calendar import. Rejecting the unsupported holiday condition is required behavior, not completion of that scheduling request.

## Evidence packaging correction

The first rebuild failed because the preceding snapshot-resource/runtime evidence retained six `.ts`/`.tsx` copies under a directory included by the TypeScript project. Those historical source copies are now `.txt` artifacts; their bytes are unchanged. `evidence-renames.json` records old/new names and content hashes. The earlier evidence checksums were refreshed. No compiler checks were disabled and no source directory was excluded.

This was a mistake in evidence packaging after the earlier successful build, not a parser failure. The failed build log is retained alongside the successful rebuild. Build/types and scoped lint now pass; the source suite remains 995 passes and one existing expected reader failure across 59 files. The bundle-size warning remains.

## Review scope

The preceding source inspection confirmed that calendar helpers reject unresolved interpretations and reconstruct recurring plans rather than accepting caller-provided prepared files. Integrators still own current input/context and explicit external actions; the SDK cannot authenticate a stored JavaScript result against what a user sees. Existing host lifecycle checks and privacy boundaries remain relevant. This milestone does not complete the accumulated security review.

Task-local port 5175 was stopped after verification. No push, publication, deployment, cloud mutation or calendar write occurred. The e70f6d12 SDK runtime/performance evidence retains its identity; physical-device and independent-evaluation gates remain open.
