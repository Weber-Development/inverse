import type { DeclarationKind } from "./types";

export type Verdict = "pass" | "warn" | "fail";

export interface Control {
  tag: string;
  /** Accessible name: aria-label, text content, value or title. */
  label: string;
  href?: string;
}

export interface ControlMatch extends Control {
  verdict: Exclude<Verdict, "fail">;
  reason: string;
}

export interface KindResult {
  kind: DeclarationKind;
  verdict: Verdict;
  matches: ControlMatch[];
  message: string;
}

export interface CheckResult {
  url?: string;
  verdict: Verdict;
  results: KindResult[];
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  auml: "ä",
  ouml: "ö",
  uuml: "ü",
  Auml: "Ä",
  Ouml: "Ö",
  Uuml: "Ü",
  szlig: "ß",
  eacute: "é",
  egrave: "è",
  agrave: "à",
};

function decode(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code =
        e[1] === "x" || e[1] === "X" ? Number.parseInt(e.slice(2), 16) : Number(e.slice(1));
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e] ?? m;
  });
}

function attr(attrs: string, name: string): string | undefined {
  const re = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const m = re.exec(attrs);
  const v = m?.[1] ?? m?.[2] ?? m?.[3];
  return v === undefined ? undefined : decode(v);
}

function clean(s: string): string {
  return decode(s.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/** Finds links and buttons in an HTML string, with their accessible names. */
export function extractControls(html: string): Control[] {
  const body = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|template|noscript)\b[\s\S]*?<\/\1>/gi, "");
  const out: Control[] = [];
  const paired = /<(a|button|summary)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  for (const m of body.matchAll(paired)) {
    const [, tag = "", attrs = "", inner = ""] = m;
    const label = attr(attrs, "aria-label") ?? (clean(inner) || attr(attrs, "title") || "");
    const control: Control = { tag: tag.toLowerCase(), label: label.trim() };
    const href = attr(attrs, "href");
    if (href) control.href = href;
    out.push(control);
  }
  for (const m of body.matchAll(/<input\b([^>]*)>/gi)) {
    const attrs = m[1] ?? "";
    const type = (attr(attrs, "type") ?? "").toLowerCase();
    if (type !== "submit" && type !== "button") continue;
    out.push({
      tag: "input",
      label: (attr(attrs, "aria-label") ?? attr(attrs, "value") ?? "").trim(),
    });
  }
  for (const m of body.matchAll(
    /<(div|span|li)\b([^>]*\brole\s*=\s*["']?(?:button|link)["']?[^>]*)>([\s\S]*?)<\/\1>/gi,
  )) {
    const [, tag = "", attrs = "", inner = ""] = m;
    out.push({ tag: tag.toLowerCase(), label: (attr(attrs, "aria-label") ?? clean(inner)).trim() });
  }
  return out.filter((c) => c.label);
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

interface Rule {
  pass: RegExp[];
  /** Related wording that is probably not enough on its own. */
  warn: RegExp[];
  /** Information pages, not the function itself. */
  ignore: RegExp[];
  expected: string;
}

const RULES: Record<DeclarationKind, Rule> = {
  withdrawal: {
    pass: [
      /\bvertrag (hier |jetzt )?widerrufen\b/,
      /\bwiderruf des vertrags?\b/,
      /\bwithdraw from (the |this )?contract\b/,
      /\bse rétracter du contrat\b/,
      /\brecedere dal contratto\b/,
    ],
    warn: [/\bwiderrufen\b/, /\bwiderruf (erklären|einreichen|starten)\b/, /\bwithdraw\b/],
    ignore: [/widerrufsbelehrung/, /widerrufsrecht/, /widerrufsformular/, /muster/, /policy/],
    expected: "Vertrag widerrufen",
  },
  cancellation: {
    pass: [
      /\bvertr(a|ä)ge? (hier |jetzt )?kündigen\b/,
      /\bkündigung des vertrags?\b/,
      /\bcancel (the |your )?contracts? (here|now)\b/,
      /\bcancel (the |your )?contracts?\b/,
      /\brésilier (les |le )?contrats?\b/,
      /\bdisdire (i |il )?contratt[oi]\b/,
    ],
    warn: [/\bkündigen\b/, /\bkündigung\b/, /\bcancel\b/, /\bunsubscribe\b/],
    ignore: [/kündigungsfrist/, /kündigungsbedingungen/],
    expected: "Verträge hier kündigen",
  },
};

const LOGIN = /\b(login|log-in|signin|sign-in|anmelden|anmeldung|account\/login|konto)\b/i;

/** Rates the controls on one page against the wording § 356a and § 312k BGB ask for. */
export function checkControls(controls: Control[], kinds: DeclarationKind[]): KindResult[] {
  return kinds.map((kind) => {
    const rule = RULES[kind];
    const matches: ControlMatch[] = [];
    for (const c of controls) {
      const label = norm(c.label);
      if (rule.ignore.some((r) => r.test(label))) continue;
      if (rule.pass.some((r) => r.test(label))) {
        if (c.href && LOGIN.test(c.href)) {
          matches.push({ ...c, verdict: "warn", reason: "Link target looks like a login page." });
        } else {
          matches.push({ ...c, verdict: "pass", reason: "Statutory or equivalent wording." });
        }
      } else if (rule.warn.some((r) => r.test(label))) {
        matches.push({
          ...c,
          verdict: "warn",
          reason: `Wording differs from "${rule.expected}"; courts read the label strictly.`,
        });
      }
    }
    let verdict: Verdict = "fail";
    if (matches.some((m) => m.verdict === "pass")) verdict = "pass";
    else if (matches.length) verdict = "warn";
    const message =
      verdict === "pass"
        ? `Found a control labelled like "${rule.expected}".`
        : verdict === "warn"
          ? `Found related controls, but none clearly labelled "${rule.expected}".`
          : `No link or button labelled "${rule.expected}" or similar.`;
    return { kind, verdict, matches, message };
  });
}

function worst(verdicts: Verdict[]): Verdict {
  if (verdicts.includes("fail")) return "fail";
  if (verdicts.includes("warn")) return "warn";
  return "pass";
}

export function checkHtml(
  html: string,
  kinds: DeclarationKind[] = ["withdrawal", "cancellation"],
): CheckResult {
  const results = checkControls(extractControls(html), kinds);
  return { verdict: worst(results.map((r) => r.verdict)), results };
}

/** Loads a page and checks it. The button must work without login, so no cookies are sent. */
export async function checkUrl(
  url: string,
  kinds: DeclarationKind[] = ["withdrawal", "cancellation"],
  init?: RequestInit,
): Promise<CheckResult> {
  const res = await fetch(url, {
    redirect: "follow",
    ...init,
    headers: {
      "user-agent": "inverse-check (+https://packages.sweber.dev/inverse)",
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`${url} answered with HTTP ${res.status}`);
  return { url, ...checkHtml(await res.text(), kinds) };
}
