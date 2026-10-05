---
title: Cancellation button
description: The cancellation button under § 312k BGB for subscriptions and other continuing contracts.
---

Since 1 July 2022 every business that lets consumers conclude continuing contracts (subscriptions, memberships, SaaS plans, insurance, telecoms) on a website must offer a **cancellation button** on that website.

## What the law asks for

| Requirement | How Inverse covers it |
|---|---|
| A button labelled "Verträge hier kündigen" or similarly unambiguous | `<InverseLink kind="cancellation">` |
| Leads directly to a confirmation page, permanently available and easy to reach | The page with `<CancellationForm>`, no login needed |
| Page asks for type of cancellation (and the reason for an extraordinary one), identity, contract, the date the contract should end, and an electronic address for the receipt | Fields `cancellationType`, `reason`, `name`, `contractRef`, `effectiveDate`, `email` |
| A confirmation button labelled "jetzt kündigen" | Step 2 of `<CancellationForm>` |
| The consumer can save the declaration with date and time of submission | Step 3 shows a copy and offers it as a download |
| Acknowledgement on a durable medium without delay, with content, date and time of receipt and the time the contract ends | `renderReceipt` with `endsAt`, sent by your `sendReceipt` |

Courts read these rules strictly. A login wall in front of the form, a button called "Abo verwalten", or a confirmation page that tries to keep the customer with offers have all been found to break them.

## End date in the receipt

The receipt should say when the contract ends. If you can work it out at once, pass `resolveEndDate`:

```ts
import { contractEndDate, createInverseHandler, toIsoDate } from "@sweberdev/inverse";

export const POST = createInverseHandler({
  company,
  onDeclaration: save,
  sendReceipt: send,
  resolveEndDate: async (record) => {
    const contract = await findContract(record.data.contractRef);
    if (!contract) return undefined; // the receipt says you will follow up
    return contractEndDate({
      received: toIsoDate(new Date(record.receivedAt)),
      notice: { months: 1 },
      termEnd: contract.termEnd,
      requested: record.data.effectiveDate,
    });
  },
});
```

`contractEndDate` returns the end of the current term if the notice period still fits, otherwise the day the notice period runs out (contracts renewed by law after 1 March 2022 can be cancelled with at most one month's notice), or the requested date if it is later.

If you return `undefined`, the receipt says that you will tell the consumer separately. Do that soon: the confirmation of the end date is still owed.

## Which contracts

The consumer does not have to be logged in, so they may not know which plan a contract number belongs to. Accept what they enter, store it, and match it afterwards. `contractRef` can be an e-mail address, a customer number or a contract number.
