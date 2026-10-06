import { describe, expect, it } from "vitest";
import {
  checkHtml,
  createInverseHandler,
  createRecord,
  declarationText,
  getMessages,
  locales,
  messages,
  renderReceipt,
} from "../src";

const company = { name: "Acme GmbH", email: "hallo@acme.test" };

function keys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

describe("locales", () => {
  it("covers Dutch, Spanish and Polish", () => {
    expect(locales).toEqual(["de", "en", "fr", "it", "nl", "es", "pl"]);
  });

  it("has every text in every locale", () => {
    const expected = keys(messages.de).sort();
    for (const locale of locales) {
      expect(keys(messages[locale]).sort(), locale).toEqual(expected);
      for (const key of keys(messages[locale])) {
        const value = key
          .split(".")
          .reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], messages[locale]);
        expect(typeof value === "string" && value.trim().length > 0, `${locale}.${key}`).toBe(true);
      }
    }
  });

  it("keeps the placeholders of the German texts", () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const locale of locales) {
      for (const key of keys(messages.de)) {
        const get = (m: unknown) =>
          key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], m) as string;
        expect(placeholders(get(messages[locale])), `${locale}.${key}`).toEqual(
          placeholders(get(messages.de)),
        );
      }
    }
  });

  it("uses the wording of Article 11a in the Dutch, Spanish and Polish versions", () => {
    expect(getMessages("nl").withdrawal.button).toBe("Hier de overeenkomst herroepen");
    expect(getMessages("nl").withdrawal.confirm).toBe("Herroeping bevestigen");
    expect(getMessages("es").withdrawal.button).toBe("Desistir del contrato aquí");
    expect(getMessages("es").withdrawal.confirm).toBe("Confirmar desistimiento");
    expect(getMessages("pl").withdrawal.button).toBe("Odstąp od umowy tutaj");
    expect(getMessages("pl").withdrawal.confirm).toBe("Potwierdź odstąpienie od umowy");
  });

  it("renders receipts and copies in nl, es and pl", () => {
    const base = createRecord(
      "cancellation",
      { name: "Erika", email: "erika@example.com", contractRef: "K-7", effectiveDate: "earliest" },
      { now: new Date("2026-10-05T12:34:56Z"), id: "K-TEST", endsAt: "2026-11-05" },
    );
    const nl = renderReceipt({ ...base, locale: "nl" }, { company });
    expect(nl.subject).toBe("Ontvangstbevestiging van uw opzegging (K-TEST)");
    expect(nl.text).toContain("De overeenkomst eindigt op 5 november 2026.");
    expect(nl.html).toContain('<html lang="nl">');

    const es = renderReceipt({ ...base, locale: "es" }, { company });
    expect(es.subject).toBe("Acuse de recibo de su cancelación (K-TEST)");
    expect(es.text).toContain("El contrato finaliza el 5 de noviembre de 2026.");

    const pl = renderReceipt({ ...base, locale: "pl" }, { company });
    expect(pl.subject).toBe("Potwierdzenie otrzymania wypowiedzenia (K-TEST)");
    expect(pl.text).toContain("Umowa kończy się 5 listopada 2026");
    expect(declarationText({ ...base, locale: "pl" })).toContain("Numer referencyjny: K-TEST");
  });

  it("accepts the new locales in the handler", async () => {
    const sent: string[] = [];
    const handler = createInverseHandler({
      company,
      onDeclaration: () => {},
      sendReceipt: (r) => {
        sent.push(r.subject);
      },
    });
    const res = await handler(
      new Request("https://shop.test/api/inverse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "withdrawal",
          locale: "es",
          data: { name: "Ana", email: "ana@example.com", contractRef: "1042" },
        }),
      }),
    );
    expect(res.status).toBe(200);
    expect(sent[0]).toMatch(/^Acuse de recibo de su desistimiento/);
  });

  it("recognises the Dutch, Spanish and Polish labels in the page check", () => {
    for (const label of [
      "Hier de overeenkomst herroepen",
      "Desistir del contrato aquí",
      "Odstąp od umowy tutaj",
    ]) {
      expect(checkHtml(`<a href="/w">${label}</a>`, ["withdrawal"]).verdict, label).toBe("pass");
    }
    for (const label of [
      "Overeenkomsten hier opzeggen",
      "Cancelar contratos aquí",
      "Wypowiedz umowy tutaj",
    ]) {
      expect(checkHtml(`<a href="/k">${label}</a>`, ["cancellation"]).verdict, label).toBe("pass");
    }
    for (const locale of locales) {
      const m = getMessages(locale);
      expect(checkHtml(`<a href="/w">${m.withdrawal.button}</a>`, ["withdrawal"]).verdict).toBe(
        "pass",
      );
      expect(
        checkHtml(`<a href="/k">${m.cancellation.button}</a>`, ["cancellation"]).verdict,
        locale,
      ).toBe("pass");
    }
    expect(checkHtml(`<button>Herroepen</button>`, ["withdrawal"]).verdict).toBe("warn");
  });
});
