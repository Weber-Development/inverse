# @sweberdev/inverse-react

## 0.3.0

### Minor Changes

- fbe573d: Framework-free forms and three new languages.

  - `@sweberdev/inverse/ui`: `mountDeclarationForm(element, options)` (plus `mountWithdrawalForm`, `mountCancellationForm`) renders the complete two-step withdrawal or cancellation flow without React and posts to the existing handler. Same markup, classes and accessibility as the React components: labels, `aria-describedby` errors, focus management, `aria-live` receipt. Also `createInverseLink()`, `createDeclarationFlow()` (the state machine without DOM) and `autoMount()`.
  - `dist/inverse.global.js`: a self-contained script for WordPress, Shopify themes and static sites, served by jsDelivr and unpkg (`https://cdn.jsdelivr.net/npm/@sweberdev/inverse@0.3/dist/inverse.global.js`). Exposes `window.Inverse` and mounts `<div data-inverse-form="withdrawal" data-endpoint="…">` and fills `<a data-inverse-link="cancellation">` automatically.
  - New locales `nl`, `es` and `pl` for all form texts, errors, receipts and the downloadable copy. The withdrawal labels are the wording of Article 11a in those language versions of the directive; all other texts are translations that should be reviewed by a native speaker or a lawyer before production use.
  - `inverse check` recognises the Dutch, Spanish and Polish button labels.

### Patch Changes

- Updated dependencies [fbe573d]
  - @sweberdev/inverse@0.3.0

## 0.2.0

### Minor Changes

- a67631d: - `createNodeHandler` and `toWebRequest`: the same endpoint for Express, Fastify, `node:http` and the Next.js Pages Router.
  - `rateLimit` option for the handler: answers 429 with `retry-after` once a client is over the limit.
  - `withdrawalStatus()`: deadline, whether the period is open and the days left.
  - React: `contracts` prop renders a select of a signed-in customer's contracts and preselects a single one.

### Patch Changes

- Updated dependencies [a67631d]
  - @sweberdev/inverse@0.2.0

## 0.1.0

### Minor Changes

- bc63fb8: First release: withdrawal button (§ 356a BGB) and cancellation button (§ 312k BGB) with validation, server-side receipt, acknowledgement e-mail in four languages, deadline helpers, a `Request → Response` handler for Next.js and other runtimes, the `inverse check` CLI and React components for the two-step flows.

### Patch Changes

- Updated dependencies [bc63fb8]
  - @sweberdev/inverse@0.1.0
