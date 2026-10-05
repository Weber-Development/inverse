import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import { createInverseHandler, createNodeHandler, withdrawalStatus } from "../src";

const company = { name: "Acme GmbH", email: "hallo@acme.test" };
const data = { name: "Erika Muster", email: "erika@example.com", contractRef: "1042" };

function options(extra = {}) {
  const stored: unknown[] = [];
  return {
    stored,
    options: {
      company,
      onDeclaration: (r: unknown) => {
        stored.push(r);
      },
      sendReceipt: () => {},
      ...extra,
    },
  };
}

describe("withdrawalStatus", () => {
  it("counts the days left including today", () => {
    const at = new Date("2026-10-05T10:00:00Z");
    expect(withdrawalStatus({ start: "2026-10-01", at })).toEqual({
      deadline: "2026-10-15",
      open: true,
      daysLeft: 11,
    });
    expect(withdrawalStatus({ start: "2026-10-01", at: new Date("2026-10-15T20:00:00Z") })).toEqual(
      { deadline: "2026-10-15", open: true, daysLeft: 1 },
    );
    expect(withdrawalStatus({ start: "2026-09-01", at }).open).toBe(false);
    expect(withdrawalStatus({ start: "2026-09-01", at }).daysLeft).toBe(0);
  });
});

describe("rate limit", () => {
  it("answers 429 once a client is over the limit", async () => {
    const { options: o, stored } = options({ rateLimit: { max: 2, windowMs: 60_000 } });
    const handler = createInverseHandler(o);
    const post = (ip: string) =>
      handler(
        new Request("https://shop.test/api/inverse", {
          method: "POST",
          headers: { "content-type": "application/json", "x-forwarded-for": `${ip}, 10.0.0.1` },
          body: JSON.stringify({ kind: "withdrawal", data }),
        }),
      );
    expect((await post("1.1.1.1")).status).toBe(200);
    expect((await post("1.1.1.1")).status).toBe(200);
    const limited = await post("1.1.1.1");
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(await limited.json()).toEqual({ ok: false, error: "rate" });
    expect((await post("2.2.2.2")).status).toBe(200);
    expect(stored).toHaveLength(3);
  });
});

function nodeRes() {
  const res = {
    statusCode: 0,
    headers: {} as Record<string, string>,
    body: "",
    setHeader(name: string, value: string) {
      res.headers[name] = value;
    },
    end(body?: string) {
      res.body = body ?? "";
    },
  };
  return res;
}

describe("createNodeHandler", () => {
  it("reads a raw request stream", async () => {
    const { options: o, stored } = options();
    const req = Object.assign(Readable.from([JSON.stringify({ kind: "withdrawal", data })]), {
      method: "POST",
      url: "/api/inverse",
      headers: { host: "shop.test", "content-type": "application/json" },
    });
    const res = nodeRes();
    await createNodeHandler(o)(req, res);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).ok).toBe(true);
    expect(res.headers["content-type"]).toContain("application/json");
    expect(stored).toHaveLength(1);
  });

  it("uses a body parsed by Express", async () => {
    const { options: o } = options();
    const req = Object.assign(Readable.from([]), {
      method: "POST",
      url: "/api/inverse",
      headers: { "content-type": "application/json" },
      body: { kind: "cancellation", data: { ...data, cancellationType: "ordinary" } },
    });
    const res = nodeRes();
    await createNodeHandler(o)(req, res);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).id).toMatch(/^K-/);
  });

  it("rejects GET", async () => {
    const res = nodeRes();
    await createNodeHandler(options().options)(
      Object.assign(Readable.from([]), { method: "GET", url: "/", headers: {} }),
      res,
    );
    expect(res.statusCode).toBe(405);
  });
});
