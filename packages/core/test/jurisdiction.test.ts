import { describe, expect, it } from "vitest";
import {
  createRecord,
  getJurisdiction,
  handleDeclaration,
  jurisdictionIds,
  validate,
} from "../src";

const body = {
  kind: "withdrawal",
  data: { name: "A", email: "a@example.com", contractRef: "1" },
};
const base = {
  company: { name: "Shop" },
  onDeclaration: () => {},
  sendReceipt: () => {},
};

describe("jurisdictions", () => {
  it("never claims a cancellation button duty outside Germany", () => {
    const required = jurisdictionIds.filter(
      (id) => getJurisdiction(id).cancellationButton.required,
    );
    expect(required).toEqual(["de"]);
  });

  it("marks everything but DE and AT as not read nationally", () => {
    const checked = jurisdictionIds.filter((id) => getJurisdiction(id).verification === "checked");
    expect(checked).toEqual(["de", "at"]);
  });

  it("stamps jurisdiction and legal status on a record", () => {
    const r = createRecord(
      "withdrawal",
      validate("withdrawal", body.data).ok ? (body.data as never) : ({} as never),
      {
        jurisdiction: "at",
      },
    );
    expect(r.jurisdiction).toBe("at");
    expect(r.legalCheckedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("defaults to de and rejects an unknown id", () => {
    expect(createRecord("withdrawal", body.data as never).jurisdiction).toBe("de");
    expect(() =>
      createRecord("withdrawal", body.data as never, { jurisdiction: "xx" as never }),
    ).toThrow();
  });
});

describe("handler jurisdiction", () => {
  it("uses the configured jurisdiction and its language", async () => {
    const seen: unknown[] = [];
    await handleDeclaration(body, {
      ...base,
      jurisdiction: "fr",
      onDeclaration: (r) => void seen.push(r),
    });
    expect(seen[0]).toMatchObject({ jurisdiction: "fr", locale: "fr" });
  });

  it("lets a request pick only from the allowed list", async () => {
    const seen: Array<{ jurisdiction: string }> = [];
    const options = {
      ...base,
      jurisdiction: "de" as const,
      jurisdictions: ["at" as const],
      onDeclaration: (r: { jurisdiction: string }) => void seen.push(r),
    };
    await handleDeclaration({ ...body, jurisdiction: "at" }, options);
    await handleDeclaration({ ...body, jurisdiction: "fr" }, options);
    expect(seen.map((r) => r.jurisdiction)).toEqual(["at", "de"]);
  });
});
