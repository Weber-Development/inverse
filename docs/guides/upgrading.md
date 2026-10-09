---
title: Upgrading to 1.0
description: What changes when you move from 0.x to 1.0, and what to check.
---

Inverse 1.0.0 freezes the public API that 0.9 already had. Code that runs on 0.9 runs on 1.0 without changes. This page lists what to check anyway.

## Steps

1. Update to the latest 0.9 and run your tests and `inverse check` on your pages.
2. Update both free packages together: `pnpm add @sweberdev/inverse@^1 @sweberdev/inverse-react@^1`. For Pro, update `@weber-development/inverse-ledger`, `-audit` and `-mail` to 1.x as well.
3. Run `npx inverse legal` and compare the date with your policy.
4. Pin the script-tag build to `@1` (`.../@sweberdev/inverse@1/dist/inverse.global.js`) or to an exact version.

## What does not change

- Handler options, request and response bodies, component props, CLI flags.
- The ledger format and the SQL table layout: a chain written by 0.x verifies in 1.x, and the dossier and anchors keep working on it.

## Deprecated and removed

Nothing that was announced for removal exists, so nothing is removed. From 1.0 the rules on [stability](/inverse/docs/reference/stability) apply: deprecations stay for two minor versions, removals only come with a major version.
