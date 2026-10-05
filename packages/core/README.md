# @sweberdev/inverse

Withdrawal button (§ 356a BGB) and cancellation button (§ 312k BGB) for any web app: validation, server-side record with date and time of receipt, acknowledgement e-mail in four languages, deadline helpers, a `Request → Response` handler and the `inverse check` CLI.

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

React components: [`@sweberdev/inverse-react`](https://www.npmjs.com/package/@sweberdev/inverse-react). Docs: [packages.sweber.dev/inverse/docs](https://packages.sweber.dev/inverse/docs).

MIT. Inverse is software, not legal advice.
