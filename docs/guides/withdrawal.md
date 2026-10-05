---
title: Withdrawal button
description: The withdrawal function under § 356a BGB, step by step.
---

Since 19 June 2026 every trader who concludes distance contracts with consumers through an online interface must offer a **withdrawal function**. It applies to shops as well as to subscriptions, digital content and services booked online.

## What the law asks for

| Requirement | How Inverse covers it |
|---|---|
| A function labelled "Vertrag widerrufen" or with an equivalent, unambiguous wording | `<InverseLink kind="withdrawal">` and the form title use exactly that label |
| Available for the whole withdrawal period, prominent and easy to reach | Put the link in the footer of every page; the form works without login |
| Consumer enters or confirms name, contract and an electronic address for the receipt | Fields `name`, `contractRef`, `email`, validated on client and server |
| A confirmation function labelled "Widerruf bestätigen" | Step 2 of `<WithdrawalForm>` |
| Acknowledgement of receipt without delay on a durable medium, with the content of the withdrawal and date and time of receipt | `renderReceipt`, sent by your `sendReceipt` right after storing |
| Using the function before the period ends is in time | The server sets `receivedAt`; `isWithinWithdrawalPeriod` uses that date |

## Partial withdrawal

Consumers can withdraw from part of an order. Turn on the items field:

```tsx
<WithdrawalForm endpoint="/api/inverse" showItems />
```

Items are entered one per line and stored as `data.items`.

## Prefill from the order e-mail

Link to the form with the order number, and pass it in:

```tsx
export default async function Page({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return <WithdrawalForm endpoint="/api/inverse" defaultValues={{ contractRef: order ?? "" }} />;
}
```

The consumer can still change every value. Don't make the form depend on a valid order number: a declaration with a wrong number is still a declaration you have to deal with.

## Withdrawal period

```ts
import { withdrawalDeadline } from "@sweberdev/inverse";

withdrawalDeadline({ start: "2026-10-05" }); // "2026-10-19"
withdrawalDeadline({ start: "2026-10-03" }); // "2026-10-19" (Saturday → Monday)
withdrawalDeadline({ start: "2026-10-05", informed: false }); // "2027-10-19"
```

`start` is the day the contract was concluded or, for goods, the day the consumer received them. The day itself is not counted (§ 187 BGB), weekends move the end to Monday (§ 193 BGB), and you can pass `isHoliday` for public holidays. Without proper information about the right of withdrawal the period ends 12 months later.

To show the remaining time, for example in the order overview:

```ts
import { withdrawalStatus } from "@sweberdev/inverse";

const { deadline, open, daysLeft } = withdrawalStatus({ start: order.deliveredAt });
// open: "You can withdraw until 19.10.2026 (8 days left)."
```

Don't hide the button once the period has ended: you usually don't know the exact delivery date per consumer, and declarations that arrive late are easy to answer.
