---
title: Inverse Pro
description: Tamper-evident evidence, site-wide audits and branded e-mails for shops, SaaS teams and agencies.
---

Inverse Pro adds three packages to the free handler and components. They run on your own infrastructure and send nothing to us.

| Package | What it does |
|---|---|
| [`inverse-ledger`](/inverse/docs/pro/ledger) | Stores every declaration and receipt in a hash-chained, tamper-evident log and exports an evidence sheet per declaration. |
| [`inverse-audit`](/inverse/docs/pro/audit) | Crawls a whole site from its sitemap, checks every page for both buttons, follows them to the form and checks it works without login. HTML report for clients, exit code for CI. |
| [`inverse-mail`](/inverse/docs/pro/mail) | Receipts in your branding, a notification to your team with the next steps and their due dates, and transports for Resend, Postmark, SendGrid, Brevo, Mailgun and nodemailer. |

The packages read the same records the free handler creates. They do not depend on `@sweberdev/inverse`.

## Licence and installation

Inverse Pro is licensed per person: Freelancer (1 person), Agency (up to 10) and Lifetime (up to 10, one payment). Your clients and their sites need no licence of their own. After a purchase you get read access to the customer repository `Weber-Development/inverse-pro-dist`; the packages are installed from GitHub Packages with a token. The full guide is `INSTALL.md` in that repository.

```ini
# .npmrc
@weber-development:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${INVERSE_PRO_TOKEN}
```

```sh
pnpm add @weber-development/inverse-ledger @weber-development/inverse-audit @weber-development/inverse-mail
```

After cancelling, every version you already received keeps working. Only updates and repository access end. There is no licence key and no phone-home.
