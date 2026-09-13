# Packed SDK keyboard traversal: incomplete

The stronger browser runner uses Tab, Shift-Tab and Enter to reach and activate controls. Input is replaced through keyboard selection and text insertion; it does not call locator.focus() or fill(). The app's own result-focus behavior remains active.

**Four of six runs pass.** Chrome and Firefox complete the weekly correction/download/restart and date-list correction/download/edit journeys at 320 and 1280 pixels. WebKit fails at both widths: Tab alternates between the input and an unfocused document without reaching the native clarification buttons within twenty presses. The report retains every observed focus state. Browser or OS keyboard preferences may explain the difference, but that cause has not been verified. No preference override or application change was made to obtain a pass.

`forward-only-failure.json` preserves the earlier failed attempt: Firefox remained on Download during twenty forward Tab presses after downloading. Using Shift-Tab to return to earlier controls passes in the final runner. The earlier failure is not erased or counted as a passing forward-wrap test.

`report.json` is the final six-run report, with failures marked explicitly and exit status 1. Eight files from the four completed runs are retained; this milestone does not claim fresh independent readback of those files. The strict all-browser reader correctly refuses the incomplete report. The previous [direct-focus runs and file validation](../packed-browser/README.md) remain historical evidence with their original scope.

[Run the current check](../../../examples/sdk/README.md#reproduce-the-packed-browser-journeys). Archive `4ec18030…` and SDK/example bytes are unchanged; only the runner is stricter. These are developer-example checks, not physical devices, screen readers, main-app usability or calendar-client imports. Investigate WebKit keyboard configuration and compare with actual Safari before closing keyboard readiness.

Run `shasum -a 256 -c SHA256SUMS` here to verify the retained bytes. JSON was formatted before freezing. No publishing or calendar writes occurred.
