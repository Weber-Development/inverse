# Examples

Minimal starting points; copy the files into a project of the same kind and adjust the company details, storage and mail sending. They are not built or tested here: the handler and the forms are, and the examples only wire them in the way the [guides](https://packages.sweber.dev/inverse/docs/guides/other-frameworks) describe.

| Folder | Setup |
|---|---|
| `next-pages` | Next.js Pages Router: API route with `createNodeHandler`, page with `<WithdrawalForm>` |
| `remix` | Remix / React Router: resource route and page |
| `sveltekit` | SvelteKit: `+server.ts` and a page using the script-tag build |
| `express` | Express with CORS for a static shop on another domain |

For WooCommerce, Shopware, Shopify and WordPress run `npx @sweberdev/inverse snippet <platform> --endpoint <url>`.
