# Portable main-app reminder journey

September 13, 2026. The [repository runner and instructions](../../../examples/app/README.md) replace scratch-only reproduction for the missing item-year reminder. Chrome 153.0.8010.36 passes at 320/1280 px: input → year → shared time → complete two-event download → edit invalidation. The locked Python reader verifies both saved files against report hashes, exact December 31/January 1 noon CST starts, title and absence of invented endpoints/durations.

The report retains local TypeScript and runner hashes. The loopback server's listening process was checked: its working directory was this checkout. Browser screenshots are desktop evidence; no physical device, screen reader, full Tab traversal or actual calendar-client import is claimed. The 320 px screenshot is retained. SDK bytes and application behavior did not change.

Two isolated negative controls rejected an existing output directory without changing its report and a copied file with appended bytes. Controls were run before the final comparator/stdout cleanup; their scope is recorded in provenance.json. The final runner passed formatting/lint/type checks without warnings and both browser paths were rerun with independent readback. Earlier successful runs remain in scratch, not overwritten.

This closes one main-app evidence portability gap. It does not close ongoing recurrence, independent evaluation, device or import gates. No package publication, deployment or calendar write occurred.
