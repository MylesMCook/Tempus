# SDK contract documentation correction

Current archive: `e2293d2d7279e51e10c50fa31bfd827dfd08dfc738d80294fa6a412d3554fb7c`.

The README incorrectly described all recurrence rules as having weekdays. It now requires checking `value.kind` and `rule.frequency`, describes monthly day/short-month fields separately, and distinguishes complete finite export-plan occurrences from an ongoing rule's upcoming preview. Duplicate shorthand wording was removed. No supported capability or requirement changed.

The package runner passes on Node 26.8.1: 56 installed files match, five examples pass and copied consumers pass strict installed declaration checking. Both TypeScript blocks extracted from the installed README also compile under strict NodeNext/ES2023/DOM settings. `verification.json` retains the package/example hashes; `equivalence.json` records comparison with the preceding installed archive.

Only README.md differs from archive `4ec18030…`; the other 55 files, including code, declarations, manifest and timezone data, are byte-identical. Earlier browser/Worker and Node 22 execution remains evidence for those unchanged bytes. No fresh browser/Worker or Node 22 run is claimed here. Actual imports, physical devices and independent evaluation remain unverified.

Reproduce the package check with `node examples/sdk/verify-package.mjs /absolute/NEW-DIRECTORY`. Use a new scratch directory. To check the README examples, save each installed README TypeScript fence into a separate `.ts` file beside that installation's package.json, then run the documented strict installed-consumer tsc command on those files.

Run `shasum -a 256 -c SHA256SUMS` here to check retained bytes. Reports were formatted before freezing. This archive remains private and local; no package was published or deployed.
