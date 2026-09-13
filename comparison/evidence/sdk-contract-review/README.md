# SDK contract documentation review

The packed README had contradicted the implementation: it described date-only/mixed ranges as unsupported and counted recurrence as an unpacked source addition. It also mixed API instructions with historical release notes and exposed internal choice-ID formats as integration guidance.

The revised package README leads with a runnable parse example, then covers discriminated results, explicit clarification, stale-state ownership, supported families, resource limits and calendar preparation. Choice IDs are opaque; display wording is not a machine contract. It distinguishes local file preparation from download/import and recorded runtime coverage from general compatibility. Public package naming and compatibility guarantees remain unfinished.

All three TypeScript snippets compile against installed declarations and execute on Node 26.8.1. The calendar snippet creates only local file text with fixed demonstration metadata; no calendar-client import was performed. Snippet files and output are retained here. The clarification snippet defines an event handler; its execution alone does not exercise a real user's choice. Existing source and packed integration tests cover that flow separately.

Archive `f2adf85cae83f54bb9dd01b4154cefa890fb851c1471c08109567b2f5aa8b701` passes the Node 26 package verifier: six examples, installed types and all 56 installed files matched. Comparison against runtime-tested archive `e33ab0ca30d3670a2bd47928bc403872a5ca4c9c92408923461c9a94afe1fe53` finds **only README.md changed**. JavaScript, declarations, manifest, dependency declarations, data and licenses are byte-identical. Node 22, browser, Worker and performance reports retain their e33ab0ca identity; they were not rerun for a documentation-only revision. This parity is explicit evidence reuse, not a newly observed runtime run.

`parity.json` records archive and README identity. `verification.json` redacts the home path; its original hash is retained. `previous-README.md` preserves the former text. No implementation or API signature changed; no package was published.

Remaining contract gates: public name/version ownership, an approved compatibility/migration policy, independent consumer feedback, supported-device validation and accumulated security review. This documentation cleanup does not close those gates or establish comparative usability. The next useful review is a developer trying the candidate without implementation-author guidance, alongside the independent task pilot.
