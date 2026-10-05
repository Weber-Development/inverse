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
