---
"@sweberdev/inverse": minor
"@sweberdev/inverse-react": minor
---

- `createNodeHandler` and `toWebRequest`: the same endpoint for Express, Fastify, `node:http` and the Next.js Pages Router.
- `rateLimit` option for the handler: answers 429 with `retry-after` once a client is over the limit.
- `withdrawalStatus()`: deadline, whether the period is open and the days left.
- React: `contracts` prop renders a select of a signed-in customer's contracts and preselects a single one.
