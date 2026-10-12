import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { type CheckResult, checkHtml, checkUrl, type Verdict } from "./check";
import { isJurisdiction, jurisdictionIds, jurisdictions } from "./jurisdiction";
import { getLegalRevision, legalChangesSince } from "./legal";
import { type Platform, platforms, snippet } from "./snippets";
import type { DeclarationKind } from "./types";

const HELP = `inverse check <url|file.html> [more ...] [options]

Checks pages for a withdrawal button ("Vertrag widerrufen", § 356a BGB) and a
cancellation button ("Verträge hier kündigen", § 312k BGB). Pages are loaded
without cookies, the way a logged-out visitor sees them.

Options:
  --kind <kind>    withdrawal | cancellation | both (default: both)
  --json           print the result as JSON
  --warn-ok        exit 0 on warnings (default: exit 1 on fail or warn)
  -h, --help       show this help

Exit codes: 0 all pass, 1 a check failed or warned, 2 usage error.

inverse snippet <platform> --endpoint <url>
  prints a ready-to-paste integration: ${platforms.join(", ")}.

inverse legal [--jurisdiction <id>] [--since <YYYY-MM-DD>]
  prints the state of the law Inverse was checked against for one legal area (${jurisdictionIds.join(", ")};
  default de), and what changed. With --since it prints only what is newer than that date and
  exits 1 if there is anything, so a CI job or cron job notices a legal change.
`;

const ICON: Record<Verdict, string> = { pass: "✔", warn: "!", fail: "✘" };

function print(result: CheckResult): string {
  const lines = [`${ICON[result.verdict]} ${result.url ?? "(input)"}`];
  for (const r of result.results) {
    lines.push(`  ${ICON[r.verdict]} ${r.kind}: ${r.message}`);
    for (const m of r.matches) {
      lines.push(
        `      ${ICON[m.verdict]} <${m.tag}> "${m.label}"${m.href ? ` → ${m.href}` : ""}: ${m.reason}`,
      );
    }
  }
  return lines.join("\n");
}

export async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  if (!command || command === "-h" || command === "--help") {
    process.stdout.write(HELP);
    return 0;
  }
  if (command === "legal") {
    const { values } = parseArgs({
      args: rest,
      options: { jurisdiction: { type: "string", default: "de" }, since: { type: "string" } },
    });
    const id = values.jurisdiction;
    if (!isJurisdiction(id)) {
      process.stderr.write(`Unknown jurisdiction "${id}". Known: ${jurisdictionIds.join(", ")}.\n`);
      return 2;
    }
    const r = getLegalRevision(id);
    const j = jurisdictions[id];
    const header = `${j.country} (${id}): ${j.verification === "checked" ? "national provision checked" : j.verification === "directive" ? "directive only, national act not read" : "note only"}\n${j.note}\n`;
    if (values.since) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(values.since)) {
        process.stderr.write("--since must be YYYY-MM-DD.\n");
        return 2;
      }
      const c = legalChangesSince(id, values.since);
      const fresh = c.changes.length > 0 || c.rechecked;
      process.stdout.write(
        `${header}\n${fresh ? `Changes since ${values.since} (checked ${r.checkedOn}):\n${c.changes.map((x) => `  ${x.date}  ${x.version}  ${x.summary}`).join("\n") || "  (legal status re-checked, no new entries)"}` : `Nothing new since ${values.since}.`}\n`,
      );
      return fresh ? 1 : 0;
    }
    process.stdout.write(
      `${header}\nLegal status checked on ${r.checkedOn}\n\nSources:\n${r.sources.map((x) => `  - ${x}`).join("\n")}\n\nChanges:\n${r.changes.map((c) => `  ${c.date}  ${c.version}  ${c.summary}`).join("\n")}\n`,
    );
    return 0;
  }
  if (command === "snippet") {
    const { values, positionals } = parseArgs({
      args: rest,
      allowPositionals: true,
      options: { endpoint: { type: "string" } },
    });
    const platform = positionals[0] as Platform | undefined;
    if (!platform || !platforms.includes(platform) || !values.endpoint) {
      process.stderr.write(`Usage: inverse snippet <${platforms.join("|")}> --endpoint <url>\n`);
      return 2;
    }
    process.stdout.write(snippet(platform, { endpoint: values.endpoint }));
    return 0;
  }
  if (command !== "check") {
    process.stderr.write(`Unknown command "${command}".\n\n${HELP}`);
    return 2;
  }
  const { values, positionals } = parseArgs({
    args: rest,
    allowPositionals: true,
    options: {
      kind: { type: "string", default: "both" },
      json: { type: "boolean", default: false },
      "warn-ok": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) {
    process.stdout.write(HELP);
    return 0;
  }
  if (positionals.length === 0) {
    process.stderr.write(`Missing URL or file.\n\n${HELP}`);
    return 2;
  }
  const kinds: DeclarationKind[] =
    values.kind === "both"
      ? ["withdrawal", "cancellation"]
      : values.kind === "withdrawal" || values.kind === "cancellation"
        ? [values.kind]
        : [];
  if (kinds.length === 0) {
    process.stderr.write(`Unknown --kind "${values.kind}".\n`);
    return 2;
  }

  const results: CheckResult[] = [];
  for (const target of positionals) {
    if (/^https?:\/\//i.test(target)) {
      results.push(await checkUrl(target, kinds));
    } else {
      results.push({ url: target, ...checkHtml(await readFile(target, "utf8"), kinds) });
    }
  }

  if (values.json) process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
  else process.stdout.write(`${results.map(print).join("\n\n")}\n`);

  const bad = results.some(
    (r) => r.verdict === "fail" || (r.verdict === "warn" && !values["warn-ok"]),
  );
  return bad ? 1 : 0;
}
