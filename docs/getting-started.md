---
title: Getting started
description: Add the withdrawal and cancellation buttons to a Next.js app in four steps.
---

## 1. Install

```sh
pnpm add @sweberdev/inverse @sweberdev/inverse-react
```

## 2. Add the route

The handler validates the declaration, sets the time of receipt on the server, calls your storage and sends the acknowledgement.

```ts
// app/api/inverse/route.ts
import { createInverseHandler } from "@sweberdev/inverse";
import { Resend } from "resend";
import { db } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = createInverseHandler({
  company: { name: "Acme GmbH", address: "Musterweg 1, 10115 Berlin", email: "hallo@acme.de" },
  onDeclaration: (record) => db.declaration.create({ data: record }),
  sendReceipt: (receipt) =>
    resend.emails.send({ from: "Acme <service@acme.de>", ...receipt }),
});
```

Use any database and any mail provider. The record is plain JSON; the receipt has `to`, `subject`, `text` and `html`.

## 3. Add the pages

```tsx
// app/widerruf/page.tsx
import { WithdrawalForm } from "@sweberdev/inverse-react";

export default function Page() {
  return <WithdrawalForm endpoint="/api/inverse" />;
}
```

```tsx
// app/kuendigen/page.tsx
import { CancellationForm } from "@sweberdev/inverse-react";

export default function Page() {
  return <CancellationForm endpoint="/api/inverse" />;
}
```

Both pages must work without login. Don't put them behind your auth middleware.

## 4. Link them from every page

```tsx
// app/layout.tsx (footer)
import { InverseLink } from "@sweberdev/inverse-react";

<footer>
  <InverseLink kind="withdrawal" href="/widerruf" />
  <InverseLink kind="cancellation" href="/kuendigen" />
</footer>
```

Only show the cancellation link if you sell subscriptions; only the withdrawal link if consumers can conclude contracts on your site. Most shops need the first, most SaaS products both.

## Check it

```sh
npx inverse check https://localhost:3000
```

The CLI exits with 1 when a button is missing or labelled differently, so you can run it in CI. See [Page check](/inverse/docs/guides/check).
