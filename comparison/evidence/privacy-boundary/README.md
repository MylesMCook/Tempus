# Local browser privacy boundary

The privacy page now explains clipboard copying and calendar-file preparation: copied values can contain event titles; downloaded files contain reviewed dates/title/timezone information; Tempus does not upload the file or write a calendar account. Importing or sharing a file is a separate user action.

A scoped source review covered page input state, stored settings, API replay, privacy copy and local header/Worker configuration. In fresh desktop Chrome contexts at 320 and 1280, the quantified-list reminder completed title/date/DST clarification and enabled calendar download. No request occurred between completed initial loading and finished file preparation. Storage contained only parserSettings with the four documented preferences, session storage was empty, and no cookies were present. Reload cleared the phrase. The new privacy section rendered without overflow at both widths.

A separate explicit replay against the existing local development Worker sent one /api/parse request only after the button action. Its expression was “2026-11-01 at noon”, with timezone, reference and format; the example reminder title “Call PrivacyProbe” was absent. The response was HTTP 200 / engine v2. This verifies that inspected reminder's interpreted-expression path, not all possible requests.

Build/types and scoped lint pass. No SDK, parser, API contract or Cloudflare configuration changed. No download or calendar import was performed in these probes; earlier file and clipboard evidence remains separately scoped. The ad hoc probes and results are retained with source hashes.

This is not a complete security scan, deployed-policy verification, hosting-log inspection, OS clipboard-permission test or physical-device result. Query URLs can still be recorded by hosting infrastructure; the privacy page retains that warning. Existing local configuration requests query-string redaction, but this turn does not verify live Cloudflare state or old logs. Independent evaluation and actual calendar imports remain open.

All actions were local. No private clipboard contents were read, no calendar was written, and nothing was pushed, published or deployed.
