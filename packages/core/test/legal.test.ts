import { describe, expect, it } from "vitest";
import { getLegalRevision, jurisdictionIds, legalChangesSince, legalRevisions } from "../src";
import { main } from "../src/cli";

async function run(args: string[]): Promise<{ code: number; out: string }> {
  let out = "";
  const write = process.stdout.write.bind(process.stdout);
  process.stdout.write = ((chunk: string) => {
    out += chunk;
    return true;
  }) as typeof process.stdout.write;
  try {
    return { code: await main(args), out };
  } finally {
    process.stdout.write = write;
  }
}

describe("legalRevisions", () => {
  it("has an entry for every jurisdiction, dated, changes newest first", () => {
    for (const id of jurisdictionIds) {
      const rev = legalRevisions[id];
      expect(rev.jurisdiction).toBe(id);
      expect(rev.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const dates = rev.changes.map((c) => c.date);
      expect([...dates].sort().reverse()).toEqual(dates);
    }
  });

  it("names the German sections only for Germany", () => {
    expect(getLegalRevision("de").sources.join(" ")).toContain("§ 356a BGB");
    expect(getLegalRevision("fr").sources.join(" ")).not.toContain("BGB");
  });

  it("reports changes after a date", () => {
    expect(legalChangesSince("de", "2026-10-10").changes.map((c) => c.version)).toEqual(["2.0.0"]);
    const none = legalChangesSince("de", "2026-12-01");
    expect(none.changes).toEqual([]);
    expect(none.rechecked).toBe(false);
  });
});

describe("inverse legal", () => {
  it("prints the status of the default jurisdiction", async () => {
    const r = await run(["legal"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("Germany (de)");
    expect(r.out).toContain("§ 356a BGB");
  });

  it("says when a jurisdiction rests on the directive only", async () => {
    const r = await run(["legal", "--jurisdiction", "fr"]);
    expect(r.out).toContain("directive only, national act not read");
  });

  it("exits 1 with --since when something is newer, 0 when not", async () => {
    expect((await run(["legal", "--since", "2026-10-01"])).code).toBe(1);
    const quiet = await run(["legal", "--since", "2027-01-01"]);
    expect(quiet.code).toBe(0);
    expect(quiet.out).toContain("Nothing new");
  });

  it("rejects an unknown jurisdiction", async () => {
    expect((await run(["legal", "--jurisdiction", "xx"])).code).toBe(2);
  });
});
