import { isLocale } from "./i18n";
import { renderReceipt } from "./receipt";
import { createRecord, declarationText } from "./record";
import type {
  Company,
  DeclarationKind,
  DeclarationRecord,
  Locale,
  Receipt,
  ValidationError,
} from "./types";
import { validate } from "./validate";

export interface HandlerOptions {
  /** The trader, shown in the receipt. */
  company: Company;
  /** Which flows this endpoint accepts. Defaults to both. */
  kinds?: DeclarationKind[];
  /** Fallback language when the request does not send one. Defaults to `de`. */
  locale?: Locale;
  /** IANA time zone for dates in the receipt. Defaults to Europe/Berlin. */
  timeZone?: string;
  /**
   * Store the declaration. Called before the receipt is sent; if it throws, the consumer
   * gets an error and can try again, so nothing is lost silently.
   */
  onDeclaration: (record: DeclarationRecord) => void | Promise<void>;
  /** Send the receipt, e.g. with Resend, Postmark, SES or nodemailer. */
  sendReceipt: (receipt: Receipt, record: DeclarationRecord) => void | Promise<void>;
  /** Cancellation only: work out the end date to put into the receipt. */
  resolveEndDate?: (
    record: DeclarationRecord<"cancellation">,
  ) => string | undefined | Promise<string | undefined>;
  /** Called when storing or sending fails. Defaults to `console.error`. */
  onError?: (error: unknown, record?: DeclarationRecord) => void;
  /**
   * Limit submissions per client, kept in memory per server instance. Answers with 429
   * once `max` requests arrived within `windowMs`. Off by default.
   */
  rateLimit?: RateLimitOptions;
  /**
   * Treat an identical declaration (same kind and data) arriving again within `windowMs` as
   * the same one: answer with the first result instead of storing and mailing it twice.
   * Kept in memory per server instance. Off by default.
   */
  dedupe?: { windowMs?: number };
}

export interface RateLimitOptions {
  /** Requests allowed per window. */
  max: number;
  /** Window length in milliseconds. Defaults to 10 minutes. */
  windowMs?: number;
  /** Client key. Defaults to the first `x-forwarded-for` address, then `x-real-ip`. */
  key?: (request: Request) => string;
}

export interface HandlerSuccess {
  ok: true;
  id: string;
  kind: DeclarationKind;
  receivedAt: string;
  endsAt?: string;
  /** Plain-text copy the consumer can download (§ 312k Abs. 4 BGB). */
  copy: string;
}

export interface HandlerFailure {
  ok: false;
  error: "invalid" | "kind" | "method" | "rate" | "server";
  errors?: ValidationError[];
}

export type HandlerResult = HandlerSuccess | HandlerFailure;

/** Field name of the hidden honeypot input the React components render. */
export const HONEYPOT_FIELD = "inverse_hp";

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  }
  const form = await request.formData().catch(() => undefined);
  if (!form) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value !== "string") continue;
    if (key === "items") {
      const items = (out.items as string[] | undefined) ?? [];
      items.push(value);
      out.items = items;
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Processes one submitted declaration: validates it, stamps the time of receipt on the
 * server, stores it, sends the receipt and returns a copy for the consumer.
 * Framework-independent; use {@link createInverseHandler} for a `Request → Response` route.
 */
export async function handleDeclaration(
  body: Record<string, unknown>,
  options: HandlerOptions,
): Promise<HandlerResult> {
  const kinds = options.kinds ?? ["withdrawal", "cancellation"];
  const kind = body.kind as DeclarationKind;
  if (!kinds.includes(kind)) return { ok: false, error: "kind" };

  const locale = isLocale(body.locale) ? body.locale : (options.locale ?? "de");

  // Bots fill every field. Pretend success so they move on, but store nothing.
  if (typeof body[HONEYPOT_FIELD] === "string" && body[HONEYPOT_FIELD] !== "") {
    return {
      ok: true,
      id: "-",
      kind,
      receivedAt: new Date().toISOString(),
      copy: "",
    };
  }

  const result = validate(kind, body.data ?? body);
  if (!result.ok) return { ok: false, error: "invalid", errors: result.errors };

  const record = createRecord(kind, result.value, { locale }) as DeclarationRecord;
  const onError = options.onError ?? ((e: unknown) => console.error("[inverse]", e));

  try {
    if (kind === "cancellation" && options.resolveEndDate) {
      const endsAt = await options.resolveEndDate(record as DeclarationRecord<"cancellation">);
      if (endsAt) record.endsAt = endsAt;
    }
    await options.onDeclaration(record);
  } catch (error) {
    onError(error, record);
    return { ok: false, error: "server" };
  }

  try {
    const receipt = renderReceipt(record, {
      company: options.company,
      timeZone: options.timeZone,
    });
    await options.sendReceipt(receipt, record);
  } catch (error) {
    // The declaration is stored and legally received; a failed e-mail must not hide that.
    onError(error, record);
  }

  const success: HandlerSuccess = {
    ok: true,
    id: record.id,
    kind,
    receivedAt: record.receivedAt,
    copy: declarationText(record, { company: options.company, timeZone: options.timeZone }),
  };
  if (record.endsAt) success.endsAt = record.endsAt;
  return success;
}

const STATUS: Record<HandlerFailure["error"], number> = {
  invalid: 422,
  kind: 400,
  method: 405,
  rate: 429,
  server: 500,
};

/**
 * A `Request → Response` handler for Next.js route handlers, Remix, Hono, SvelteKit,
 * Astro or any runtime with the Fetch API.
 *
 * ```ts
 * // app/api/inverse/route.ts
 * export const POST = createInverseHandler({ company, onDeclaration, sendReceipt });
 * ```
 */
export function createInverseHandler(
  options: HandlerOptions,
): (request: Request) => Promise<Response> {
  const limited = options.rateLimit ? createRateLimiter(options.rateLimit) : undefined;
  const seen = options.dedupe ? createDedupe(options.dedupe.windowMs ?? 10 * 60_000) : undefined;
  return async (request) => {
    if (request.method !== "POST") {
      return Response.json({ ok: false, error: "method" } satisfies HandlerFailure, {
        status: 405,
        headers: { allow: "POST" },
      });
    }
    const retryAfter = limited?.(request);
    if (retryAfter) {
      return Response.json({ ok: false, error: "rate" } satisfies HandlerFailure, {
        status: 429,
        headers: { "retry-after": String(retryAfter), "cache-control": "no-store" },
      });
    }
    const body = await readBody(request);
    const key = seen?.key(body);
    const earlier = key ? seen?.get(key) : undefined;
    const result = earlier ?? (await handleDeclaration(body, options));
    if (key && result.ok && !earlier && result.id !== "-") seen?.set(key, result);
    return Response.json(result, {
      status: result.ok ? 200 : STATUS[result.error],
      headers: { "cache-control": "no-store" },
    });
  };
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

/** Fixed-window counter. Returns the seconds to wait when the client is over the limit. */
function createRateLimiter(options: RateLimitOptions): (request: Request) => number | undefined {
  const windowMs = options.windowMs ?? 10 * 60_000;
  const key = options.key ?? clientKey;
  const hits = new Map<string, { count: number; reset: number }>();
  return (request) => {
    const now = Date.now();
    if (hits.size > 10_000) {
      for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
    }
    const id = key(request);
    let entry = hits.get(id);
    if (!entry || entry.reset <= now) {
      entry = { count: 0, reset: now + windowMs };
      hits.set(id, entry);
    }
    entry.count++;
    return entry.count > options.max ? Math.ceil((entry.reset - now) / 1000) : undefined;
  };
}

/** Remembers successful results by declaration content for a while. */
function createDedupe(windowMs: number) {
  const results = new Map<string, { result: HandlerSuccess; until: number }>();
  return {
    key(body: Record<string, unknown>): string | undefined {
      const kind = body.kind as DeclarationKind;
      const r = validate(kind, body.data ?? body);
      if (!r.ok) return undefined;
      const value = { ...r.value } as Record<string, unknown>;
      if (typeof value.email === "string") value.email = value.email.toLowerCase();
      return `${kind}:${JSON.stringify(value, Object.keys(value).sort())}`;
    },
    get(key: string): HandlerSuccess | undefined {
      const hit = results.get(key);
      if (!hit) return undefined;
      if (hit.until > Date.now()) return hit.result;
      results.delete(key);
      return undefined;
    },
    set(key: string, result: HandlerSuccess) {
      const now = Date.now();
      if (results.size > 10_000) {
        for (const [k, v] of results) if (v.until <= now) results.delete(k);
      }
      results.set(key, { result, until: now + windowMs });
    },
  };
}
