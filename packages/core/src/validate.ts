import type {
  CancellationInput,
  CancellationType,
  DeclarationInput,
  DeclarationKind,
  ValidationError,
  ValidationResult,
  WithdrawalInput,
} from "./types";

const LIMITS = { short: 200, ref: 120, long: 2000, items: 50 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function field(
  errors: ValidationError[],
  name: string,
  value: unknown,
  opts: { required?: boolean; max: number },
): string {
  const v = str(value);
  if (!v && opts.required) errors.push({ field: name, code: "required" });
  else if (v.length > opts.max) errors.push({ field: name, code: "too_long" });
  return v;
}

function common(errors: ValidationError[], input: Record<string, unknown>) {
  const name = field(errors, "name", input.name, { required: true, max: LIMITS.short });
  const email = field(errors, "email", input.email, { required: true, max: LIMITS.short });
  if (email && !EMAIL.test(email)) errors.push({ field: "email", code: "email" });
  const contractRef = field(errors, "contractRef", input.contractRef, {
    required: true,
    max: LIMITS.ref,
  });
  const message = field(errors, "message", input.message, { max: LIMITS.long });
  return { name, email, contractRef, message };
}

export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Checks the fields § 356a Abs. 2 BGB requires: name, contract and an address for the receipt. */
export function validateWithdrawal(input: unknown): ValidationResult<WithdrawalInput> {
  const raw = (input ?? {}) as Record<string, unknown>;
  const errors: ValidationError[] = [];
  const { name, email, contractRef, message } = common(errors, raw);

  let items: string[] | undefined;
  if (raw.items !== undefined && raw.items !== null && raw.items !== "") {
    const list = Array.isArray(raw.items) ? raw.items : String(raw.items).split(/\r?\n|,/);
    items = list.map(str).filter(Boolean);
    if (items.length > LIMITS.items || items.some((i) => i.length > LIMITS.short)) {
      errors.push({ field: "items", code: "too_long" });
    }
    if (items.length === 0) items = undefined;
  }

  if (errors.length) return { ok: false, errors };
  const value: WithdrawalInput = { name, email, contractRef };
  if (items) value.items = items;
  if (message) value.message = message;
  return { ok: true, value };
}

/** Checks the fields § 312k Abs. 2 BGB requires, including the reason for an extraordinary cancellation. */
export function validateCancellation(input: unknown): ValidationResult<CancellationInput> {
  const raw = (input ?? {}) as Record<string, unknown>;
  const errors: ValidationError[] = [];
  const { name, email, contractRef, message } = common(errors, raw);

  const typeRaw = str(raw.cancellationType) || "ordinary";
  if (typeRaw !== "ordinary" && typeRaw !== "extraordinary") {
    errors.push({ field: "cancellationType", code: "type" });
  }
  const cancellationType = typeRaw as CancellationType;

  const reason = field(errors, "reason", raw.reason, {
    required: cancellationType === "extraordinary",
    max: LIMITS.long,
  });

  const effectiveDate = str(raw.effectiveDate) || "earliest";
  if (effectiveDate !== "earliest" && !isValidIsoDate(effectiveDate)) {
    errors.push({ field: "effectiveDate", code: "date" });
  }

  if (errors.length) return { ok: false, errors };
  const value: CancellationInput = { name, email, contractRef, cancellationType, effectiveDate };
  if (reason && cancellationType === "extraordinary") value.reason = reason;
  if (message) value.message = message;
  return { ok: true, value };
}

export function validate<K extends DeclarationKind>(
  kind: K,
  input: unknown,
): ValidationResult<DeclarationInput<K>> {
  return (
    kind === "withdrawal" ? validateWithdrawal(input) : validateCancellation(input)
  ) as ValidationResult<DeclarationInput<K>>;
}
