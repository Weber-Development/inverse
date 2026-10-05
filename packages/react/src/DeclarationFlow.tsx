import { format, HONEYPOT_FIELD } from "@sweberdev/inverse";
import { type FormEvent, type ReactNode, useEffect, useId, useRef } from "react";
import { type UseDeclarationFlowOptions, useDeclarationFlow } from "./useDeclarationFlow";

export interface DeclarationFlowProps extends UseDeclarationFlowOptions {
  className?: string;
  /** Show the free-text message field. Defaults to `false`. */
  showMessage?: boolean;
  /** Withdrawal only: show the field for a partial withdrawal. Defaults to `false`. */
  showItems?: boolean;
  /** Content above the form, e.g. your own intro text. Replaces the default intro. */
  intro?: ReactNode;
  /** File name of the downloadable copy. */
  downloadName?: string;
  /**
   * Contracts of a signed-in customer. Renders a select instead of the free-text contract
   * field. Logging in must stay optional: keep the free-text form for everyone else.
   */
  contracts?: ContractOption[];
}

export interface ContractOption {
  /** Sent as `contractRef`, e.g. the order or customer number. */
  value: string;
  /** Shown in the select, e.g. "Premium plan, order 1042". */
  label: string;
}

function download(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * The complete two-step flow for § 356a BGB (withdrawal) or § 312k BGB (cancellation):
 * a form, a review step with the statutory confirm button, and a receipt with download.
 * Unstyled: every element has an `inverse-*` class.
 */
export function DeclarationFlow(props: DeclarationFlowProps) {
  const only = props.contracts?.length === 1 ? props.contracts[0]?.value : undefined;
  const flow = useDeclarationFlow(
    only && !props.defaultValues?.contractRef
      ? { ...props, defaultValues: { ...props.defaultValues, contractRef: only } }
      : props,
  );
  const { kind, messages: m, step, values, setValue, errorFor } = flow;
  const t = kind === "withdrawal" ? m.withdrawal : m.cancellation;
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (step !== "sending") heading.current?.focus();
  }, [step]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step === "form") flow.review();
    else if (step === "review") void flow.confirm();
  };

  const input = (
    name: "name" | "email" | "contractRef" | "reason" | "effectiveDate",
    label: string,
    type = "text",
    autoComplete?: string,
  ) => {
    const err = errorFor(name);
    return (
      <div className="inverse-field" data-invalid={err ? "" : undefined}>
        <label htmlFor={`${id}-${name}`}>{label}</label>
        <input
          id={`${id}-${name}`}
          name={name}
          type={type}
          autoComplete={autoComplete}
          value={values[name]}
          onChange={(e) => setValue(name, e.target.value)}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${id}-${name}-error` : undefined}
        />
        {err && (
          <p className="inverse-error" id={`${id}-${name}-error`}>
            {err}
          </p>
        )}
      </div>
    );
  };

  const textarea = (name: "items" | "message" | "reason", label: string) => {
    const err = errorFor(name);
    return (
      <div className="inverse-field" data-invalid={err ? "" : undefined}>
        <label htmlFor={`${id}-${name}`}>{label}</label>
        <textarea
          id={`${id}-${name}`}
          name={name}
          rows={3}
          value={values[name]}
          onChange={(e) => setValue(name, e.target.value)}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${id}-${name}-error` : undefined}
        />
        {err && (
          <p className="inverse-error" id={`${id}-${name}-error`}>
            {err}
          </p>
        )}
      </div>
    );
  };

  const contractSelect = (contracts: ContractOption[]) => {
    const err = errorFor("contractRef");
    return (
      <div className="inverse-field" data-invalid={err ? "" : undefined}>
        <label htmlFor={`${id}-contractRef`}>{m.fields.contractRef}</label>
        <select
          id={`${id}-contractRef`}
          name="contractRef"
          value={values.contractRef}
          onChange={(e) => setValue("contractRef", e.target.value)}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${id}-contractRef-error` : undefined}
        >
          {contracts.length > 1 && <option value="">–</option>}
          {contracts.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {err && (
          <p className="inverse-error" id={`${id}-contractRef-error`}>
            {err}
          </p>
        )}
      </div>
    );
  };

  const className = ["inverse-flow", props.className].filter(Boolean).join(" ");

  if (step === "done" && flow.result) {
    const result = flow.result;
    return (
      <section className={className} data-kind={kind} data-step="done" aria-live="polite">
        <h2 ref={heading} tabIndex={-1} className="inverse-title">
          {t.doneTitle}
        </h2>
        <p className="inverse-text">{format(t.doneText, { email: values.email })}</p>
        <pre className="inverse-copy">{result.copy}</pre>
        <button
          type="button"
          className="inverse-button inverse-download"
          onClick={() => download(result.copy, props.downloadName ?? `${result.id}.txt`)}
        >
          {m.actions.download}
        </button>
      </section>
    );
  }

  return (
    <form className={className} data-kind={kind} data-step={step} onSubmit={onSubmit} noValidate>
      <h2 ref={heading} tabIndex={-1} className="inverse-title">
        {step === "form" ? t.title : t.reviewTitle}
      </h2>
      <div
        className="inverse-honeypot"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px" }}
      >
        <input
          tabIndex={-1}
          autoComplete="off"
          name={HONEYPOT_FIELD}
          value={values[HONEYPOT_FIELD]}
          onChange={(e) => setValue(HONEYPOT_FIELD, e.target.value)}
        />
      </div>

      {step === "form" ? (
        <>
          {props.intro ?? <p className="inverse-text">{t.intro}</p>}
          {input("name", m.fields.name, "text", "name")}
          {input("email", m.fields.email, "email", "email")}
          {props.contracts?.length
            ? contractSelect(props.contracts)
            : input("contractRef", m.fields.contractRef)}
          {kind === "withdrawal" && props.showItems && textarea("items", m.fields.items)}
          {kind === "cancellation" && (
            <>
              <fieldset className="inverse-field inverse-type">
                <legend>{m.fields.cancellationType}</legend>
                {(["ordinary", "extraordinary"] as const).map((type) => (
                  <label key={type}>
                    <input
                      type="radio"
                      name="cancellationType"
                      value={type}
                      checked={values.cancellationType === type}
                      onChange={() => setValue("cancellationType", type)}
                    />{" "}
                    {m.fields[type]}
                  </label>
                ))}
              </fieldset>
              {values.cancellationType === "extraordinary" && textarea("reason", m.fields.reason)}
              {input("effectiveDate", `${m.fields.effectiveDate} (${m.fields.earliest})`, "date")}
            </>
          )}
          {props.showMessage && textarea("message", m.fields.message)}
          <div className="inverse-actions">
            <button type="submit" className="inverse-button inverse-next">
              {m.actions.next}
            </button>
          </div>
        </>
      ) : (
        <>
          <dl className="inverse-summary">
            {flow.summary.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {flow.failed && (
            <p className="inverse-error" role="alert">
              {m.errors.network}
            </p>
          )}
          <div className="inverse-actions">
            <button type="button" className="inverse-button inverse-back" onClick={flow.back}>
              {m.actions.back}
            </button>
            <button
              type="submit"
              className="inverse-button inverse-confirm"
              disabled={step === "sending"}
              aria-busy={step === "sending" || undefined}
            >
              {t.confirm}
            </button>
          </div>
        </>
      )}
    </form>
  );
}

export function WithdrawalForm(props: Omit<DeclarationFlowProps, "kind">) {
  return <DeclarationFlow {...props} kind="withdrawal" />;
}

export function CancellationForm(props: Omit<DeclarationFlowProps, "kind">) {
  return <DeclarationFlow {...props} kind="cancellation" />;
}
