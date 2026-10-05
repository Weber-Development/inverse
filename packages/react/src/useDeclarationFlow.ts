import {
  type CancellationInput,
  type DeclarationKind,
  declarationFields,
  getMessages,
  type HandlerResult,
  type HandlerSuccess,
  HONEYPOT_FIELD,
  type Locale,
  type MessageOverrides,
  type Messages,
  type ValidationError,
  validate,
  type WithdrawalInput,
} from "@sweberdev/inverse";
import { useCallback, useMemo, useState } from "react";

export type FlowStep = "form" | "review" | "sending" | "done";

export type FlowValues = {
  name: string;
  email: string;
  contractRef: string;
  items: string;
  message: string;
  cancellationType: "ordinary" | "extraordinary";
  reason: string;
  effectiveDate: string;
  [HONEYPOT_FIELD]: string;
};

export interface UseDeclarationFlowOptions {
  kind: DeclarationKind;
  /** URL of the route created with `createInverseHandler`. */
  endpoint: string;
  locale?: Locale;
  messages?: MessageOverrides;
  /** Prefill known values, e.g. the order number from a link in the order e-mail. */
  defaultValues?: Partial<Omit<FlowValues, typeof HONEYPOT_FIELD>>;
  onSuccess?: (result: HandlerSuccess) => void;
  /** Replace `fetch`, e.g. in tests or for a demo without a server. */
  submit?: (body: Record<string, unknown>) => Promise<HandlerResult>;
}

const EMPTY: FlowValues = {
  name: "",
  email: "",
  contractRef: "",
  items: "",
  message: "",
  cancellationType: "ordinary",
  reason: "",
  effectiveDate: "",
  [HONEYPOT_FIELD]: "",
};

function toInput(kind: DeclarationKind, v: FlowValues): Record<string, unknown> {
  const base = { name: v.name, email: v.email, contractRef: v.contractRef, message: v.message };
  if (kind === "withdrawal") return { ...base, items: v.items };
  return {
    ...base,
    cancellationType: v.cancellationType,
    reason: v.reason,
    effectiveDate: v.effectiveDate || "earliest",
  };
}

/** State machine for the two-step flow: enter details → confirm → receipt. Bring your own UI. */
export function useDeclarationFlow(options: UseDeclarationFlowOptions) {
  const { kind, endpoint, locale = "de", onSuccess, submit } = options;
  const m: Messages = useMemo(
    () => getMessages(locale, options.messages),
    [locale, options.messages],
  );
  const [values, setValues] = useState<FlowValues>({ ...EMPTY, ...options.defaultValues });
  const [step, setStep] = useState<FlowStep>("form");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<HandlerSuccess | null>(null);
  const [parsed, setParsed] = useState<WithdrawalInput | CancellationInput | null>(null);

  const setValue = useCallback(<K extends keyof FlowValues>(key: K, value: FlowValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => prev.filter((e) => e.field !== key));
  }, []);

  const review = useCallback(() => {
    const r = validate(kind, toInput(kind, values));
    if (!r.ok) {
      setErrors(r.errors);
      return false;
    }
    setErrors([]);
    setParsed(r.value);
    setStep("review");
    return true;
  }, [kind, values]);

  const back = useCallback(() => setStep("form"), []);

  const confirm = useCallback(async () => {
    if (!parsed) return;
    setStep("sending");
    setFailed(false);
    const body = { kind, locale, data: parsed, [HONEYPOT_FIELD]: values[HONEYPOT_FIELD] };
    try {
      const res: HandlerResult = submit
        ? await submit(body)
        : await fetch(endpoint, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
          }).then((r) => r.json() as Promise<HandlerResult>);
      if (res.ok) {
        setResult(res);
        setStep("done");
        onSuccess?.(res);
        return;
      }
      if (res.error === "invalid" && res.errors) {
        setErrors(res.errors);
        setStep("form");
        return;
      }
      setFailed(true);
      setStep("review");
    } catch {
      setFailed(true);
      setStep("review");
    }
  }, [parsed, kind, locale, values, submit, endpoint, onSuccess]);

  const summary = useMemo(
    () => (parsed ? declarationFields(kind, parsed, locale, options.messages) : []),
    [parsed, kind, locale, options.messages],
  );

  const errorFor = useCallback(
    (field: string) => {
      const e = errors.find((x) => x.field === field);
      return e ? m.errors[e.code] : undefined;
    },
    [errors, m],
  );

  return {
    kind,
    locale,
    messages: m,
    step,
    values,
    setValue,
    errors,
    errorFor,
    failed,
    summary,
    result,
    review,
    back,
    confirm,
  };
}

export type DeclarationFlowState = ReturnType<typeof useDeclarationFlow>;
