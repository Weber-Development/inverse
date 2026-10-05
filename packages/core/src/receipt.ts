import { format, getMessages } from "./i18n";
import { declarationFields, type FormatOptions, formatDate, formatDateTime } from "./record";
import type { Company, DeclarationRecord, Receipt } from "./types";

export interface ReceiptOptions extends FormatOptions {
  company: Company;
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );

/**
 * Builds the acknowledgement of receipt the trader has to send without delay on a durable
 * medium: the content of the declaration plus date and time of receipt (§ 356a Abs. 4,
 * § 312k Abs. 3 BGB), and for a cancellation the date the contract ends, if known.
 */
export function renderReceipt(record: DeclarationRecord, options: ReceiptOptions): Receipt {
  const m = getMessages(record.locale, options.messages);
  const isWithdrawal = record.kind === "withdrawal";
  const subject = format(
    isWithdrawal ? m.receipt.withdrawalSubject : m.receipt.cancellationSubject,
    { id: record.id },
  );
  const greeting = format(m.receipt.greeting, { name: record.data.name });
  const body = isWithdrawal ? m.receipt.withdrawalBody : m.receipt.cancellationBody;
  const receivedAt = formatDateTime(record.receivedAt, record.locale, options.timeZone);
  const rows = declarationFields(record.kind, record.data, record.locale, options.messages);

  let ending: string | undefined;
  if (!isWithdrawal) {
    ending = record.endsAt
      ? `${m.receipt.endsAt} ${formatDate(record.endsAt, record.locale)}.`
      : m.receipt.endsAtUnknown;
  }

  const c = options.company;
  const companyLines = [c.name, c.address, c.email, c.website].filter(Boolean) as string[];

  const text = [
    `${greeting},`,
    "",
    body,
    "",
    `${m.receipt.reference}: ${record.id}`,
    `${m.receipt.receivedAt}: ${receivedAt}`,
    ...rows.map(([label, value]) => `${label}: ${value}`),
    ...(ending ? ["", ending] : []),
    "",
    m.receipt.footer,
    "",
    ...companyLines,
  ].join("\n");

  const tr = (label: string, value: string) =>
    `<tr><th align="left" style="padding:4px 12px 4px 0;font-weight:600;vertical-align:top">${escapeHtml(label)}</th><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`;

  const html = `<!doctype html><html lang="${record.locale}"><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head><body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#111;line-height:1.5;max-width:600px;margin:0 auto;padding:24px">
<p>${escapeHtml(greeting)},</p>
<p>${escapeHtml(body)}</p>
<table role="presentation" style="border-collapse:collapse;margin:16px 0">
${tr(m.receipt.reference, record.id)}
${tr(m.receipt.receivedAt, receivedAt)}
${rows.map(([label, value]) => tr(label, value)).join("\n")}
</table>
${ending ? `<p><strong>${escapeHtml(ending)}</strong></p>` : ""}
<p style="color:#555;font-size:14px">${escapeHtml(m.receipt.footer)}</p>
<p style="color:#555;font-size:14px">${companyLines.map(escapeHtml).join("<br>")}</p>
</body></html>`;

  return { to: record.data.email, subject, text, html };
}
