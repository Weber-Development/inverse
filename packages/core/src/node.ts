import { createInverseHandler, type HandlerOptions } from "./handler";

/** The parts of Node's `IncomingMessage` the adapter reads; Express and Fastify add `body`. */
export interface NodeRequest extends AsyncIterable<unknown> {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  /** Already parsed body, e.g. from `express.json()` or the Next.js Pages Router. */
  body?: unknown;
  socket?: { remoteAddress?: string };
}

/** The parts of Node's `ServerResponse` the adapter writes. */
export interface NodeResponse {
  statusCode: number;
  setHeader(name: string, value: string): unknown;
  end(body?: string): unknown;
}

async function readRaw(req: NodeRequest): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(
      typeof chunk === "string" ? new TextEncoder().encode(chunk) : (chunk as Uint8Array),
    );
  }
  const all = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.length;
  }
  return new TextDecoder().decode(all);
}

/** Turns a Node request into a Fetch API `Request`. */
export async function toWebRequest(req: NodeRequest): Promise<Request> {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined || name === "content-length") continue;
    headers.set(name, Array.isArray(value) ? value.join(", ") : value);
  }
  if (!headers.has("x-forwarded-for") && req.socket?.remoteAddress) {
    headers.set("x-forwarded-for", req.socket.remoteAddress);
  }
  const method = req.method ?? "GET";
  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    if (req.body === undefined) {
      body = await readRaw(req);
    } else if (typeof req.body === "string") {
      body = req.body;
    } else if (req.body instanceof Uint8Array) {
      body = new TextDecoder().decode(req.body);
    } else {
      body = JSON.stringify(req.body);
      headers.set("content-type", "application/json");
    }
  }
  const host = headers.get("host") ?? "localhost";
  return new Request(new URL(req.url ?? "/", `http://${host}`), { method, headers, body });
}

/**
 * The same endpoint as {@link createInverseHandler} for Node-style servers: Express, Fastify
 * (`reply.raw`), `node:http` and API routes of the Next.js Pages Router.
 *
 * ```ts
 * app.post("/api/inverse", express.json(), createNodeHandler({ company, onDeclaration, sendReceipt }));
 * ```
 */
export function createNodeHandler(
  options: HandlerOptions,
): (req: NodeRequest, res: NodeResponse) => Promise<void> {
  const handle = createInverseHandler(options);
  return async (req, res) => {
    const response = await handle(await toWebRequest(req));
    res.statusCode = response.status;
    response.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });
    res.end(await response.text());
  };
}
