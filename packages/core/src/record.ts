import { getMessages, type MessageOverrides } from "./i18n";
import type {
  CancellationInput,
  Company,
  DeclarationInput,
  DeclarationKind,
  DeclarationRecord,
  Locale,
  WithdrawalInput,
} from "./types";

const INTL_LOCALE: Record<Locale, string> = {
  de: "de-DE",
  en: "en-GB",
  fr: "fr-FR",
  it: "it-IT",
  nl: "nl-NL",
  es: "es-ES",
  pl: "pl-PL",
};

/** A short, readable, random reference such as `W-7K3QX9PD`. */
export function createReference(kind: DeclarationKind): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `${kind === "withdrawal" ? "W" : "K"}-${out}`;
}

export interface CreateRecordOptions {
  locale?: Locale;
  /** Defaults to the current time. Always set on the server, never from the request. */
  now?: Date;
  id?: string;
  endsAt?: string;
}

export function createRecord<K extends DeclarationKind>(
  kind: K,
  data: DeclarationInput<K>,
  options: CreateRecordOptions = {},
): DeclarationRecord<K> {
  const record: DeclarationRecord<K> = {
    id: options.id ?? createReference(kind),
    kind,
    receivedAt: (options.now ?? new Date()).toISOString(),
    locale: options.locale ?? "de",
    data,
  };
  if (options.endsAt) record.endsAt = options.endsAt;
  return record;
}

export interface FormatOptions {
  /** IANA time zone for dates in receipts. Defaults to Europe/Berlin. */
  timeZone?: string;
  messages?: MessageOverrides;
}

export function formatDateTime(iso: string, locale: Locale, timeZone = "Europe/Berlin"): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(iso));
}

export function formatDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate.slice(0, 10)}T00:00:00Z`));
}

/**
 * The content of the declaration as label/value pairs, in the consumer's language.
 * Used for the review step, the receipt and the downloadable copy.
 */
export function declarationFields(
  kind: DeclarationKind,
  data: DeclarationInput,
  locale: Locale = "de",
  overrides?: MessageOverrides,
): Array<[label: string, value: string]> {
  const m = getMessages(locale, overrides);
  const rows: Array<[string, string]> = [
    [m.fields.name, data.name],
    [m.fields.email, data.email],
    [m.fields.contractRef, data.contractRef],
  ];
  if (kind === "withdrawal") {
    const w = data as WithdrawalInput;
    if (w.items?.length) rows.push([m.fields.items, w.items.join(", ")]);
  } else {
    const c = data as CancellationInput;
    const type = c.cancellationType ?? "ordinary";
    rows.push([m.fields.cancellationType, m.fields[type]]);
    if (type === "extraordinary" && c.reason) rows.push([m.fields.reason, c.reason]);
    const date = c.effectiveDate ?? "earliest";
    rows.push([
      m.fields.effectiveDate,
      date === "earliest" ? m.fields.earliest : formatDate(date, locale),
    ]);
  }
  if (data.message) rows.push([m.fields.message, data.message]);
  return rows;
}

/**
 * A plain-text copy of the declaration with date and time of submission. Offer it as a
 * download so the consumer can keep it (§ 312k Abs. 4 BGB).
 */
export function declarationText(
  record: DeclarationRecord,
  options: FormatOptions & { company?: Company } = {},
): string {
  const m = getMessages(record.locale, options.messages);
  const title = record.kind === "withdrawal" ? m.withdrawal.doneTitle : m.cancellation.doneTitle;
  const lines = [
    title,
    "",
    `${m.receipt.reference}: ${record.id}`,
    `${m.receipt.receivedAt}: ${formatDateTime(record.receivedAt, record.locale, options.timeZone)}`,
  ];
  if (options.company) lines.push(options.company.name);
  lines.push("", `${m.receipt.content}:`);
  for (const [label, value] of declarationFields(
    record.kind,
    record.data,
    record.locale,
    options.messages,
  )) {
    lines.push(`${label}: ${value}`);
  }
  if (record.kind === "cancellation" && record.endsAt) {
    lines.push("", `${m.receipt.endsAt} ${formatDate(record.endsAt, record.locale)}`);
  }
  return `${lines.join("\n")}\n`;
}
