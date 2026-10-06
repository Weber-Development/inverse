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
- `postgresStore({ query })`: PostgreSQL, Neon, Supabase, PGlite. The right choice on serverless platforms such as Vercel, which have no persistent disk.
- `sqliteStore({ query })`: SQLite through `node:sqlite`, better-sqlite3 or `bun:sqlite`.
- `memoryStore()`: for tests.
- Your own: implement `{ read(): Promise<LedgerEntry[]>; append(entry): Promise<void>; replace(entries): Promise<void> }`, optionally `last()` and `find(ref)`, for S3 or anything else.

## PostgreSQL and SQLite

The SQL stores take a `query(sql, params)` function that returns rows, so they work with any driver and add no dependency. Two adapters cover the common drivers:

```ts
import { createLedger, pgQuery, postgresStore } from "@weber-development/inverse-ledger";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const ledger = createLedger({ store: postgresStore({ query: pgQuery(pool) }) });
```

```ts
import { createLedger, sqliteQuery, sqliteStore } from "@weber-development/inverse-ledger";
import { DatabaseSync } from "node:sqlite"; // or: new Database(path) from better-sqlite3

const ledger = createLedger({
  store: sqliteStore({ query: sqliteQuery(new DatabaseSync("./data/inverse.db")) }),
});
```

`pgQuery` accepts anything with `query(text, values) → { rows }` (pg `Pool` or `Client`, `@neondatabase/serverless`, PGlite); `sqliteQuery` anything with a synchronous `prepare(sql)`. For other drivers write the function yourself, e.g. for postgres.js: `query: (text, params) => sql.unsafe(text, params)`.

| Option | |
|---|---|
| `query` | `(sql, params) => rows` (sync or async) |
| `table` | table name, optionally with schema; default `inverse_ledger` |
| `migrate` | create the table and an index on `ref` on first use; default `true`. With `false`, run `await store.migrate()` or the SQL in `store.schema` once yourself |

The table has one row per entry (`seq` primary key, `at`, `type`, `ref`, `payload` as JSON text, `payload_hash`, `prev`, `hash`):

- **Append-only.** The store only ever inserts rows. `replace`, which the ledger uses for erasure, may only clear payloads; any other change is refused. For extra safety, give the application's database user only `SELECT`, `INSERT` and `UPDATE (payload)` on the table.
- **No forks.** `seq` is the primary key. If two server instances append at the same moment, one insert fails and the declaration request returns an error the consumer can retry; the chain stays linear.
- **Fast appends.** The store reads the last entry and the entries of one declaration with indexed queries instead of the whole chain.

Verification, evidence sheets, `redact` and `retain` work exactly as with the file store. The `inverse-ledger` CLI reads JSON Lines files; for a database, call `ledger.verify()`, `ledger.evidence(ref)` and `ledger.retain()` from a script or a scheduled job.

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
npx inverse-ledger export ./data/inverse.jsonl --from 2026-06-19 > declarations.csv
```

## Erasure

Personal data must not be kept longer than needed. `ledger.redact(id, { reason })` removes the personal data of a declaration and its receipts but keeps each entry's payload hash, so the chain still verifies and you can show that a declaration existed and when.

```ts
await ledger.redact("W-7K3QX9PD", { reason: "retention period ended" });
```

## Retention

Set a retention period once and run it on a schedule instead of redacting by hand. `retain` redacts every declaration received more than `days` days ago, together with its receipts, and logs one redaction entry per declaration:

```ts
const { refs, entries } = await ledger.retain({ days: 3 * 365 });
await ledger.retain({ days: 3 * 365, dryRun: true }); // only list what would go
```

```sh
npx inverse-ledger retain ./data/inverse.jsonl --days 1095 --dry-run
npx inverse-ledger retain ./data/inverse.jsonl --days 1095
```

How long you keep declarations is your decision; three years (the regular limitation period, § 195 BGB) is a common choice. The chain still verifies after a retention run.

