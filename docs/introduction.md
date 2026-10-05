---
title: Introduction
description: What Inverse is and which legal requirements it covers.
---

Inverse adds the two consumer-law buttons German online businesses need to their own app or site:

- the **withdrawal button** ("Vertrag widerrufen", § 356a BGB), required since 19 June 2026 for contracts concluded online in the EU, and
- the **cancellation button** ("Verträge hier kündigen", § 312k BGB), required since 1 July 2022 for online subscriptions in Germany.

Shop systems such as Shopify, Shopware or WooCommerce have plugins for this. Custom shops, SaaS products, membership sites and booking apps built with Next.js or React usually don't, and building it by hand means getting a surprising number of details right: the exact labels, a two-step flow with a confirmation button, the date and time of receipt set by the server, an acknowledgement on a durable medium without delay, a copy the consumer can keep, and a page that works without login.

Inverse packages those details.

## What you get

- **`@sweberdev/inverse`**: validation of the fields the law asks for, a server-side record with date and time of receipt, the acknowledgement e-mail in German, English, French and Italian, a downloadable copy, deadline helpers and a `Request → Response` handler for Next.js, Remix, Hono, SvelteKit or Astro.
- **`@sweberdev/inverse-react`**: `<InverseLink>` with the statutory labels, `<WithdrawalForm>` and `<CancellationForm>` with the two steps and the receipt, and `useDeclarationFlow` for your own UI.
- **`inverse check`**: a CLI that loads a page like a logged-out visitor and reports whether the buttons are there and labelled correctly. Useful in CI.

## How it fits together

```text
footer link ──▶ /widerruf page ──▶ <WithdrawalForm> ──POST──▶ createInverseHandler
"Vertrag widerrufen"                 step 1: details               │ validate
                                     step 2: "Widerruf bestätigen" │ stamp receivedAt
                                     step 3: receipt + download    │ onDeclaration (store)
                                                                   └ sendReceipt (e-mail)
```

You decide where declarations are stored and how e-mail is sent. Inverse has no backend of its own and sends nothing anywhere.

## Not legal advice

Inverse implements the wording and process of § 356a and § 312k BGB as published, and the docs explain the reasoning. It does not replace legal advice for your specific business. See [Legal requirements](/inverse/docs/reference/legal) for what Inverse covers and what stays your job.
