/** The two statutory flows Inverse covers. */
export type DeclarationKind = "withdrawal" | "cancellation";

/** Supported languages for labels, errors and receipts. */
export type Locale = "de" | "en" | "fr" | "it" | "nl" | "es" | "pl";

/** `ordinary` = ordentliche Kündigung, `extraordinary` = ausserordentliche Kündigung. */
export type CancellationType = "ordinary" | "extraordinary";

/** What the consumer enters or confirms in the withdrawal function (§ 356a Abs. 2 BGB). */
export interface WithdrawalInput {
  /** Name of the consumer. */
  name: string;
  /** Address the acknowledgement of receipt is sent to. */
  email: string;
  /** Order or contract number that identifies the contract. */
  contractRef: string;
  /** Optional: only these items or parts of the contract are withdrawn (partial withdrawal). */
  items?: string[];
  /** Optional free-text note. Never required by law. */
  message?: string;
}

/** What the consumer enters or confirms on the cancellation page (§ 312k Abs. 2 BGB). */
export interface CancellationInput {
  name: string;
  email: string;
  contractRef: string;
  /** Defaults to `ordinary`. */
  cancellationType?: CancellationType;
  /** Required for an extraordinary cancellation. */
  reason?: string;
  /** ISO date (YYYY-MM-DD) the contract should end, or `earliest` (the default). */
  effectiveDate?: string;
  message?: string;
}

export type DeclarationInput<K extends DeclarationKind = DeclarationKind> = K extends "withdrawal"
  ? WithdrawalInput
  : CancellationInput;

/** A declaration as received, with a server timestamp. This is what you store and confirm. */
export interface DeclarationRecord<K extends DeclarationKind = DeclarationKind> {
  /** Random reference, safe to show to the consumer. */
  id: string;
  kind: K;
  /** ISO 8601 timestamp of receipt, set by the server. */
  receivedAt: string;
  locale: Locale;
  data: DeclarationInput<K>;
  /** Cancellation only: ISO date the contract ends, if you know it when confirming. */
  endsAt?: string;
}

export interface ValidationError {
  field: string;
  code: "required" | "email" | "too_long" | "date" | "type";
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: ValidationError[] };

/** The trader, shown in receipts. */
export interface Company {
  name: string;
  address?: string;
  email?: string;
  website?: string;
}

/** A receipt on a durable medium: send it by e-mail. */
export interface Receipt {
  to: string;
  subject: string;
  text: string;
  html: string;
}
