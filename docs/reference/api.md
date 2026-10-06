---
title: API
description: All exports of @sweberdev/inverse.
---

## Validation

- `validateWithdrawal(input)`, `validateCancellation(input)`, `validate(kind, input)`: return `{ ok: true, value }` or `{ ok: false, errors: [{ field, code }] }`. Codes: `required`, `email`, `too_long`, `date`, `type`.

## Records and receipts

- `createRecord(kind, data, { locale?, now?, id?, endsAt? })`
- `createReference(kind)`: random reference such as `W-7K3QX9PD`
- `renderReceipt(record, { company, timeZone?, messages? })`: `{ to, subject, text, html }`
- `declarationText(record, { company?, timeZone?, messages? })`: plain-text copy for the download
- `declarationFields(kind, data, locale?, messages?)`: label/value pairs for your own review step
- `formatDateTime(iso, locale, timeZone?)`, `formatDate(isoDate, locale)`

## Deadlines

- `withdrawalDeadline({ start, informed?, isHoliday? })`: last day of the withdrawal period
- `isWithinWithdrawalPeriod({ start, at?, timeZone?, informed?, isHoliday? })`
- `withdrawalStatus({ start, at?, timeZone?, informed?, isHoliday? })`: `{ deadline, open, daysLeft }`
- `contractEndDate({ received, notice, termEnd?, requested? })`
- `addPeriod(date, { days?, weeks?, months? })`, `nextWorkingDay(date, isHoliday?)`, `toIsoDate(date, timeZone?)`

## Handler

- `createInverseHandler(options)`: `(request: Request) => Promise<Response>`
- `createNodeHandler(options)`: `(req, res) => Promise<void>` for Express, Fastify, `node:http` and the Pages Router
- `toWebRequest(req)`: Node request to Fetch API `Request`
- `handleDeclaration(body, options)`: same logic, returns the result object
- `HONEYPOT_FIELD`

## Browser (`@sweberdev/inverse/ui`)

Also available as `window.Inverse` from `dist/inverse.global.js`, see [Plain HTML](/inverse/docs/guides/plain-html).

- `mountDeclarationForm(element, options)`, `mountWithdrawalForm(element, options)`, `mountCancellationForm(element, options)`: `{ flow, destroy() }`
- `createDeclarationFlow(options)`: `{ getState(), subscribe(listener), setValue(key, value), errorFor(field), review(), back(), confirm(), messages }`
- `createInverseLink({ kind, href, locale?, className? })`: `HTMLAnchorElement`
- `autoMount(root?)`: mounts `[data-inverse-form]` and fills `[data-inverse-link]`

## Texts

- `getMessages(locale, overrides?)`, `messages`, `locales`, `isLocale(value)`, `format(template, values)`
- Locales: `de`, `en`, `fr`, `it`, `nl`, `es`, `pl`. The Dutch, Spanish and Polish texts are new in 0.3 and should be reviewed by a native speaker or a lawyer before production use; override single texts with `messages`.

## Page check

- `checkUrl(url, kinds?, init?)`, `checkHtml(html, kinds?)`, `extractControls(html)`, `checkControls(controls, kinds)`
