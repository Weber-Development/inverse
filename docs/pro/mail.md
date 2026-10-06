---
title: Mail
description: Receipts in your branding, team notifications and ready-made transports.
---

```ts
import { brandedReceipts, resend } from "@weber-development/inverse-mail";

const mail = brandedReceipts({
  brand: {
    company: { name: "Acme GmbH", address: "Musterweg 1, 10115 Berlin", email: "hallo@acme.de" },
    logoUrl: "https://acme.de/logo.png",
    color: "#0f766e",
    links: [{ label: "Impressum", url: "https://acme.de/impressum" }],
  },
  transport: resend({ apiKey: process.env.RESEND_API_KEY!, from: "Acme <service@acme.de>" }),
  team: { to: "service@acme.de" },
  archiveBcc: "archiv@acme.de",
});

export const POST = createInverseHandler({ company, onDeclaration: save, sendReceipt: mail.sendReceipt });
```

## Branded receipt

The receipt keeps everything the law requires (content, date and time of receipt, end date) and adds your logo, colour and footer links. Texts in every language of the free package (German, English, French, Italian, Dutch, Spanish, Polish), with the same overrides.

## Team notification

With `team`, your team gets a separate e-mail for every declaration, with what to do next:

- **Withdrawal**: refund due at the latest 14 days after receipt (§ 357 BGB), with the date.
- **Cancellation**: the end date, or a reminder that the consumer still needs one.

## Team digest

One e-mail a week (or a day) with everything that needs doing, built from the records you already store. It lists refunds that are due after a withdrawal (14 days after receipt, § 357 BGB), contracts that end within the next two weeks, cancellations whose end date you have not sent yet, and all declarations received in the period.

```ts
import { teamDigest } from "@weber-development/inverse-mail";

// e.g. a cron job every Monday at 7:00
const records = (await ledger.entries())
  .filter((e) => e.type === "declaration" && e.payload !== null)
  .map((e) => e.payload);
const digest = teamDigest(records, { locale: "de", days: 7, upcomingDays: 14 });
await transport.send({ from: "service@acme.de", to: "team@acme.de", ...digest });
```

| Option | |
|---|---|
| `days` | declarations received in this many days are listed as new (default 7) |
| `upcomingDays` | refunds and contract ends within this many days are listed as due (default 14) |
| `refundDays` | days after receipt a refund is due (default 14) |
| `locale` | `de` (default) or `en` |
| `now` | reference time, e.g. in tests |

`dueItems(records, options)` returns the due list as data (`{ kind, record, date, daysLeft }`) if you want to show it in your back office instead.

## Transports

`resend`, `postmark`, `sendgrid`, `brevo` and `mailgun` use the providers' HTTP APIs with `fetch`, no SDK needed. `nodemailer(transporter)` wraps an existing nodemailer transport for SMTP. Any object with `send({ from?, to, bcc?, replyTo?, subject, text, html })` works too.
