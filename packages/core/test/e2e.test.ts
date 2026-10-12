import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createNodeHandler, type DeclarationRecord, type Receipt } from "../src";
import { createDeclarationFlow } from "../src/ui";

// Real HTTP: the browser flow posts to a server built the way the examples build it
// (createNodeHandler on a route, CORS for a static shop on another domain).
const stored: DeclarationRecord[] = [];
const mails: Receipt[] = [];
let server: Server;
let base = "";

beforeAll(async () => {
  const handler = createNodeHandler({
    company: { name: "Acme GmbH", email: "hallo@acme.de" },
    jurisdiction: "de",
    jurisdictions: ["at", "fr"],
    cors: { origin: ["https://shop.example.com"] },
    onDeclaration: (record) => void stored.push(record as DeclarationRecord),
    sendReceipt: (receipt) => void mails.push(receipt),
  });
  server = createServer((req, res) => {
    if (req.url === "/api/inverse") void handler(req, res);
    else {
      res.statusCode = 404;
      res.end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/inverse`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

async function submit(options: {
  kind: "withdrawal" | "cancellation";
  jurisdiction?: "at" | "fr" | "ch";
}) {
  const flow = createDeclarationFlow({ endpoint: base, locale: "de", ...options });
  flow.setValue("name", "Erika Muster");
  flow.setValue("email", "erika@example.com");
  flow.setValue("contractRef", "ORDER-1");
  expect(flow.review()).toBe(true);
  await flow.confirm();
  return flow.getState();
}

describe("browser flow against a real server", () => {
  it("completes a withdrawal and stores it with the default jurisdiction", async () => {
    const state = await submit({ kind: "withdrawal" });
    expect(state.step).toBe("done");
    expect(state.result?.copy).toContain("ORDER-1");
    expect(stored.at(-1)).toMatchObject({ kind: "withdrawal", jurisdiction: "de" });
    expect(mails.at(-1)?.to).toBe("erika@example.com");
  });

  it("completes a cancellation", async () => {
    const state = await submit({ kind: "cancellation" });
    expect(state.step).toBe("done");
    expect(stored.at(-1)?.kind).toBe("cancellation");
  });

  it("takes an allowed jurisdiction from the form and ignores a forbidden one", async () => {
    await submit({ kind: "withdrawal", jurisdiction: "at" });
    expect(stored.at(-1)?.jurisdiction).toBe("at");
    await submit({ kind: "withdrawal", jurisdiction: "ch" });
    expect(stored.at(-1)?.jurisdiction).toBe("de");
  });

  it("answers the CORS preflight of a shop on another domain", async () => {
    const res = await fetch(base, {
      method: "OPTIONS",
      headers: {
        origin: "https://shop.example.com",
        "access-control-request-method": "POST",
      },
    });
    expect(res.status).toBeLessThan(300);
    expect(res.headers.get("access-control-allow-origin")).toBe("https://shop.example.com");
    const other = await fetch(base, {
      method: "OPTIONS",
      headers: { origin: "https://evil.example", "access-control-request-method": "POST" },
    });
    expect(other.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("refuses an invalid declaration with field errors", async () => {
    const res = await fetch(base, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "withdrawal", data: { name: "", email: "x", contractRef: "" } }),
    });
    expect(res.status).toBe(422);
    const json = (await res.json()) as { errors: Array<{ field: string }> };
    expect(json.errors.map((e) => e.field)).toContain("email");
  });
});
