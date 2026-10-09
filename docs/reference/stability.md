---
title: Stability and versions
description: What stays stable from 1.0, how deprecations work and how Inverse is versioned.
---

From 1.0.0 Inverse follows semantic versioning. This page says what the promise covers.

## What is stable

- **Exports.** Every name exported from `@sweberdev/inverse` and `@sweberdev/inverse-react`, and, for licence holders, from `@weber-development/inverse-ledger`, `-audit` and `-mail`. A test in each package lists them; removing or renaming one fails the test and needs a major version.
- **Options and results.** The fields of the handler options (`company`, `onDeclaration`, `sendReceipt`, `rateLimit`, `dedupe`, `cors`), the request and response bodies of the handler, the props of the components, and the shape of `DeclarationRecord`.
- **Ledger data.** The entry format of the evidence ledger (fields, canonical JSON, hash calculation) and the SQL table layout. A chain written by 0.x verifies in 1.x.
- **CLI.** Commands and flags of `inverse` and `inverse-ledger` / `inverse-audit`, and their exit codes.

## What can change in a minor version

- New exports, options, commands, languages and fields (additions).
- Texts: labels, error messages and receipts follow the law. A change that the law requires ships as a minor or patch version, is listed in the [legal status](/inverse/docs/reference/legal-status) and in the release post.
- Output formats meant for people: the layout of HTML and PDF reports and the dossier, and the text of CLI output. Parse `--json` output instead.

## Deprecations

A feature that is going away is marked `@deprecated` in the types and in the release post. It keeps working for at least two minor versions and is removed in the next major version.

## Versions

The free packages share one version. The Pro packages (`inverse-ledger`, `inverse-audit`, `inverse-mail`) share another and work with every free version of the same major version. After you cancel Pro, the versions you received keep working; only updates and repository access end.

See also [upgrading to 1.0](/inverse/docs/guides/upgrading).
