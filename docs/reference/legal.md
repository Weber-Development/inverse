---
title: Legal requirements
description: The rules behind the withdrawal and cancellation buttons, and what stays your job.
---

## Withdrawal button (§ 356a BGB)

Introduced by the EU directive 2023/2673, which added Article 11a to the Consumer Rights Directive. It applies EU-wide from **19 June 2026**; Germany implemented it as § 356a BGB; Austria applies its rules from 1 October 2026. Labels in the directive's English, French, Italian, Dutch, Spanish and Polish versions are "withdraw from contract here", "se rétracter du contrat ici", "recedere dal contratto qui", "hier de overeenkomst herroepen", "desistir del contrato aquí" and "odstąp od umowy tutaj" (confirmation: "confirm withdrawal", "confirmer la rétractation", "confermare il recesso", "herroeping bevestigen", "confirmar desistimiento", "potwierdź odstąpienie od umowy"), which Inverse uses for those locales.

> **Translations.** The Dutch, Spanish and Polish texts (form, errors, receipt) were added in 0.3. Only the two withdrawal labels are taken verbatim from the directive; everything else, including all cancellation texts, is a translation. Have them reviewed by a native speaker and, for the receipt, by a lawyer before you use them in production. You can replace any text with the `messages` option.

1. Contracts concluded via an online interface need a withdrawal function labelled "Vertrag widerrufen" or with an equivalent, unambiguous wording.
2. It must be available throughout the withdrawal period, prominently placed and easy to access.
3. It lets the consumer submit a withdrawal and enter or confirm their name, the contract and the electronic means for the acknowledgement.
4. After that, a confirmation function labelled "Widerruf bestätigen" or equivalent.
5. The trader sends an acknowledgement of receipt without delay on a durable medium, with the content of the withdrawal and the date and time of receipt.
6. The withdrawal is in time if the function was used before the period ended.

## Cancellation button (§ 312k BGB)

In force since **1 July 2022**, Germany only.

1. A cancellation button labelled "Verträge hier kündigen" or equally unambiguous, leading directly to a confirmation page.
2. The confirmation page asks for the type of cancellation (and the reason if extraordinary), identity, the contract, the time the cancellation takes effect and an electronic address for the confirmation.
3. A confirmation button labelled "jetzt kündigen" or equally unambiguous.
4. Button and page must be permanently available and directly and easily accessible.
5. The consumer must be able to save the declaration with date and time of submission on a durable medium.
6. The trader confirms receipt without delay on a durable medium, with content, date and time of receipt and the time the contract ends.
7. If the time of the cancellation is not stated, the earliest possible date applies.

## What stays your job

- **Placement.** Show the links on every page where contracts can be concluded, for the whole period. The CLI and Pro audit help you check this.
- **Storage.** Keep the declarations and receipts as evidence for as long as claims can arise (often three years after the end of the year). Pro `ledger` makes them tamper-evident.
- **Follow-up.** Refunds after a withdrawal, the end of the contract after a cancellation and an end date you could not compute at once.
- **Your legal texts.** The withdrawal information (Widerrufsbelehrung) in your terms should mention the new function.
- **Advice.** Inverse is software, not legal advice. For specific cases ask a lawyer or a trade association.
