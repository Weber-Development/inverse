---
title: Legal status
description: The state of the law Inverse was last checked against, and what changed because of it.
---

Inverse tracks the rules behind the two buttons. Each release states the date it was last checked against the sources, and every change that was made because of the law is listed here and in the changelog. Inverse Pro licence holders get the same updates through the Pro packages; if the rules or a ruling change something in the texts, the fix ships as a new version and a note in the release post.

```sh
npx inverse legal
```

```ts
import { legalRevision } from "@sweberdev/inverse";

legalRevision.checkedOn; // "2026-10-06"
legalRevision.sources; // the directive and the BGB sections
legalRevision.changes; // [{ version, date, summary }]
```

Use `legalRevision.checkedOn` to show the date in your own compliance documentation or to fail a CI job when the installed version is older than your policy allows.

## Sources

- Directive (EU) 2023/2673, Article 11a Consumer Rights Directive (withdrawal function)
- § 356a BGB (withdrawal function, in force 19 June 2026)
- § 312k BGB (cancellation button, in force 1 July 2022)
- §§ 187, 188, 193 BGB (calculation of periods), § 357 BGB (refund within 14 days)

## Changes

| Date | Version | What changed |
|---|---|---|
| 2026-10-09 | 0.9.0 | Austria page added: what Inverse covers for Austria and what it does not claim. No change in requirements. |
| 2026-10-09 | 0.8.0 | WordPress plugin; forms checked with axe (WCAG rules). No change in requirements. |
| 2026-10-07 | 0.7.0 | Example projects added. No change in requirements. |
| 2026-10-06 | 0.6.0 | Integrations for WooCommerce, Shopware and Shopify (`inverse snippet`). No change in requirements. |
| 2026-10-06 | 0.5.0 | Revision record added. No change in requirements; Austria applies the withdrawal function from 1 October 2026 and uses the same labels. |
| 2026-10-06 | 0.3.0 | Dutch, Spanish and Polish added; withdrawal labels taken verbatim from Article 11a of the directive. |
| 2026-10-05 | 0.1.0 | Labels, two-step flow, receipt with date and time, downloadable copy and page check for § 356a and § 312k BGB. |

## Not legal advice

A current revision date means the texts were compared with the sources on that day, not that a court agrees with them. Placement on your pages, your terms and the handling of individual cases stay your responsibility; see [legal requirements](/inverse/docs/reference/legal).
