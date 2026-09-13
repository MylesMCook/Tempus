# Timezone upstream retrieval and rebuild

September 13, 2026. Fresh HTTPS downloads from IANA's official release server match the pinned tzcode2026d and tzdata2026d archive hashes. The retained provenance records URLs and digests. No system timezone data, package or service was changed.

The existing task-local builders rebuilt zic, then all 597 slim zone files in new scratch directories. The compiler hash is `3ba332d915303b1879e8030c982b1c0a62535dfa34da70f9f8894f48e1b0a8e8`, matching the earlier recorded build. All 597 zone bytes match the current bundled payload, which has 344 unique files. The payload SHA-256 remains `d80dfea2b792c207cf64a85bd9be4866f16c6b42f20025f28e6cbe97803f55d6`. License bytes also match; all unique files decode with Python ZoneInfo.

This provides a fresh upstream retrieval → source compiler → compiled zones → bundled bytes chain. It does not establish detached-signature authenticity, an independent review, a hermetic compiler or reproduction on another host/toolchain. TLS retrieval and pinned hashes have distinct trust limits. The generic verifier's retained limitations remain intact; fresh retrieval is additional evidence, not a rewritten claim of independent authentication.

Reproduce using `build-zic.py`, `build-tzif.py` with slim format, then `verify-timezone-data.py`, following [the calendar build commands](../../calendar/README.md). Use fresh scratch directories and the exact pinned source archives. Do not install the compiler or timezone files into the host.

Manifest copies replace local home/scratch paths with placeholders. `provenance.json` records original manifest hashes; the compiler/build hash links refer to original raw manifests in local scratch `2026-09-13-tempus-upstream-provenance`. Redacted copies are review artifacts, not directly reusable build manifests. File hashes, source hashes and numeric results are preserved. No application or SDK bytes changed.
