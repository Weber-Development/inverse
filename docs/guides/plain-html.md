---
title: Plain HTML, WordPress and Shopify
description: The withdrawal and cancellation forms without React, from npm or with a script tag.
---

The forms also work without React: on a static site, in a WordPress or Shopify theme, or in an app built with Vue, Svelte or plain JavaScript. They post to the same handler as the React components, so set up [`createInverseHandler`](/inverse/docs/reference/handler) on your server first. The endpoint has to be reachable from the page; for a different domain, answer CORS requests in your route.

## Script tag

```html
<a data-inverse-link="withdrawal" href="/widerruf"></a>        <!-- Vertrag widerrufen -->
<a data-inverse-link="cancellation" href="/kuendigen"></a>     <!-- Verträge hier kündigen -->

<!-- on /widerruf -->
<div data-inverse-form="withdrawal" data-endpoint="https://shop.example.com/api/inverse"></div>

<script src="https://cdn.jsdelivr.net/npm/@sweberdev/inverse@0.3/dist/inverse.global.js" defer></script>
```

The script (about 10 kB gzipped, all languages included) mounts every element with `data-inverse-form` and fills every empty link with `data-inverse-link` once the page has loaded. The same file is on unpkg: `https://unpkg.com/@sweberdev/inverse@0.3/dist/inverse.global.js`. Pin an exact version (`@0.3.0`) and add an `integrity` hash if your content security policy asks for it, or copy the file to your own server.

| Attribute | |
|---|---|
| `data-inverse-form` | `withdrawal` or `cancellation` |
| `data-endpoint` | URL of your handler (required) |
| `data-locale` | `de`, `en`, `fr`, `it`, `nl`, `es`, `pl`; defaults to the page's `lang`, then `de` |
| `data-show-items` | withdrawal: field for a partial withdrawal |
| `data-show-message` | optional free-text message |
| `data-contract-ref` | prefill the order or contract number |
| `data-download-name` | file name of the downloadable copy |

Links with text of their own keep it; empty links get the statutory label in the page's language.

Add `data-manual` to the script tag to skip the automatic mount and call the API yourself. Everything is on `window.Inverse`:

```html
<script src="https://cdn.jsdelivr.net/npm/@sweberdev/inverse@0.3/dist/inverse.global.js" data-manual></script>
<script>
  Inverse.mountCancellationForm(document.getElementById("kuendigen"), {
    endpoint: "/api/inverse",
    locale: "de",
    defaultValues: { email: "erika@example.com" },
    onSuccess: (result) => console.log(result.id),
  });
</script>
```

### WordPress

Add the script once, for example with a "header and footer scripts" plugin or `wp_enqueue_script` in your theme, put the link into the footer menu or a footer widget as a "Custom HTML" block, and create the pages `/widerruf` and `/kuendigen` with a "Custom HTML" block containing the `<div data-inverse-form …>`. The handler runs wherever you host Node.js or an edge function.

### Shopify

In the theme editor, add the `<script>` to `layout/theme.liquid` before `</body>`, the links to the footer section, and a page with the `<div data-inverse-form …>` in a "Custom Liquid" section. Use the full URL of your handler as `data-endpoint`.

## From npm

```ts
import { createInverseLink, mountWithdrawalForm } from "@sweberdev/inverse/ui";

document.querySelector("footer")?.append(createInverseLink({ kind: "withdrawal", href: "/widerruf" }));

const form = mountWithdrawalForm(document.getElementById("widerruf")!, {
  endpoint: "/api/inverse",
  locale: "de",
  showItems: true,
});
// later: form.destroy();
```

| Function | |
|---|---|
| `mountDeclarationForm(element, options)` | renders the complete flow into `element`, returns `{ flow, destroy() }` |
| `mountWithdrawalForm(element, options)`, `mountCancellationForm(element, options)` | the same with a fixed `kind` |
| `createInverseLink({ kind, href, locale?, className? })` | an `<a>` with the statutory label |
| `autoMount(root?)` | mounts everything marked with data attributes below `root` (default `document`) |
| `createDeclarationFlow(options)` | the state machine without any DOM, for your own UI |

Options of `mountDeclarationForm` are the props of the React [`DeclarationFlow`](/inverse/docs/guides/react): `kind`, `endpoint`, `locale`, `messages`, `defaultValues`, `contracts`, `showItems`, `showMessage`, `intro` (text or a DOM node), `downloadName`, `className`, `onSuccess` and `submit`.

## Accessibility and styling

The markup is the same as in the React components: every field has a `<label>`, errors are linked with `aria-describedby` and `aria-invalid`, focus moves to the first invalid field or to the heading of the next step, the receipt is announced with `aria-live` and a failed submission with `role="alert"`. The forms are unstyled; use the classes from the [React guide](/inverse/docs/guides/react#styling).

## Your own UI

```ts
import { createDeclarationFlow } from "@sweberdev/inverse/ui";

const flow = createDeclarationFlow({ kind: "cancellation", endpoint: "/api/inverse" });
flow.subscribe((state) => render(state)); // state.step, values, errors, failed, summary, result
flow.setValue("name", "Erika Muster");
flow.review(); // validates, moves to "review"
await flow.confirm(); // posts, moves to "done"
```

Keep the two steps and the labels from `flow.messages` (`withdrawal.confirm`, `cancellation.confirm`).
