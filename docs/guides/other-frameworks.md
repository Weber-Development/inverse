---
title: Other frameworks
description: Use the handler with Remix, Hono, SvelteKit, Astro, Express or a plain form.
---

`createInverseHandler` returns a function from a Fetch API `Request` to a `Response`, so it runs wherever that API exists.

```ts
// Remix / React Router
export const action = ({ request }: ActionFunctionArgs) => inverse(request);

// Hono
app.post("/api/inverse", (c) => inverse(c.req.raw));

// SvelteKit: src/routes/api/inverse/+server.ts
export const POST = ({ request }) => inverse(request);

// Astro: src/pages/api/inverse.ts
export const POST: APIRoute = ({ request }) => inverse(request);
```

For Express, Fastify, `node:http` and API routes of the Next.js Pages Router, use `createNodeHandler`. It takes the same options, reads a body that is already parsed (`express.json()`) or the raw stream, and writes status, headers and JSON:

```ts
import { createNodeHandler } from "@sweberdev/inverse";

// Express
app.post("/api/inverse", express.json(), createNodeHandler(options));

// Fastify
fastify.post("/api/inverse", (req, reply) => createNodeHandler(options)(req.raw, reply.raw));

// Next.js Pages Router: pages/api/inverse.ts
export default createNodeHandler(options);
```

`handleDeclaration(body, options)` stays available if you want to write the response yourself.

Complete minimal projects for the Next.js Pages Router, Remix, SvelteKit and Express are in [`examples/`](https://github.com/Weber-Development/inverse/tree/main/examples).

## Without JavaScript

The handler also accepts `application/x-www-form-urlencoded`, so a server-rendered form works. Send `kind`, the fields and, for items, repeat `items`. You are responsible for the review step: render the entered data with `declarationFields()` and a submit button labelled with `getMessages(locale).withdrawal.confirm`.

## Request body

```json
{
  "kind": "withdrawal",
  "locale": "de",
  "data": { "name": "Erika Muster", "email": "erika@example.com", "contractRef": "A-1001" }
}
```

Responses: `200 { ok: true, id, kind, receivedAt, copy, endsAt? }`, `422 { ok: false, error: "invalid", errors }`, `400` for an unknown kind, `405` for other methods, `500` when storing failed.
