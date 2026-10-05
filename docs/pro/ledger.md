---
title: Ledger
description: Tamper-evident storage of declarations and receipts, with evidence sheets.
---

If a consumer says they withdrew in time and you say they didn't, you need records that you can show were not changed afterwards. `inverse-ledger` writes every declaration and every receipt as an entry in a hash chain: each entry contains the SHA-256 hash of the previous one, so changing, deleting or reordering any entry breaks the chain.

```ts
import { createInverseHandler } from "@sweberdev/inverse";
import { createLedger, fileStore, withLedger } from "@weber-development/inverse-ledger";

const ledger = createLedger({ store: fileStore("./data/inverse.jsonl") });

export const POST = createInverseHandler(
  withLedger(ledger, {
    company,
    onDeclaration: (record) => db.declaration.create({ data: record }), // optional, runs after the ledger
    sendReceipt: (receipt) => mailer.send(receipt),
  }),
);
```

`withLedger` appends a `declaration` entry before your own `onDeclaration`, and a `receipt` entry (or `receipt-failed` with the error) after `sendReceipt`.

## Stores

- `fileStore(path)`: one JSON line per entry. Good for a VPS or a mounted volume.
- `memoryStore()`: for tests.
- Your own: implement `{ read(): Promise<LedgerEntry[]>; append(entry): Promise<void>; replace(entries): Promise<void> }` for Postgres, S3 or anything else. Serverless platforms such as Vercel have no persistent disk, so use your database there.

## Verify

```ts
const result = await ledger.verify();
// { ok: true, entries: 1342, head: "9f2c…" }
// { ok: false, entries: 1342, brokenAt: 718, reason: "hash mismatch" }
```

```sh
npx inverse-ledger verify ./data/inverse.jsonl
```

Publish or e-mail the `head` hash to yourself from time to time (the CLI prints it). Anyone who rewrites the whole chain then cannot match a head you recorded earlier.

## Evidence sheet

```ts
const sheet = await ledger.evidence("W-7K3QX9PD");
sheet.text; // human-readable: declaration, time of receipt, receipt sent at, hashes, chain position
sheet.json; // the same as data
```

```sh
npx inverse-ledger evidence ./data/inverse.jsonl W-7K3QX9PD > W-7K3QX9PD.txt
npx inverse-ledger export ./data/inverse.jsonl --from 2026-06-19 --csv > declarations.csv
```

## Erasure

Personal data must not be kept longer than needed. `ledger.redact(id, { reason })` removes the personal data of a declaration and its receipts but keeps each entry's payload hash, so the chain still verifies and you can show that a declaration existed and when.

```ts
await ledger.redact("W-7K3QX9PD", { reason: "retention period ended" });
```
