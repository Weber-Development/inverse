---
title: Audit
description: Check a whole site, or all your clients' sites, for the withdrawal and cancellation buttons.
---

The free CLI checks single pages. `inverse-audit` checks a whole site:

1. reads `sitemap.xml` (and nested sitemaps) or crawls internal links from the start page,
2. checks every page for the withdrawal and cancellation button,
3. follows the button to its target and checks that the page loads without cookies, is not a login page, and shows a form or the confirm label,
4. writes an HTML report you can send to a client, plus JSON for your tools.

```sh
npx inverse-audit https://shop.example.com --html report.html
npx inverse-audit https://shop.example.com --kind withdrawal --max 500 --json report.json
npx inverse-audit --sites sites.txt --html-dir reports/
```

`sites.txt` has one URL per line, which is how agencies check all client sites in one run, e.g. weekly in CI.

| Option | |
|---|---|
| `--kind` | `withdrawal`, `cancellation` or `both` (default) |
| `--max` | maximum pages per site (default 200) |
| `--concurrency` | parallel requests (default 4) |
| `--no-sitemap` | crawl links instead of reading the sitemap |
| `--include`, `--exclude` | regular expressions for paths |
| `--html`, `--json` | report files |
| `--csv` | one row per site with verdict, page counts and button targets, for spreadsheets |
| `--sites`, `--html-dir` | many sites, one report each |
| `--warn-ok` | exit 0 on warnings |
| `--baseline` | compare with an earlier `--json` report; exits 1 only if something got worse |

## Reports for clients

The HTML report has a print stylesheet: open it in a browser and choose *Print → Save as PDF* for an A4 report you can attach to an offer or an invoice. For many sites, `--csv` writes one row per site, which fits a spreadsheet that tracks all clients:

```sh
npx inverse-audit --sites sites.txt --html-dir reports/ --csv overview.csv
```

## Monitoring changes

Run the audit on a schedule and compare it with the last run. A theme update that drops the footer link or a new login wall in front of the cancellation page shows up as a regression:

```sh
npx inverse-audit https://shop.example.com --baseline last.json --json today.json && mv today.json last.json
```

```
   ▼ page cancellation https://shop.example.com/: pass → fail
   ▲ page withdrawal https://shop.example.com/agb: warn → pass
```

With `--baseline` the exit code only reflects regressions, so the job stays green while known warnings are being worked on. New pages that fail count as regressions. `--sites` works too: the baseline file is then the JSON array of the previous run.

## In code

```ts
import { auditSite, compareReports, renderCsvReport, renderHtmlReport } from "@weber-development/inverse-audit";

const report = await auditSite("https://shop.example.com", { kinds: ["withdrawal"], maxPages: 100 });
report.verdict; // "pass" | "warn" | "fail"
report.summary; // { pages, pass, warn, fail, targets: [...] }
await writeFile("report.html", renderHtmlReport(report, { lang: "de" }));

const diff = compareReports(lastReport, report);
diff.regressions; // [{ scope: "page", kind: "cancellation", url, before: "pass", after: "fail" }]
```

The report is available in German and English.
