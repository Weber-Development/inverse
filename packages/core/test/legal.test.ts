import { describe, expect, it } from "vitest";
import { legalRevision } from "../src";
import { main } from "../src/cli";

describe("legalRevision", () => {
  it("is dated and lists changes newest first", () => {
    expect(legalRevision.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const dates = legalRevision.changes.map((c) => c.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("is printed by `inverse legal`", async () => {
    let out = "";
    const write = process.stdout.write.bind(process.stdout);
    process.stdout.write = ((chunk: string) => {
      out += chunk;
      return true;
    }) as typeof process.stdout.write;
    try {
      expect(await main(["legal"])).toBe(0);
    } finally {
      process.stdout.write = write;
    }
    expect(out).toContain(`checked on ${legalRevision.checkedOn}`);
    expect(out).toContain("§ 356a BGB");
  });
});
