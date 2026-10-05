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

For Express or Fastify, call `handleDeclaration(body, options)` directly. It takes the parsed body and returns the same result object:

```ts
app.post("/api/inverse", express.json(), async (req, res) => {
  const result = await handleDeclaration(req.body, options);
  res.status(result.ok ? 200 : result.error === "invalid" ? 422 : 400).json(result);
});
```

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
