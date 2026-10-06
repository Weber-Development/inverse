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

## Transports

`resend`, `postmark`, `sendgrid`, `brevo` and `mailgun` use the providers' HTTP APIs with `fetch`, no SDK needed. `nodemailer(transporter)` wraps an existing nodemailer transport for SMTP. Any object with `send({ from?, to, bcc?, replyTo?, subject, text, html })` works too.
