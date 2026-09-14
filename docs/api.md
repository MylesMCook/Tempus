# API

Send a phrase to `GET /api/parse`. No API key is needed.

This v2 endpoint accepts date expressions, not full reminder sentences. The browser's sentence recognizer runs locally; **Check API result** sends its highlighted date phrase. The event label is not included in that request.

```sh
curl --get 'https://tempus.funnydomainname.com/api/parse' \
  --data-urlencode 'expression=jan 31 2026 plus 1 month' \
  --data-urlencode 'timezone=America/Chicago' \
  --data-urlencode 'reference=2026-01-26T19:30:00.000Z' \
  --data-urlencode 'format=yyyy-MM-dd HH:mm'
```

This returns February 28, 2026 at midnight in Chicago: `2026-02-28T06:00:00.000Z`.

## Parameters

| Parameter    | Required? | Meaning                                                     |
| ------------ | --------- | ----------------------------------------------------------- |
| `expression` | Yes       | The phrase to calculate; up to 200 characters               |
| `timezone`   | No        | An IANA timezone; defaults to UTC                           |
| `reference`  | No        | An ISO instant with an offset; defaults to the request time |
| `format`     | No        | A date-fns display format; up to 50 characters              |

Pass the same `reference` and `timezone` to reproduce a result. The API uses the same [date rules](date-rules.md) as the browser.

## Response

A successful response includes:

| Field                                   | Contents                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------- |
| `engineVersion`                         | `2`                                                                         |
| `date`, `timestamp`                     | The UTC date and Unix time in milliseconds                                  |
| `formatted`                             | The display date, when `format` was supplied                                |
| `reference`, `timezone`                 | The inputs used for the calculation                                         |
| `anchor`, `steps`, `result`, `warnings` | The starting date, executed changes, result, and any approximation warnings |

Invalid input returns HTTP 400 with the error fields described below. No partial result is returned. Responses use `Cache-Control: no-store`.

### HTTP 400 bodies

The current v2 calculation endpoint returns different error fields by stage:

- Request validation: `{ engineVersion: 2, error, details, requestId }`; `details` contains validation issues.
- Date calculation: `{ engineVersion: 2, error, code, message, hint, span?, requestId }`.
- Display format: `{ engineVersion: 2, error, hint, requestId }`.

Check HTTP status first, then field presence. Only calculation errors have `code`; do not depend on error prose or assume every response has recovery guidance. Other HTTP failures are described below.

## Limits and privacy

The public API allows approximately 120 requests per minute per IP at each Cloudflare location. Shared networks share the allowance; this is not a global quota. Browser calculations do not use it.

| Status | What to do                                                            |
| ------ | --------------------------------------------------------------------- |
| `400`  | Correct the input. Unknown and repeated parameters are also rejected. |
| `405`  | Use GET, or OPTIONS for preflight.                                    |
| `414`  | Shorten the URL to 4,096 characters or fewer.                         |
| `429`  | Wait 60 seconds before retrying.                                      |
| `503`  | The rate limiter is unavailable. Try again shortly.                   |

API inputs appear in the request URL. Worker logs redact query strings, but historical logs and other hosting records may contain URLs. Avoid confidential information. Read the [privacy policy](https://tempus.funnydomainname.com/privacy) for details.

## Moving from v1

Remove `preserveDayOfMonth`; it returns an error in v2. Month changes now use the last valid day at every step.

`settings` and heuristic `meta` were replaced by the calculation inputs and executed steps. Calendar arithmetic uses the requested timezone and written order. Fractional month/year expressions can return labelled approximation warnings. Clients relying on older behavior should check `engineVersion`.
