---
title: Handler
description: Options of createInverseHandler and handleDeclaration.
---

```ts
import { createInverseHandler, type HandlerOptions } from "@sweberdev/inverse";
```

| Option | Type | |
|---|---|---|
| `company` | `{ name, address?, email?, website? }` | shown in receipt and copy |
| `onDeclaration` | `(record) => void \| Promise<void>` | store the declaration; if it throws, the consumer sees an error and can retry |
| `sendReceipt` | `(receipt, record) => void \| Promise<void>` | send the e-mail; errors go to `onError`, the consumer still gets the copy |
| `kinds` | `("withdrawal" \| "cancellation")[]` | default both |
| `locale` | `"de" \| "en" \| "fr" \| "it" \| "nl" \| "es" \| "pl"` | fallback if the request sends none |
| `timeZone` | IANA zone | dates in receipts, default `Europe/Berlin` |
| `resolveEndDate` | `(record) => string \| undefined` | cancellation: end date for the receipt |
| `onError` | `(error, record?) => void` | default `console.error` |
| `dedupe` | `{ windowMs? }` | answer an identical declaration sent again within the window (default 10 minutes) with the first result instead of storing and mailing it twice; off by default |
| `cors` | `{ origin, maxAge? }` | allow the forms to post from other origins and answer the preflight request; off by default |
| `rateLimit` | `{ max, windowMs?, key? }` | limit requests per client, answers 429 with `retry-after`; off by default |

## Duplicates

People click twice, reload the confirmation page or retry on a slow connection. With `dedupe` the handler answers an identical declaration (same kind, same data, e-mail compared case-insensitively) with the first result, so you store one record and send one receipt:

```ts
createInverseHandler({ ...options, dedupe: { windowMs: 10 * 60_000 } });
```

Like the rate limit it lives in memory per server instance. If you run several instances, also check for duplicates in `onDeclaration`, for example with a unique index on e-mail, contract and day.

## Rate limit

```ts
createInverseHandler({ ...options, rateLimit: { max: 5, windowMs: 10 * 60_000 } });
```

The counter lives in memory per server instance and uses the first `x-forwarded-for` address as key (then `x-real-ip`). On serverless platforms each instance counts on its own, so treat it as protection against scripts, not as an exact quota. Pass `key` to count by something else, for example a session ID. Keep `max` generous: a consumer who tries twice must never be blocked from withdrawing.

## Order of operations

1. Reject other methods (`405`) and unknown kinds (`400`).
2. Honeypot filled: answer with success, store nothing.
3. Validate (`422` with field errors).
4. Create the record with a random reference and `receivedAt` from the server clock.
5. `resolveEndDate`, then `onDeclaration`. Failure: `500`.
6. Render and send the receipt. Failure is logged, not shown: the declaration is received either way.
7. Return the reference, time and a text copy.

Rate limiting is up to your platform (Vercel firewall, Cloudflare, middleware). Don't add a captcha that can block real consumers; the honeypot catches simple bots.

## Record

```ts
interface DeclarationRecord {
  id: string;            // "W-7K3QX9PD" or "K-…"
  kind: "withdrawal" | "cancellation";
  receivedAt: string;    // ISO 8601, server time
  locale: "de" | "en" | "fr" | "it" | "nl" | "es" | "pl";
  data: WithdrawalInput | CancellationInput;
  endsAt?: string;       // cancellation, YYYY-MM-DD
}
```
