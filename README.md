# Inverse

Withdrawal button (§ 356a BGB) and cancellation button (§ 312k BGB) for Next.js, React and any app with the Fetch API. Inverse handles the details the law is strict about: the exact labels, the two-step flow with a confirm button, the time of receipt set by the server, the acknowledgement e-mail and a copy the consumer can keep.

```sh
pnpm add @sweberdev/inverse @sweberdev/inverse-react
```

```ts
// app/api/inverse/route.ts
import { createInverseHandler } from "@sweberdev/inverse";

export const POST = createInverseHandler({
  company: { name: "Acme GmbH", email: "hallo@acme.de" },
  onDeclaration: (record) => db.declaration.create({ data: record }),
  sendReceipt: (receipt) => mailer.send(receipt),
});
```

```tsx
// footer
<InverseLink kind="withdrawal" href="/widerruf" />     {/* Vertrag widerrufen */}
<InverseLink kind="cancellation" href="/kuendigen" />  {/* Verträge hier kündigen */}

// app/widerruf/page.tsx
<WithdrawalForm endpoint="/api/inverse" />
```

| Package | |
|---|---|
| [`@sweberdev/inverse`](packages/core) | Validation, records, receipts, deadlines, handler, `inverse check` CLI |
| [`@sweberdev/inverse-react`](packages/react) | `<InverseLink>`, `<WithdrawalForm>`, `<CancellationForm>`, `useDeclarationFlow` |

- Statutory labels and two-step flows for withdrawal and cancellation
- Acknowledgement of receipt with content, date and time, in German, English, French and Italian
- Downloadable copy of the declaration (§ 312k Abs. 4 BGB)
- Withdrawal deadline and contract end date helpers (§§ 187, 188, 193 BGB)
- `Request → Response` handler for Next.js, Remix, Hono, SvelteKit and Astro
- `inverse check <url>`: finds missing or mislabelled buttons, exit code for CI
- No backend, no tracking: you store the data and send the e-mail

Docs and live demo: [packages.sweber.dev/inverse](https://packages.sweber.dev/inverse)

Inverse is software, not legal advice.

## Development

```sh
pnpm install
pnpm build && pnpm test && pnpm lint
```

Releases run through Changesets: add a changeset with `pnpm changeset`, merge the "version packages" PR, and the release workflow publishes to npm.

## License

MIT
