# @sweberdev/inverse-react

React components for [Inverse](https://packages.sweber.dev/inverse): the statutory links and the two-step withdrawal (§ 356a BGB) and cancellation (§ 312k BGB) forms with receipt download.

```sh
pnpm add @sweberdev/inverse @sweberdev/inverse-react
```

```tsx
import { CancellationForm, InverseLink, WithdrawalForm } from "@sweberdev/inverse-react";

<InverseLink kind="withdrawal" href="/widerruf" />     // Vertrag widerrufen
<InverseLink kind="cancellation" href="/kuendigen" />  // Verträge hier kündigen

<WithdrawalForm endpoint="/api/inverse" showItems />
<CancellationForm endpoint="/api/inverse" locale="en" />
```

Unstyled, every element has an `inverse-*` class. Docs: [packages.sweber.dev/inverse/docs](https://packages.sweber.dev/inverse/docs/guides/react).

MIT.

<!-- pro-promo -->
## Inverse Pro

Need more than the free package? **Inverse Pro** adds:

- Evidence ledger: declarations and receipts in a hash chain, with an evidence sheet per declaration
- Site audit: checks every page for both buttons and writes a report for clients
- Mail: receipts in your branding, team notifications with the next due date, transports for common mail providers

Subscriptions from CHF 19 per month, or a one-time lifetime licence. [See what is included](https://packages.sweber.dev/inverse?utm_source=npm&utm_medium=readme&utm_campaign=pro)
