# Packed browser journeys with WebKit Option-Tab

All six runs pass with Chrome/Firefox using Tab and Shift-Tab, and WebKit explicitly using Option-Tab and Shift-Option-Tab. The current packed SDK and example source are unchanged. All twelve actual downloads pass locked Python readback for exact dates, endpoints, titles and point precision.

The minimal native form provides a control: in WebKit 26.4, Tab alternates between its input and an unfocused document; Option-Tab reaches both native buttons and its link. `native-control.json` retains the sequence. The SDK example behaves the same way. This supports a navigation-mode explanation; it does not prove the value of a specific OS or Safari preference.

[Apple documents distinct Tab and Option-Tab behavior](https://support.apple.com/en-gb/guide/safari/cpsh003/mac), including keyboard-navigation and Safari preferences. No machine preference was read or changed for this probe. No tabindex workaround was added to the application.

The [ordinary-Tab failures](../packed-keyboard/README.md) remain intact and are not reclassified as passes. The runner defaults to ordinary Tab; Option-Tab requires `--webkit-option-tab` and is recorded in the report. [Commands](../../../examples/sdk/README.md#reproduce-the-packed-browser-journeys).

This is headless desktop Playwright WebKit, not Safari.app, iOS, a physical phone or screen-reader testing. It covers the developer integration example, not main-app usability. File validation is not calendar-client import. No calendars, deployment or publication occurred.

Run `shasum -a 256 -c SHA256SUMS` here to check frozen bytes. JSON was formatted before checksums were created.
