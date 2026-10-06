import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { type CheckResult, checkHtml, checkUrl, type Verdict } from "./check";
import { legalRevision } from "./legal";
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

inverse legal
  prints the state of the law Inverse was checked against, and what changed since 0.1.
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
    const r = legalRevision;
    process.stdout.write(
      `Legal status checked on ${r.checkedOn}\n\nSources:\n${r.sources.map((x) => `  - ${x}`).join("\n")}\n\nChanges:\n${r.changes.map((c) => `  ${c.date}  ${c.version}  ${c.summary}`).join("\n")}\n`,
    );
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
