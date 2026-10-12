---
title: Jurisdictions
description: Which legal areas Inverse knows, how well, and how to use them.
---

From 2.0 every declaration carries the legal area it was taken under (`record.jurisdiction`) and the date the legal status of that area was last checked (`record.legalCheckedOn`). Both are part of the stored record, so an evidence sheet shows which state of the rules the texts followed on the day of receipt.

```ts
import { createInverseHandler } from "@sweberdev/inverse";

export const POST = createInverseHandler({
  company: { name: "Acme SA" },
  jurisdiction: "fr", // default language: fr
  onDeclaration,
  sendReceipt,
});
```

A shop that sells in several countries lets the form pick, from a list you allow:

```ts
createInverseHandler({ jurisdiction: "de", jurisdictions: ["at", "fr"], /* ... */ });
```

```html
<div data-inverse-form="withdrawal" data-endpoint="/api/inverse" data-jurisdiction="at"></div>
```

A request that names an area outside `jurisdictions` is not refused; the handler uses its own `jurisdiction`. The area is never taken from a request unless you allow it.

## What Inverse knows

| Id | Country | How well | Withdrawal function | Cancellation button |
|---|---|---|---|---|
| `de` | Germany | national provision checked | § 356a BGB, since 2026-06-19 | § 312k BGB |
| `at` | Austria | national provision checked | Directive 2023/2673, implemented in the FAGG, since 2026-10-01 | no statement |
| `ch` | Switzerland | note only | no EU duty; no statement on Swiss law | no statement |
| `fr` | France | **directive only** | Article 11a of the directive | no statement |
| `it` | Italy | **directive only** | Article 11a of the directive | no statement |
| `es` | Spain | **directive only** | Article 11a of the directive | no statement |
| `nl` | Netherlands | **directive only** | Article 11a of the directive | no statement |
| `pl` | Poland | **directive only** | Article 11a of the directive | no statement |

"Directive only" means: the labels, the two-step flow and the receipt follow Article 11a of Directive (EU) 2023/2673, which every member state had to implement. Inverse did **not** read the French, Italian, Spanish, Dutch or Polish implementing act, and the translations have not been reviewed by a lawyer or a native speaker for these countries. Each entry in `jurisdictions` carries a `note` that says where to look. Until a lawyer has confirmed a country, treat it as a starting point, not as a confirmed fit.

Inverse states a cancellation button duty only for Germany. Offering the button elsewhere is your decision.

## Legal status per area

```sh
npx inverse legal --jurisdiction fr
npx inverse legal --jurisdiction de --since 2026-10-01   # exit 1 if something is newer
```

`--since` makes a CI or cron job notice that the library has a newer legal status than the one your deployment was last reviewed against. See [legal status](/inverse/docs/reference/legal-status).
