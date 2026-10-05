---
title: React components
description: InverseLink, WithdrawalForm, CancellationForm and the useDeclarationFlow hook.
---

```sh
pnpm add @sweberdev/inverse-react
```

The components work with React 18 and 19 and are client components (`"use client"` is set).

## `<InverseLink>`

```tsx
<InverseLink kind="withdrawal" href="/widerruf" />        // Vertrag widerrufen
<InverseLink kind="cancellation" href="/kuendigen" />     // Verträge hier kündigen
<InverseLink kind="cancellation" href="/en/cancel" locale="en" /> // Cancel contracts here
```

Pass `children` only if you are sure the wording is equivalent. The statutory wording is the safe choice.

## `<WithdrawalForm>` and `<CancellationForm>`

| Prop | |
|---|---|
| `endpoint` | URL of your `createInverseHandler` route |
| `locale` | `de` (default), `en`, `fr`, `it` |
| `defaultValues` | prefill `name`, `email`, `contractRef` and others |
| `contracts` | `{ value, label }[]` of a signed-in customer: a select instead of the free-text contract field |
| `showItems` | withdrawal: field for a partial withdrawal |
| `showMessage` | optional free-text message |
| `intro` | replaces the intro text |
| `messages` | override single texts, e.g. `{ withdrawal: { intro: "…" } }` |
| `onSuccess` | called with `{ id, receivedAt, copy, endsAt? }` |
| `submit` | replace the `fetch` call, e.g. for tests |

For signed-in customers, pass their contracts. A single contract is preselected:

```tsx
<CancellationForm
  endpoint="/api/inverse"
  defaultValues={{ name: user.name, email: user.email }}
  contracts={user.subscriptions.map((s) => ({ value: s.id, label: `${s.plan}, ${s.id}` }))}
/>
```

Logging in must stay optional: the button has to work without an account, so render the free-text form for everyone else.

The flow has three steps: details, review with the statutory confirm button, and the receipt with a download. Focus moves to the heading on every step and errors are linked to their fields with `aria-describedby`.

## Styling

The components are unstyled. Every element has a class:

```css
.inverse-flow { display: grid; gap: 1rem; max-width: 32rem; }
.inverse-field { display: grid; gap: 0.25rem; }
.inverse-field[data-invalid] input { border-color: #b91c1c; }
.inverse-error { color: #b91c1c; }
.inverse-summary { display: grid; grid-template-columns: max-content 1fr; gap: 0.25rem 1rem; }
.inverse-summary div { display: contents; }
.inverse-actions { display: flex; gap: 0.5rem; }
.inverse-confirm { font-weight: 600; }
.inverse-copy { white-space: pre-wrap; }
```

The root has `data-kind` and `data-step` (`form`, `review`, `sending`, `done`).

## Your own UI

```tsx
import { useDeclarationFlow } from "@sweberdev/inverse-react";

const flow = useDeclarationFlow({ kind: "cancellation", endpoint: "/api/inverse" });
// flow.step, flow.values, flow.setValue, flow.errorFor(field),
// flow.review(), flow.back(), flow.confirm(), flow.summary, flow.result, flow.messages
```

Keep the two steps and the labels from `flow.messages` (`withdrawal.confirm`, `cancellation.confirm`).
