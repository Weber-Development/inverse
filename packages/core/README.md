# @sweberdev/inverse

Withdrawal button (§ 356a BGB) and cancellation button (§ 312k BGB) for any web app: validation, server-side record with date and time of receipt, acknowledgement e-mail in seven languages, deadline helpers, a `Request → Response` handler and the `inverse check` CLI.

```sh
pnpm add @sweberdev/inverse
```

```ts
import { createInverseHandler } from "@sweberdev/inverse";

export const POST = createInverseHandler({
  company: { name: "Acme GmbH", email: "hallo@acme.de" },
  onDeclaration: (record) => save(record),
  sendReceipt: (receipt) => send(receipt), // { to, subject, text, html }
});
```

```sh
npx inverse check https://shop.example.com
```

Without React, in plain HTML, WordPress or Shopify:

```html
<a data-inverse-link="withdrawal" href="/widerruf"></a>
<div data-inverse-form="withdrawal" data-endpoint="/api/inverse"></div>
<script src="https://cdn.jsdelivr.net/npm/@sweberdev/inverse@2/dist/inverse.global.js" defer></script>
```

or `import { mountDeclarationForm } from "@sweberdev/inverse/ui"`.

React components: [`@sweberdev/inverse-react`](https://www.npmjs.com/package/@sweberdev/inverse-react). Docs: [packages.sweber.dev/inverse/docs](https://packages.sweber.dev/inverse/docs).

MIT. Inverse is software, not legal advice.

<!-- pro-promo -->
## Inverse Pro

Need more than the free package? **Inverse Pro** adds:

- Evidence ledger: declarations and receipts in a hash chain, with an evidence sheet per declaration
- Site audit: checks every page for both buttons and writes a report for clients
- Mail: receipts in your branding, team notifications with the next due date, transports for common mail providers

Subscriptions from CHF 19 per month, or a one-time lifetime licence. [See what is included](https://packages.sweber.dev/inverse?utm_source=npm&utm_medium=readme&utm_campaign=pro)
