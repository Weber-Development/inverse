---
title: Case inbox
description: A web inbox for withdrawals and cancellations with status, refund day and reply templates. Beta.
---

The inbox is part of `@weber-development/inverse-ledger` (from 2.1). It shows every declaration with its status and refund day, marks overdue withdrawals, moves a case on and sends the customer a reply from a template. Status changes are written to the evidence chain, so the history of a case is part of the evidence.

**Status: beta.** The server and the status logic are tested with real HTTP requests against a ledger and a fake mail transport. It has not been tested against a real mail provider.

## Start it

```sh
export INVERSE_INBOX_PASSWORD="a password of at least 12 characters"
npx inverse-ledger inbox ./data/inverse.db --company "Acme GmbH"
```

Open `http://127.0.0.1:4410/` and sign in with the user `admin` (`--user` changes it). The target can be a JSON Lines file, SQLite or PostgreSQL, as for every ledger command. The server listens on `127.0.0.1`; put HTTPS in front of it (a reverse proxy or a tunnel) before you reach it from anywhere else, since Basic auth sends the password with every request.

A JSON Lines ledger has one writer. Stop the inbox before your shop writes to the same file, or use SQLite or PostgreSQL, where the sequence number prevents forks.

## In code

```ts
import { createInbox, createLedger } from "@weber-development/inverse-ledger";
import { serveInbox } from "@weber-development/inverse-ledger/node";
import { resend } from "@weber-development/inverse-mail";

const inbox = createInbox({
  ledger,
  company: "Acme GmbH",
  transport: resend({ apiKey: process.env.RESEND_API_KEY!, from: "Acme <service@acme.de>" }),
});

await serveInbox({ inbox, user: "admin", password: process.env.INBOX_PASSWORD! });

// or without the UI:
await inbox.change("W-7K3QX9PD", "refunded", { amount: "49.90", currency: "EUR", reply: "refunded", locale: "de" });
```

`inboxHandler` returns a plain Node request handler if you want to mount it in your own server.

## Reply templates

`received`, `processing`, `refunded`, `rejected` and `info`, in German and English. The reference, contract, date and refund day come from the ledger, not from what you type. You can preview a mail before it is sent. If sending fails, the status stays saved and the answer says `mail: "failed"`.

## Security

- Every request needs HTTP Basic auth; the comparison does not leak timing.
- Changes need the header `x-inverse-inbox: 1`, which another web page cannot send without a CORS preflight that the server never allows.
- The page sends a strict content security policy and shows customer text only as text.
- Personal data that was redacted by retention or erasure is not shown, and no mail can be sent for it.
