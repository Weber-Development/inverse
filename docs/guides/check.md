---
title: Page check
description: Check pages for the withdrawal and cancellation buttons with the inverse CLI.
---

```sh
npx inverse check https://shop.example.com
npx inverse check https://shop.example.com/ https://shop.example.com/produkte/jacke --kind withdrawal
npx inverse check dist/index.html --json
```

The CLI loads each page without cookies, the way a logged-out visitor sees it, and looks at every link and button (`<a>`, `<button>`, `<summary>`, submit inputs and elements with `role="button"`), using `aria-label`, text, `value` or `title` as the name.

| Result | Meaning |
|---|---|
| ✔ pass | a control with the statutory or an equivalent label |
| ! warn | similar wording ("Abo kündigen", "Widerrufen"), or the link goes to a login page |
| ✘ fail | nothing found |

Information links such as "Widerrufsbelehrung" or "Kündigungsfrist" are ignored: they are not the function.

It exits with `0` when everything passes and `1` otherwise (`--warn-ok` lets warnings pass), so you can run it in CI after a deploy:

```yaml
- run: npx @sweberdev/inverse check "$PREVIEW_URL" --kind both
```

The check reads the HTML the server sends. A button rendered only in the browser after hydration is not seen; in Next.js, footers are server components by default, so that is rarely a problem.

To check a whole site from its sitemap, follow the button to its target and get a report for clients, see [Inverse Pro audit](/inverse/docs/pro/audit).

## In code

```ts
import { checkHtml, checkUrl } from "@sweberdev/inverse";

const result = await checkUrl("https://shop.example.com", ["withdrawal"]);
if (result.verdict !== "pass") console.log(result.results[0].message);
```
