# @sweberdev/inverse

## 0.2.0

### Minor Changes

- a67631d: - `createNodeHandler` and `toWebRequest`: the same endpoint for Express, Fastify, `node:http` and the Next.js Pages Router.
  - `rateLimit` option for the handler: answers 429 with `retry-after` once a client is over the limit.
  - `withdrawalStatus()`: deadline, whether the period is open and the days left.
  - React: `contracts` prop renders a select of a signed-in customer's contracts and preselects a single one.

## 0.1.0

### Minor Changes

- bc63fb8: First release: withdrawal button (§ 356a BGB) and cancellation button (§ 312k BGB) with validation, server-side receipt, acknowledgement e-mail in four languages, deadline helpers, a `Request → Response` handler for Next.js and other runtimes, the `inverse check` CLI and React components for the two-step flows.
