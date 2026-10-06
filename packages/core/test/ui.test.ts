// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { type HandlerResult, HONEYPOT_FIELD } from "../src";
import {
  autoMount,
  createDeclarationFlow,
  createInverseLink,
  mountCancellationForm,
  mountWithdrawalForm,
} from "../src/ui";

afterEach(() => {
  document.body.innerHTML = "";
  document.documentElement.removeAttribute("lang");
});

const success = (kind: "withdrawal" | "cancellation" = "withdrawal"): HandlerResult => ({
  ok: true,
  id: "W-ABC",
  kind,
  receivedAt: "2026-10-05T12:00:00.000Z",
  copy: "Ihr Widerruf ist eingegangen\nReferenz: W-ABC\n",
});

function host() {
  const el = document.createElement("div");
  document.body.append(el);
  return el;
}

function field(root: ParentNode, label: string): HTMLInputElement {
  const l = [...root.querySelectorAll("label")].find((x) => x.textContent?.trim() === label);
  if (!l) throw new Error(`No label "${label}"`);
  const el = document.getElementById(l.htmlFor);
  if (!el) throw new Error(`Label "${label}" points nowhere`);
  return el as HTMLInputElement;
}

function type(el: HTMLInputElement, value: string) {
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

function button(root: ParentNode, name: string): HTMLButtonElement {
  const b = [...root.querySelectorAll("button")].find((x) => x.textContent === name);
  if (!b) throw new Error(`No button "${name}"`);
  return b;
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("createDeclarationFlow", () => {
  it("runs form → review → done without a DOM", async () => {
    const submit = vi.fn(async () => success());
    const flow = createDeclarationFlow({ kind: "withdrawal", endpoint: "/x", submit });
    const seen: string[] = [];
    flow.subscribe((s) => seen.push(s.step));
    expect(flow.review()).toBe(false);
    expect(flow.errorFor("name")).toBe("Bitte ausfüllen.");
    flow.setValue("name", "Erika");
    expect(flow.errorFor("name")).toBeUndefined();
    flow.setValue("email", "erika@example.com");
    flow.setValue("contractRef", "A-1");
    expect(flow.review()).toBe(true);
    expect(flow.getState().summary[2]).toEqual(["Bestell- oder Vertragsnummer", "A-1"]);
    await flow.confirm();
    expect(flow.getState().step).toBe("done");
    expect(seen).toContain("sending");
    expect(submit).toHaveBeenCalledWith({
      kind: "withdrawal",
      locale: "de",
      data: { name: "Erika", email: "erika@example.com", contractRef: "A-1" },
      [HONEYPOT_FIELD]: "",
    });
  });

  it("posts JSON to the endpoint with fetch", async () => {
    const fetchMock = vi.fn(async () => Response.json(success()));
    vi.stubGlobal("fetch", fetchMock);
    try {
      const flow = createDeclarationFlow({
        kind: "withdrawal",
        endpoint: "/api/inverse",
        locale: "nl",
        defaultValues: { name: "Eva", email: "eva@example.com", contractRef: "9" },
      });
      flow.review();
      await flow.confirm();
      const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect(url).toBe("/api/inverse");
      expect(init.method).toBe("POST");
      expect(JSON.parse(String(init.body))).toMatchObject({ kind: "withdrawal", locale: "nl" });
      expect(flow.getState().result?.id).toBe("W-ABC");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("mountDeclarationForm", () => {
  it("validates, reviews, confirms and offers the copy", async () => {
    const submit = vi.fn(async () => success());
    const onSuccess = vi.fn();
    const el = host();
    mountWithdrawalForm(el, { endpoint: "/api/inverse", submit, onSuccess });

    const form = el.querySelector("form");
    expect(form?.className).toBe("inverse-flow");
    expect(form?.dataset.step).toBe("form");
    expect(el.querySelector("h2")?.textContent).toBe("Vertrag widerrufen");

    button(el, "Weiter").click();
    expect([...el.querySelectorAll(".inverse-error")].map((e) => e.textContent)).toEqual([
      "Bitte ausfüllen.",
      "Bitte ausfüllen.",
      "Bitte ausfüllen.",
    ]);
    const name = field(el, "Vor- und Nachname");
    expect(name.getAttribute("aria-invalid")).toBe("true");
    expect(name.getAttribute("aria-describedby")).toBe(
      el.querySelector(".inverse-error")?.getAttribute("id"),
    );
    expect(document.activeElement).toBe(name);

    type(name, "Erika");
    // The error goes away without re-rendering, so focus stays in the field.
    expect(name.isConnected).toBe(true);
    expect(name.hasAttribute("aria-invalid")).toBe(false);
    expect(el.querySelectorAll(".inverse-error")).toHaveLength(2);

    type(field(el, "E-Mail-Adresse für die Bestätigung"), "erika@example.com");
    type(field(el, "Bestell- oder Vertragsnummer"), "A-1001");
    button(el, "Weiter").click();

    expect(el.querySelector("form")?.dataset.step).toBe("review");
    expect(document.activeElement?.textContent).toBe("Bitte prüfen Sie Ihre Angaben");
    expect([...el.querySelectorAll("dd")].map((d) => d.textContent)).toEqual([
      "Erika",
      "erika@example.com",
      "A-1001",
    ]);

    button(el, "Widerruf bestätigen").click();
    await flush();

    const done = el.querySelector("section");
    expect(done?.dataset.step).toBe("done");
    expect(done?.getAttribute("aria-live")).toBe("polite");
    expect(document.activeElement?.textContent).toBe("Ihr Widerruf ist eingegangen");
    expect(el.textContent).toContain(
      "Wir haben Ihnen eine Eingangsbestätigung an erika@example.com",
    );
    expect(el.querySelector("pre")?.textContent).toContain("Referenz: W-ABC");
    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ id: "W-ABC" }));

    const createObjectURL = vi.fn(() => "blob:x");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL, revokeObjectURL }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    button(el, "Bestätigung herunterladen").click();
    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    click.mockRestore();
    vi.unstubAllGlobals();
  });

  it("shows a network error and lets the consumer go back", async () => {
    const submit = vi.fn(async (): Promise<HandlerResult> => ({ ok: false, error: "server" }));
    const el = host();
    mountWithdrawalForm(el, {
      endpoint: "/x",
      submit,
      defaultValues: { name: "Erika", email: "erika@example.com", contractRef: "1" },
    });
    button(el, "Weiter").click();
    button(el, "Widerruf bestätigen").click();
    expect(button(el, "Widerruf bestätigen").disabled).toBe(true);
    await flush();
    expect(el.querySelector("[role='alert']")?.textContent).toBe(
      "Die Erklärung konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
    );
    expect(button(el, "Widerruf bestätigen").disabled).toBe(false);
    button(el, "Zurück").click();
    expect(el.querySelector("form")?.dataset.step).toBe("form");
    expect(field(el, "Vor- und Nachname").value).toBe("Erika");
  });

  it("returns to the form with server-side validation errors", async () => {
    const submit = vi.fn(
      async (): Promise<HandlerResult> => ({
        ok: false,
        error: "invalid",
        errors: [{ field: "email", code: "email" }],
      }),
    );
    const el = host();
    mountWithdrawalForm(el, {
      endpoint: "/x",
      submit,
      defaultValues: { name: "Erika", email: "erika@example.com", contractRef: "1" },
    });
    button(el, "Weiter").click();
    button(el, "Widerruf bestätigen").click();
    await flush();
    expect(el.querySelector("form")?.dataset.step).toBe("form");
    expect(el.querySelector(".inverse-error")?.textContent).toBe(
      "Bitte eine gültige E-Mail-Adresse angeben.",
    );
    expect(document.activeElement).toBe(field(el, "E-Mail-Adresse für die Bestätigung"));
  });

  it("renders the cancellation flow with type, reason and date", async () => {
    const submit = vi.fn(async () => success("cancellation"));
    const el = host();
    mountCancellationForm(el, { endpoint: "/x", submit, locale: "es", showMessage: true });
    expect(el.querySelector("h2")?.textContent).toBe("Cancelar el contrato");
    const reason = field(el, "Motivo de la cancelación");
    expect(reason.closest(".inverse-field")?.hasAttribute("hidden")).toBe(true);

    type(field(el, "Nombre y apellidos"), "Ana");
    type(field(el, "Correo electrónico para la confirmación"), "ana@example.com");
    type(field(el, "Número de pedido o de contrato"), "K-9");
    const extraordinary = el.querySelector<HTMLInputElement>("input[value='extraordinary']");
    if (!extraordinary) throw new Error("no radio");
    extraordinary.checked = true;
    extraordinary.dispatchEvent(new Event("change", { bubbles: true }));
    expect(reason.closest(".inverse-field")?.hasAttribute("hidden")).toBe(false);

    button(el, "Continuar").click();
    expect(el.querySelector(".inverse-error")?.textContent).toBe("Rellene este campo.");
    type(field(el, "Motivo de la cancelación"), "Subida de precio");
    type(field(el, "Cancelar con fecha (Lo antes posible)"), "2027-01-31");
    type(field(el, "Mensaje (opcional)"), "Gracias");
    button(el, "Continuar").click();

    expect(el.querySelector("h2")?.textContent).toBe("Compruebe su cancelación");
    expect(el.textContent).toContain("Cancelación extraordinaria (sin preaviso)");
    button(el, "Cancelar ahora").click();
    await flush();
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "cancellation",
        locale: "es",
        data: {
          name: "Ana",
          email: "ana@example.com",
          contractRef: "K-9",
          cancellationType: "extraordinary",
          reason: "Subida de precio",
          effectiveDate: "2027-01-31",
          message: "Gracias",
        },
      }),
    );
  });

  it("renders a contract select and preselects a single contract", () => {
    const el = host();
    mountCancellationForm(el, {
      endpoint: "/x",
      contracts: [{ value: "S-1", label: "Premium, S-1" }],
    });
    const select = field(el, "Bestell- oder Vertragsnummer") as unknown as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    expect(select.value).toBe("S-1");
  });

  it("sends the honeypot and cleans up on destroy", async () => {
    const submit = vi.fn(async () => success());
    const el = host();
    const mounted = mountWithdrawalForm(el, {
      endpoint: "/x",
      submit,
      defaultValues: { name: "Bot", email: "bot@example.com", contractRef: "1" },
    });
    const hp = el.querySelector<HTMLInputElement>(`input[name="${HONEYPOT_FIELD}"]`);
    expect(hp?.closest("[aria-hidden='true']")).toBeTruthy();
    if (hp) type(hp, "spam");
    button(el, "Weiter").click();
    button(el, "Widerruf bestätigen").click();
    await flush();
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ [HONEYPOT_FIELD]: "spam" }));
    mounted.destroy();
    expect(el.children).toHaveLength(0);
  });
});

describe("links and auto-mount", () => {
  it("creates links with the statutory labels", () => {
    const a = createInverseLink({ kind: "withdrawal", href: "/widerruf" });
    expect(a.textContent).toBe("Vertrag widerrufen");
    expect(a.getAttribute("href")).toBe("/widerruf");
    expect(a.className).toBe("inverse-link");
    expect(createInverseLink({ kind: "cancellation", href: "/k", locale: "pl" }).textContent).toBe(
      "Wypowiedz umowy tutaj",
    );
  });

  it("mounts forms and fills links from data attributes, once", () => {
    document.documentElement.lang = "nl-NL";
    document.body.innerHTML = `
      <a data-inverse-link="withdrawal" href="/herroepen"></a>
      <a data-inverse-link="cancellation" href="/opzeggen">Eigen tekst</a>
      <div data-inverse-form="withdrawal" data-endpoint="/api/inverse" data-show-items data-contract-ref="A-7"></div>
      <div data-inverse-form="cancellation" data-endpoint="/api/inverse" data-locale="de"></div>
      <div data-inverse-form="nonsense" data-endpoint="/api/inverse"></div>`;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(autoMount()).toHaveLength(2);
    expect(autoMount()).toHaveLength(0);
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();

    const links = document.querySelectorAll("a");
    expect(links[0]?.textContent).toBe("Hier de overeenkomst herroepen");
    expect(links[1]?.textContent).toBe("Eigen tekst");
    const forms = document.querySelectorAll("form");
    expect(forms[0]?.querySelector("h2")?.textContent).toBe("Overeenkomst herroepen");
    expect(field(forms[0] as HTMLElement, "Bestel- of contractnummer").value).toBe("A-7");
    expect(forms[0]?.querySelector("textarea[name='items']")).toBeTruthy();
    expect(forms[1]?.querySelector("h2")?.textContent).toBe("Vertrag kündigen");
  });
});
