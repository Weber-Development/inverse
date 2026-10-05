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
| `--sites`, `--html-dir` | many sites, one report each |
| `--warn-ok` | exit 0 on warnings |

## In code

```ts
import { auditSite, renderHtmlReport } from "@weber-development/inverse-audit";

const report = await auditSite("https://shop.example.com", { kinds: ["withdrawal"], maxPages: 100 });
report.verdict; // "pass" | "warn" | "fail"
report.summary; // { pages, pass, warn, fail, targets: [...] }
await writeFile("report.html", renderHtmlReport(report, { lang: "de" }));
```

The report is available in German and English.
