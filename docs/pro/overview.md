---
title: Inverse Pro
description: Tamper-evident evidence, site-wide audits and branded e-mails for shops, SaaS teams and agencies.
---

Inverse Pro adds four packages and a WooCommerce plugin to the free handler and components. They run on your own infrastructure and send nothing to us.

| Package | What it does |
|---|---|
| [`inverse-ledger`](/inverse/docs/pro/ledger) | Stores every declaration and receipt in a hash-chained, tamper-evident log and exports an evidence sheet per declaration. |
| [Inbox](/inverse/docs/pro/inbox) (in `inverse-ledger`, stable from 3.0) | A web inbox for the cases: status, refund day, overdue marks and reply templates, without building an admin yourself. |
| [`inverse-audit`](/inverse/docs/pro/audit) | Crawls a whole site from its sitemap, checks every page for both buttons, follows them to the form and checks it works without login. HTML report for clients, exit code for CI. |
| [`inverse-mail`](/inverse/docs/pro/mail) | Receipts in your branding, a notification to your team with the next steps and their due dates, and transports for Resend, Postmark, SendGrid, Brevo, Mailgun and nodemailer. |
| `inverse-server` (new in 3.0) | One Docker image or process for any shop stack: takes withdrawal and cancellation declarations over HTTP, keeps them in the ledger (SQLite), mails the receipt, runs the case inbox, reminds your team before refund and contract-end deadlines and watches your pages for the buttons. Configured by environment variables. |
| WooCommerce plugin (new in 3.0) | A ZIP in each release of the customer repository. A page with the shortcode `[inverse_withdrawal]` finds the order by number and e-mail address, lets the customer pick items and sends the declaration from the shop server to your `inverse-server`. |

The libraries read the same records the free handler creates and do not depend on `@sweberdev/inverse`; `inverse-server` uses the free handler as its intake. Not verified yet: real mail providers, PostgreSQL for the server, running it behind a real proxy and pulling the image with a customer account. There is no plugin for Shopware or Magento.

## Licence and installation

Inverse Pro is licensed per person: Freelancer (1 person), Agency (up to 10) and Lifetime (up to 10, one payment). Your clients and their sites need no licence of their own. After a purchase you get read access to the customer repository `Weber-Development/inverse-pro-dist`; the packages are installed from GitHub Packages with a token. The full guide is `INSTALL.md` in that repository.

```ini
# .npmrc
@weber-development:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${INVERSE_PRO_TOKEN}
```

```sh
pnpm add @weber-development/inverse-ledger @weber-development/inverse-audit @weber-development/inverse-mail
# the service as a package (or use the Docker image from the customer repository)
pnpm add @weber-development/inverse-server
```

After cancelling, every version you already received keeps working. Only updates and repository access end. There is no licence key and no phone-home.
