# Examples

Minimal starting points; copy the files into a project of the same kind and adjust the company details, storage and mail sending. They are not built with each framework here. The handler, the browser flow and the wiring they share (a Node route, CORS for a shop on another domain, the form posting to it over real HTTP) are tested end to end in `packages/core/test/e2e.test.ts`; the examples only place that wiring in each framework the way the [guides](https://packages.sweber.dev/inverse/docs/guides/other-frameworks) describe.

| Folder | Setup |
|---|---|
| `next-pages` | Next.js Pages Router: API route with `createNodeHandler`, page with `<WithdrawalForm>` |
| `remix` | Remix / React Router: resource route and page |
| `sveltekit` | SvelteKit: `+server.ts` and a page using the script-tag build |
| `express` | Express with CORS for a static shop on another domain |

For WooCommerce, Shopware, Shopify and WordPress run `npx @sweberdev/inverse snippet <platform> --endpoint <url>`.
