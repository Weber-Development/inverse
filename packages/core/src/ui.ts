import type { HandlerResult, HandlerSuccess } from "./handler";
import { format, getMessages, isLocale, type MessageOverrides, type Messages } from "./i18n";
import { declarationFields } from "./record";
import type {
  CancellationInput,
  DeclarationKind,
  Locale,
  ValidationError,
  WithdrawalInput,
} from "./types";
import { validate } from "./validate";

export { format, getMessages, isLocale, locales } from "./i18n";

// Same value as HONEYPOT_FIELD in ./handler. Not imported from there so the browser build
// does not pull in the server code.
const HONEYPOT = "inverse_hp";

export type FlowStep = "form" | "review" | "sending" | "done";

export interface FlowValues {
  name: string;
  email: string;
  contractRef: string;
  items: string;
  message: string;
  cancellationType: "ordinary" | "extraordinary";
  reason: string;
  effectiveDate: string;
  inverse_hp: string;
}

export interface FlowOptions {
  kind: DeclarationKind;
  /** URL of the route created with `createInverseHandler`. */
  endpoint: string;
  /** Defaults to `de`. */
  locale?: Locale;
  messages?: MessageOverrides;
  /** Prefill known values, e.g. the order number from a link in the order e-mail. */
  defaultValues?: Partial<Omit<FlowValues, "inverse_hp">>;
  onSuccess?: (result: HandlerSuccess) => void;
  /** Replace `fetch`, e.g. in tests or for a demo without a server. */
  submit?: (body: Record<string, unknown>) => Promise<HandlerResult>;
}

export interface FlowState {
  step: FlowStep;
  values: FlowValues;
  errors: ValidationError[];
  /** The last submission failed (network or server error). */
  failed: boolean;
  /** Label/value pairs of the review step. */
  summary: Array<[label: string, value: string]>;
  result: HandlerSuccess | null;
}

export interface DeclarationFlowController {
  readonly kind: DeclarationKind;
  readonly locale: Locale;
  readonly messages: Messages;
  getState(): FlowState;
  setValue<K extends keyof FlowValues>(key: K, value: FlowValues[K]): void;
  /** Localised error text for a field, if it has one. */
  errorFor(field: string): string | undefined;
  /** Validates the values and moves to the review step. Returns `false` on errors. */
  review(): boolean;
  back(): void;
  /** Sends the declaration to the endpoint. */
  confirm(): Promise<void>;
  /** Called after every change. Returns an unsubscribe function. */
  subscribe(listener: (state: FlowState) => void): () => void;
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
  inverse_hp: "",
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

/**
 * State machine for the two-step flow without a framework: enter details → confirm →
 * receipt. The same steps as `useDeclarationFlow` in `@sweberdev/inverse-react`.
 */
export function createDeclarationFlow(options: FlowOptions): DeclarationFlowController {
  const { kind, endpoint, onSuccess, submit } = options;
  const locale = options.locale ?? "de";
  const m = getMessages(locale, options.messages);
  const listeners = new Set<(state: FlowState) => void>();
  let parsed: WithdrawalInput | CancellationInput | null = null;
  let state: FlowState = {
    step: "form",
    values: { ...EMPTY, ...options.defaultValues },
    errors: [],
    failed: false,
    summary: [],
    result: null,
  };

  const set = (patch: Partial<FlowState>) => {
    state = { ...state, ...patch };
    for (const listener of listeners) listener(state);
  };

  const flow: DeclarationFlowController = {
    kind,
    locale,
    messages: m,
    getState: () => state,
    setValue(key, value) {
      set({
        values: { ...state.values, [key]: value },
        errors: state.errors.filter((e) => e.field !== key),
      });
    },
    errorFor(field) {
      const e = state.errors.find((x) => x.field === field);
      return e ? m.errors[e.code] : undefined;
    },
    review() {
      if (state.step !== "form") return false;
      const r = validate(kind, toInput(kind, state.values));
      if (!r.ok) {
        set({ errors: r.errors });
        return false;
      }
      parsed = r.value;
      set({
        errors: [],
        step: "review",
        summary: declarationFields(kind, r.value, locale, options.messages),
      });
      return true;
    },
    back() {
      if (state.step === "review") set({ step: "form", failed: false });
    },
    async confirm() {
      if (!parsed || state.step !== "review") return;
      set({ step: "sending", failed: false });
      const body = { kind, locale, data: parsed, [HONEYPOT]: state.values.inverse_hp };
      try {
        const res: HandlerResult = submit
          ? await submit(body)
          : await fetch(endpoint, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(body),
            }).then((r) => r.json() as Promise<HandlerResult>);
        if (res.ok) {
          set({ step: "done", result: res });
          onSuccess?.(res);
          return;
        }
        if (res.error === "invalid" && res.errors) {
          set({ step: "form", errors: res.errors });
          return;
        }
        set({ step: "review", failed: true });
      } catch {
        set({ step: "review", failed: true });
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return flow;
}

export interface ContractOption {
  /** Sent as `contractRef`, e.g. the order or customer number. */
  value: string;
  /** Shown in the select, e.g. "Premium plan, order 1042". */
  label: string;
}

export interface MountOptions extends FlowOptions {
  /** Extra class on the root element (it always has `inverse-flow`). */
  className?: string;
  /** Show the free-text message field. Defaults to `false`. */
  showMessage?: boolean;
  /** Withdrawal only: show the field for a partial withdrawal. Defaults to `false`. */
  showItems?: boolean;
  /** Replaces the default intro text. A node is cloned on every render. */
  intro?: string | Node;
  /** File name of the downloadable copy. Defaults to `<reference>.txt`. */
  downloadName?: string;
  /**
   * Contracts of a signed-in customer. Renders a select instead of the free-text contract
   * field. Logging in must stay optional: keep the free-text form for everyone else.
   */
  contracts?: ContractOption[];
}

export interface MountedFlow {
  readonly flow: DeclarationFlowController;
  /** Removes the form and its listeners. */
  destroy(): void;
}

type Attrs = Record<string, string | boolean | number | undefined>;

function h(tag: string, attrs: Attrs = {}, ...children: Array<Node | string | false | undefined>) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    el.setAttribute(key, value === true ? "" : String(value));
  }
  for (const child of children) {
    if (child === false || child === undefined) continue;
    el.append(child);
  }
  return el;
}

function download(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

let seq = 0;

/**
 * Renders the complete two-step flow for § 356a BGB (withdrawal) or § 312k BGB
 * (cancellation) into `element`, without React: a form, a review step with the statutory
 * confirm button, and a receipt with download. Posts to the `createInverseHandler` route at
 * `options.endpoint`. Unstyled: every element has the same `inverse-*` class as the React
 * components.
 */
export function mountDeclarationForm(element: Element, options: MountOptions): MountedFlow {
  const only = options.contracts?.length === 1 ? options.contracts[0]?.value : undefined;
  const flow = createDeclarationFlow(
    only && !options.defaultValues?.contractRef
      ? { ...options, defaultValues: { ...options.defaultValues, contractRef: only } }
      : options,
  );
  const { kind, messages: m } = flow;
  const t = kind === "withdrawal" ? m.withdrawal : m.cancellation;
  const id = `inverse-${++seq}`;
  const className = ["inverse-flow", options.className].filter(Boolean).join(" ");
  let rendered: FlowState = flow.getState();
  let root: HTMLElement | undefined;

  const errorNode = (name: string, text: string) =>
    h("p", { class: "inverse-error", id: `${id}-${name}-error` }, text);

  const wireField = (control: HTMLElement, name: keyof FlowValues) => {
    const err = flow.errorFor(name);
    if (err) {
      control.setAttribute("aria-invalid", "true");
      control.setAttribute("aria-describedby", `${id}-${name}-error`);
    }
    control.addEventListener("input", () => {
      flow.setValue(name, (control as HTMLInputElement).value as never);
    });
    control.addEventListener("change", () => {
      flow.setValue(name, (control as HTMLInputElement).value as never);
    });
    const wrap = h(
      "div",
      { class: "inverse-field", "data-field": name, "data-invalid": Boolean(err) },
      h("label", { for: `${id}-${name}` }, labelFor(name)),
      control,
      err ? errorNode(name, err) : undefined,
    );
    return wrap;
  };

  const labelFor = (name: keyof FlowValues): string => {
    if (name === "effectiveDate") return `${m.fields.effectiveDate} (${m.fields.earliest})`;
    return m.fields[name as "name"];
  };

  const input = (name: keyof FlowValues, type = "text", autocomplete?: string) => {
    const el = h("input", {
      id: `${id}-${name}`,
      name,
      type,
      autocomplete,
    }) as HTMLInputElement;
    el.value = flow.getState().values[name];
    return wireField(el, name);
  };

  const textarea = (name: keyof FlowValues) => {
    const el = h("textarea", { id: `${id}-${name}`, name, rows: 3 }) as HTMLTextAreaElement;
    el.value = flow.getState().values[name];
    return wireField(el, name);
  };

  const select = (contracts: ContractOption[]) => {
    const el = h(
      "select",
      { id: `${id}-contractRef`, name: "contractRef" },
      contracts.length > 1 && h("option", { value: "" }, "–"),
      ...contracts.map((c) => h("option", { value: c.value }, c.label)),
    ) as HTMLSelectElement;
    el.value = flow.getState().values.contractRef;
    return wireField(el, "contractRef");
  };

  const heading = (text: string) => h("h2", { class: "inverse-title", tabindex: -1 }, text);

  const renderForm = (state: FlowState) => {
    const v = state.values;
    const nodes: Array<Node | false | undefined> = [];
    const intro = options.intro;
    nodes.push(
      intro === undefined
        ? h("p", { class: "inverse-text" }, t.intro)
        : typeof intro === "string"
          ? h("p", { class: "inverse-text" }, intro)
          : intro.cloneNode(true),
      input("name", "text", "name"),
      input("email", "email", "email"),
      options.contracts?.length ? select(options.contracts) : input("contractRef"),
    );
    if (kind === "withdrawal" && options.showItems) nodes.push(textarea("items"));
    if (kind === "cancellation") {
      const reason = textarea("reason");
      reason.hidden = v.cancellationType !== "extraordinary";
      const radios = (["ordinary", "extraordinary"] as const).map((type) => {
        const radio = h("input", {
          type: "radio",
          name: "cancellationType",
          value: type,
          checked: v.cancellationType === type,
        }) as HTMLInputElement;
        radio.addEventListener("change", () => {
          if (!radio.checked) return;
          flow.setValue("cancellationType", type);
          reason.hidden = type !== "extraordinary";
        });
        return h("label", {}, radio, " ", m.fields[type]);
      });
      nodes.push(
        h(
          "fieldset",
          { class: "inverse-field inverse-type" },
          h("legend", {}, m.fields.cancellationType),
          ...radios,
        ),
        reason,
        input("effectiveDate", "date"),
      );
    }
    if (options.showMessage) nodes.push(textarea("message"));
    nodes.push(
      h(
        "div",
        { class: "inverse-actions" },
        h("button", { type: "submit", class: "inverse-button inverse-next" }, m.actions.next),
      ),
    );
    return nodes;
  };

  const renderReview = (state: FlowState) => {
    const back = h(
      "button",
      { type: "button", class: "inverse-button inverse-back" },
      m.actions.back,
    );
    back.addEventListener("click", () => flow.back());
    const sending = state.step === "sending";
    return [
      h(
        "dl",
        { class: "inverse-summary" },
        ...state.summary.map(([label, value]) =>
          h("div", {}, h("dt", {}, label), h("dd", {}, value)),
        ),
      ),
      state.failed && h("p", { class: "inverse-error", role: "alert" }, m.errors.network),
      h(
        "div",
        { class: "inverse-actions" },
        back,
        h(
          "button",
          {
            type: "submit",
            class: "inverse-button inverse-confirm",
            disabled: sending,
            "aria-busy": sending ? "true" : undefined,
          },
          t.confirm,
        ),
      ),
    ];
  };

  const render = (state: FlowState) => {
    let next: HTMLElement;
    if (state.step === "done" && state.result) {
      const result = state.result;
      const button = h(
        "button",
        { type: "button", class: "inverse-button inverse-download" },
        m.actions.download,
      );
      button.addEventListener("click", () =>
        download(result.copy, options.downloadName ?? `${result.id}.txt`),
      );
      next = h(
        "section",
        { class: className, "data-kind": kind, "data-step": "done", "aria-live": "polite" },
        heading(t.doneTitle),
        h("p", { class: "inverse-text" }, format(t.doneText, { email: state.values.email })),
        h("pre", { class: "inverse-copy" }, result.copy),
        button,
      );
    } else {
      const honeypot = h("input", {
        tabindex: -1,
        autocomplete: "off",
        name: HONEYPOT,
      }) as HTMLInputElement;
      honeypot.value = state.values.inverse_hp;
      honeypot.addEventListener("input", () => flow.setValue("inverse_hp", honeypot.value));
      const form = h(
        "form",
        { class: className, "data-kind": kind, "data-step": state.step, novalidate: true },
        heading(state.step === "form" ? t.title : t.reviewTitle),
        h(
          "div",
          {
            class: "inverse-honeypot",
            "aria-hidden": "true",
            style: "position:absolute;left:-9999px",
          },
          honeypot,
        ),
        ...(state.step === "form" ? renderForm(state) : renderReview(state)),
      );
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const step = flow.getState().step;
        if (step === "form") flow.review();
        else if (step === "review") void flow.confirm();
      });
      next = form;
    }
    if (root) root.replaceWith(next);
    else element.append(next);
    root = next;
    rendered = state;
  };

  const focusHeading = () => root?.querySelector<HTMLElement>(".inverse-title")?.focus();

  const update = (state: FlowState) => {
    const prev = rendered;
    if (state.step !== prev.step || state.failed !== prev.failed) {
      if (state.step === "sending" && prev.step === "review") {
        const confirm = root?.querySelector<HTMLButtonElement>(".inverse-confirm");
        confirm?.setAttribute("disabled", "");
        confirm?.setAttribute("aria-busy", "true");
        root?.querySelector("[role='alert']")?.remove();
        rendered = state;
        return;
      }
      const stepChanged = state.step !== prev.step;
      render(state);
      if (stepChanged && state.errors.length === 0) focusHeading();
      else if (state.errors.length) focusFirstInvalid();
      return;
    }
    const added = state.errors.some((e) => !prev.errors.some((p) => p.field === e.field));
    if (added) {
      render(state);
      focusFirstInvalid();
      return;
    }
    // Errors removed while typing: patch the DOM so the focused field keeps its focus.
    for (const e of prev.errors) {
      if (state.errors.some((x) => x.field === e.field)) continue;
      const wrap = root?.querySelector(`[data-field="${e.field}"]`);
      if (!wrap) continue;
      wrap.removeAttribute("data-invalid");
      wrap.querySelector(".inverse-error")?.remove();
      const control = wrap.querySelector("input, textarea, select");
      control?.removeAttribute("aria-invalid");
      control?.removeAttribute("aria-describedby");
    }
    rendered = state;
  };

  const focusFirstInvalid = () =>
    root?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();

  render(flow.getState());
  const unsubscribe = flow.subscribe(update);

  return {
    flow,
    destroy() {
      unsubscribe();
      root?.remove();
      root = undefined;
    },
  };
}

/** {@link mountDeclarationForm} with `kind: "withdrawal"`. */
export function mountWithdrawalForm(
  element: Element,
  options: Omit<MountOptions, "kind">,
): MountedFlow {
  return mountDeclarationForm(element, { ...options, kind: "withdrawal" });
}

/** {@link mountDeclarationForm} with `kind: "cancellation"`. */
export function mountCancellationForm(
  element: Element,
  options: Omit<MountOptions, "kind">,
): MountedFlow {
  return mountDeclarationForm(element, { ...options, kind: "cancellation" });
}

export interface InverseLinkOptions {
  kind: DeclarationKind;
  /** The page with the form. It must work without login. */
  href: string;
  locale?: Locale;
  className?: string;
}

/**
 * The entry point: a link labelled "Vertrag widerrufen" or "Verträge hier kündigen" (or the
 * statutory wording of the chosen locale). Put it where it is visible on every page.
 */
export function createInverseLink(options: InverseLinkOptions): HTMLAnchorElement {
  const m = getMessages(options.locale ?? "de");
  const a = document.createElement("a");
  a.href = options.href;
  a.className = ["inverse-link", options.className].filter(Boolean).join(" ");
  a.dataset.kind = options.kind;
  a.textContent = options.kind === "withdrawal" ? m.withdrawal.button : m.cancellation.button;
  return a;
}

function flag(el: HTMLElement, name: string): boolean {
  const v = el.dataset[name];
  return v !== undefined && v !== "false";
}

function pageLocale(el: HTMLElement): Locale | undefined {
  const own = el.dataset.locale;
  if (isLocale(own)) return own;
  const lang = el.closest("[lang]")?.getAttribute("lang")?.slice(0, 2).toLowerCase();
  return isLocale(lang) ? lang : undefined;
}

const isKind = (v: unknown): v is DeclarationKind => v === "withdrawal" || v === "cancellation";

/**
 * Mounts every form and fills every link marked with data attributes below `root`. Runs
 * once per element; calling it again only picks up new elements.
 *
 * ```html
 * <div data-inverse-form="withdrawal" data-endpoint="/api/inverse"></div>
 * <a data-inverse-link="cancellation" href="/kuendigen"></a>
 * ```
 *
 * Form attributes: `data-endpoint` (required), `data-locale` (else the nearest `lang`),
 * `data-show-items`, `data-show-message`, `data-contract-ref` (prefill),
 * `data-download-name`.
 */
export function autoMount(root: ParentNode = document): MountedFlow[] {
  const mounted: MountedFlow[] = [];
  for (const el of root.querySelectorAll<HTMLElement>("[data-inverse-form]")) {
    if (el.dataset.inverseMounted !== undefined) continue;
    const kind = el.dataset.inverseForm;
    const endpoint = el.dataset.endpoint;
    if (!isKind(kind) || !endpoint) {
      console.warn(
        "[inverse] data-inverse-form needs withdrawal|cancellation and data-endpoint",
        el,
      );
      continue;
    }
    el.dataset.inverseMounted = "";
    const contractRef = el.dataset.contractRef;
    mounted.push(
      mountDeclarationForm(el, {
        kind,
        endpoint,
        locale: pageLocale(el),
        showItems: flag(el, "showItems"),
        showMessage: flag(el, "showMessage"),
        downloadName: el.dataset.downloadName,
        defaultValues: contractRef ? { contractRef } : undefined,
      }),
    );
  }
  for (const el of root.querySelectorAll<HTMLElement>("[data-inverse-link]")) {
    if (el.dataset.inverseMounted !== undefined) continue;
    const kind = el.dataset.inverseLink;
    if (!isKind(kind)) continue;
    el.dataset.inverseMounted = "";
    el.classList.add("inverse-link");
    el.dataset.kind = kind;
    if (!el.textContent?.trim()) {
      const m = getMessages(pageLocale(el) ?? "de");
      el.textContent = kind === "withdrawal" ? m.withdrawal.button : m.cancellation.button;
    }
  }
  return mounted;
}
