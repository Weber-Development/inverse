---
title: Migrating to 2.0
description: What breaks when you move from 1.x to 2.0, and how to move without losing evidence.
---

Inverse 2.0 keeps the flow, the hash chain and the request bodies of 1.x. What changes is where the legal status lives, what a record carries and the minimum Node version. Most projects need no code change at all; check the list below.

1.x keeps receiving security and bug fixes for 12 months after the release of 2.0.0.

## Steps

1. Use Node 22 or newer. The packages declare `engines.node >=22`.
2. Update the free packages together: `pnpm add @sweberdev/inverse@^2 @sweberdev/inverse-react@^2`.
3. Replace `legalRevision` (see below) if you use it.
4. Pro: update `@weber-development/inverse-ledger`, `-audit` and `-mail` to 2.x. Run `inverse-ledger migrate <target>` once (see below).
5. Run `npx inverse legal` and `npx inverse check` on your pages.

## Breaking changes

### `legalRevision` is now `legalRevisions`

The legal status is kept per legal area. The single export is gone.

```ts
// 1.x
import { legalRevision } from "@sweberdev/inverse";
legalRevision.checkedOn;

// 2.x
import { getLegalRevision } from "@sweberdev/inverse";
getLegalRevision("de").checkedOn;
```

`npx inverse legal` prints Germany by default; pass `--jurisdiction <id>` for another area.

### Records carry `jurisdiction` and `legalCheckedOn`

`DeclarationRecord` has two new required fields. New records get them from the handler (`jurisdiction`, default `de`). If you built records yourself with `createRecord`, nothing changes: the default is `de`. If you typed your own database columns for records, add the two fields. Records stored by 1.x do not have them and stay valid; the Pro packages read both kinds.

### Default language follows the jurisdiction

If the handler gets no `locale`, the language of the jurisdiction is used. With the default jurisdiction `de` this is still `de`, so nothing changes unless you set another `jurisdiction`.

### Node 22

Node 20 is out of support. The packages no longer declare support for it.

## What does not change

- Handler options, request and response bodies and component props, apart from the optional additions in [jurisdictions](/inverse/docs/reference/jurisdictions).
- The hash calculation of the evidence ledger: `seq|at|type|ref|payloadHash|prev`, SHA-256, canonical JSON. A chain written by any 1.x version verifies in 2.x without changes, and so do its anchors and dossiers. The new field in the stored entries is metadata only (see Pro below).
- The script-tag build keeps working from `@1` pins. Move to `@2` when you update.

## Pro: the ledger format field and `migrate`

From 2.0 each ledger entry carries `v: 2`. It is storage metadata: **it is not part of the hash**, so no hash changes and no old entry is rewritten. Entries without `v` are format 1. `inverse-ledger verify` reports how many entries of each format a chain has.

For SQL stores the table gets a `format` column. `inverse-ledger migrate <target>` adds it to an existing table (also done on first use unless you turned `migrate` off in the store options), verifies the chain before and after and prints the counts. File stores need no migration. Nothing is deleted, and `migrate` can be run again at any time.

## Release candidates

Before 2.0.0 the packages are published as `2.0.0-next.N` under the npm tag `next` (`pnpm add @sweberdev/inverse@next`). `latest` stays on 1.x until 2.0.0.
