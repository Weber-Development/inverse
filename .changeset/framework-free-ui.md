---
"@sweberdev/inverse": minor
"@sweberdev/inverse-react": minor
---

Framework-free forms and three new languages.

- `@sweberdev/inverse/ui`: `mountDeclarationForm(element, options)` (plus `mountWithdrawalForm`, `mountCancellationForm`) renders the complete two-step withdrawal or cancellation flow without React and posts to the existing handler. Same markup, classes and accessibility as the React components: labels, `aria-describedby` errors, focus management, `aria-live` receipt. Also `createInverseLink()`, `createDeclarationFlow()` (the state machine without DOM) and `autoMount()`.
- `dist/inverse.global.js`: a self-contained script for WordPress, Shopify themes and static sites, served by jsDelivr and unpkg (`https://cdn.jsdelivr.net/npm/@sweberdev/inverse@0.3/dist/inverse.global.js`). Exposes `window.Inverse` and mounts `<div data-inverse-form="withdrawal" data-endpoint="…">` and fills `<a data-inverse-link="cancellation">` automatically.
- New locales `nl`, `es` and `pl` for all form texts, errors, receipts and the downloadable copy. The withdrawal labels are the wording of Article 11a in those language versions of the directive; all other texts are translations that should be reviewed by a native speaker or a lawyer before production use.
- `inverse check` recognises the Dutch, Spanish and Polish button labels.
