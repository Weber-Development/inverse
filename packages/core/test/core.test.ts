import { describe, expect, it } from "vitest";
import {
  contractEndDate,
  createInverseHandler,
  createRecord,
  declarationText,
  getMessages,
  HONEYPOT_FIELD,
  isWithinWithdrawalPeriod,
  renderReceipt,
  validateCancellation,
  validateWithdrawal,
  withdrawalDeadline,
} from "../src";

const company = {
  name: "Acme GmbH",
  address: "Musterweg 1, 10115 Berlin",
  email: "hallo@acme.test",
};

describe("validation", () => {
  it("requires name, e-mail and contract reference for a withdrawal", () => {
    const r = validateWithdrawal({ name: " ", email: "nope" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.map((e) => `${e.field}:${e.code}`)).toEqual([
        "name:required",
        "email:email",
        "contractRef:required",
      ]);
    }
  });

  it("accepts items as text lines and trims values", () => {
    const r = validateWithdrawal({
      name: " Erika Muster ",
      email: "erika@example.com",
      contractRef: "A-1001",
      items: "Jacke\n\nSchal",
    });
    expect(r).toEqual({
      ok: true,
      value: {
        name: "Erika Muster",
        email: "erika@example.com",
        contractRef: "A-1001",
        items: ["Jacke", "Schal"],
      },
    });
  });

  it("asks for a reason only for an extraordinary cancellation", () => {
    const base = { name: "Max", email: "max@example.com", contractRef: "K-7" };
    expect(validateCancellation(base).ok).toBe(true);
    const r = validateCancellation({ ...base, cancellationType: "extraordinary" });
    expect(r.ok).toBe(false);
    expect(validateCancellation({ ...base, effectiveDate: "2026-02-30" }).ok).toBe(false);
    const ok = validateCancellation({ ...base, cancellationType: "ordinary", reason: "egal" });
    expect(ok.ok && ok.value.reason).toBeUndefined();
  });
});

describe("deadlines", () => {
  it("ends the withdrawal period 14 days after the event", () => {
    // 2026-10-05 is a Monday, +14 = Monday 2026-10-19.
    expect(withdrawalDeadline({ start: "2026-10-05" })).toBe("2026-10-19");
  });

  it("moves the end off a weekend and holidays", () => {
    // 2026-10-03 (Sat) + 14 = Sat 2026-10-17 → Mon 2026-10-19.
    expect(withdrawalDeadline({ start: "2026-10-03" })).toBe("2026-10-19");
    expect(withdrawalDeadline({ start: "2026-10-05", isHoliday: (d) => d === "2026-10-19" })).toBe(
      "2026-10-20",
    );
  });

  it("extends the period by 12 months without proper information", () => {
    expect(withdrawalDeadline({ start: "2026-10-05", informed: false })).toBe("2027-10-19");
  });

  it("checks whether a submission is in time in the trader's time zone", () => {
    // 23:30 UTC on the 19th is already the 20th in Berlin.
    const late = new Date("2026-10-19T23:30:00Z");
    expect(isWithinWithdrawalPeriod({ start: "2026-10-05", at: late })).toBe(false);
    const early = new Date("2026-10-19T20:00:00Z");
    expect(isWithinWithdrawalPeriod({ start: "2026-10-05", at: early })).toBe(true);
  });

  it("works out the end of a cancelled contract", () => {
    expect(contractEndDate({ received: "2026-10-05", notice: { months: 1 } })).toBe("2026-11-05");
    expect(
      contractEndDate({ received: "2026-10-05", notice: { months: 1 }, termEnd: "2026-12-31" }),
    ).toBe("2026-12-31");
    expect(
      contractEndDate({ received: "2026-12-15", notice: { months: 1 }, termEnd: "2026-12-31" }),
    ).toBe("2027-01-15");
    expect(
      contractEndDate({ received: "2026-10-05", notice: { months: 1 }, requested: "2027-03-31" }),
    ).toBe("2027-03-31");
    expect(contractEndDate({ received: "2027-01-31", notice: { months: 1 } })).toBe("2027-02-28");
  });
});

describe("receipt", () => {
  const record = createRecord(
    "cancellation",
    {
      name: "Max Muster",
      email: "max@example.com",
      contractRef: "K-7",
      cancellationType: "extraordinary",
      reason: "Preiserhöhung <script>",
      effectiveDate: "earliest",
    },
    { now: new Date("2026-10-05T12:34:56Z"), id: "K-TEST", endsAt: "2026-11-05" },
  );

  it("contains content, date and time of receipt and the end date", () => {
    const r = renderReceipt(record, { company });
    expect(r.to).toBe("max@example.com");
    expect(r.subject).toBe("Eingangsbestätigung Ihrer Kündigung (K-TEST)");
    expect(r.text).toContain("Eingegangen am: 5. Oktober 2026 um 14:34:56 MESZ");
    expect(r.text).toContain("Ausserordentliche (fristlose) Kündigung");
    expect(r.text).toContain("Der Vertrag endet am 5. November 2026.");
    expect(r.html).toContain("Preiserhöhung &lt;script&gt;");
    expect(r.html).not.toContain("<script>");
  });

  it("renders other languages", () => {
    const r = renderReceipt({ ...record, locale: "en" }, { company, timeZone: "Europe/Zurich" });
    expect(r.subject).toBe("Acknowledgement of your cancellation (K-TEST)");
    expect(r.text).toContain("The contract ends on 5 November 2026.");
  });

  it("builds a downloadable copy", () => {
    const text = declarationText(record, { company });
    expect(text).toContain("Referenz: K-TEST");
    expect(text).toContain("Acme GmbH");
  });

  it("uses the statutory labels", () => {
    const m = getMessages("de");
    expect(m.withdrawal.button).toBe("Vertrag widerrufen");
    expect(m.withdrawal.confirm).toBe("Widerruf bestätigen");
    expect(m.cancellation.button).toBe("Verträge hier kündigen");
    expect(
      getMessages("de", { cancellation: { button: "Abo kündigen" } }).cancellation.button,
    ).toBe("Abo kündigen");
  });
});

describe("handler", () => {
  function setup(overrides: { failStore?: boolean; failMail?: boolean } = {}) {
    const stored: unknown[] = [];
    const sent: unknown[] = [];
    const errors: unknown[] = [];
    const handler = createInverseHandler({
      company,
      onDeclaration: (r) => {
        if (overrides.failStore) throw new Error("db down");
        stored.push(r);
      },
      sendReceipt: (receipt) => {
        if (overrides.failMail) throw new Error("smtp down");
        sent.push(receipt);
      },
      resolveEndDate: () => "2026-11-30",
      onError: (e) => errors.push(e),
    });
    return { handler, stored, sent, errors };
  }

  const post = (body: unknown, type = "application/json") =>
    new Request("https://shop.test/api/inverse", {
      method: "POST",
      headers: { "content-type": type },
      body: type === "application/json" ? JSON.stringify(body) : (body as string),
    });

  it("stores, confirms and returns a copy", async () => {
    const { handler, stored, sent } = setup();
    const res = await handler(
      post({
        kind: "cancellation",
        locale: "en",
        data: { name: "Max", email: "max@example.com", contractRef: "K-7" },
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ ok: true, kind: "cancellation", endsAt: "2026-11-30" });
    expect(json.copy).toContain("Cancel as of: Earliest possible date");
    expect(stored).toHaveLength(1);
    expect(sent).toHaveLength(1);
  });

  it("accepts form posts", async () => {
    const { handler, stored } = setup();
    const body = new URLSearchParams({
      kind: "withdrawal",
      name: "Erika",
      email: "erika@example.com",
      contractRef: "A-1",
    });
    body.append("items", "Jacke");
    body.append("items", "Schal");
    const res = await handler(post(body.toString(), "application/x-www-form-urlencoded"));
    expect(res.status).toBe(200);
    expect((stored[0] as { data: { items: string[] } }).data.items).toEqual(["Jacke", "Schal"]);
  });

  it("returns field errors", async () => {
    const { handler } = setup();
    const res = await handler(post({ kind: "withdrawal", data: { name: "x" } }));
    expect(res.status).toBe(422);
    expect((await res.json()).errors).toHaveLength(2);
  });

  it("rejects unknown kinds and other methods", async () => {
    const { handler } = setup();
    expect((await handler(post({ kind: "refund" }))).status).toBe(400);
    expect((await handler(new Request("https://shop.test/api/inverse"))).status).toBe(405);
  });

  it("fails loudly when storing fails, but not when e-mail fails", async () => {
    const data = { name: "Max", email: "max@example.com", contractRef: "K-7" };
    const a = setup({ failStore: true });
    expect((await a.handler(post({ kind: "withdrawal", data }))).status).toBe(500);
    const b = setup({ failMail: true });
    expect((await b.handler(post({ kind: "withdrawal", data }))).status).toBe(200);
    expect(b.stored).toHaveLength(1);
    expect(b.errors).toHaveLength(1);
  });

  it("ignores honeypot submissions", async () => {
    const { handler, stored } = setup();
    const res = await handler(
      post({
        kind: "withdrawal",
        [HONEYPOT_FIELD]: "spam",
        data: { name: "Bot", email: "bot@example.com", contractRef: "1" },
      }),
    );
    expect(res.status).toBe(200);
    expect(stored).toHaveLength(0);
  });
});
