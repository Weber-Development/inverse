import { describe, expect, it } from "vitest";
import { platforms, snippet } from "../src";
import { main } from "../src/cli";

describe("snippets", () => {
  it("contains endpoint, script and both links for every platform", () => {
    for (const p of platforms) {
      const s = snippet(p, { endpoint: "https://api.example.com/inverse" });
      expect(s).toContain("https://api.example.com/inverse");
      expect(s).toContain("inverse.global.js");
      expect(s).toContain("withdrawal");
      expect(s).toContain("cancellation");
    }
  });

  it("escapes the endpoint and honours paths and version", () => {
    const s = snippet("html", {
      endpoint: 'x"><script>',
      version: "0.7",
      paths: { withdrawal: "/a", cancellation: "/b" },
    });
    expect(s).not.toContain('x"><script>');
    expect(s).toContain("@0.7/");
    expect(s).toContain('href="/a"');
  });

  it("is printed by `inverse snippet`, and rejects bad input", async () => {
    let out = "";
    const write = process.stdout.write.bind(process.stdout);
    process.stdout.write = ((chunk: string) => {
      out += chunk;
      return true;
    }) as typeof process.stdout.write;
    try {
      expect(await main(["snippet", "shopify", "--endpoint", "https://e.test/api"])).toBe(0);
      expect(await main(["snippet", "magento", "--endpoint", "x"])).toBe(2);
    } finally {
      process.stdout.write = write;
    }
    expect(out).toContain("render 'inverse'");
  });
});
