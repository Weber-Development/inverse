---
title: Continuous monitoring
description: Check your shop pages on a schedule and get an alert when a button goes missing. Beta.
---

`inverse-audit watch` (from 2.1) runs the site audit on every call, compares it with the state of the last run and reports only what changed. A button that vanishes after a deploy, a site that stays broken, and a site that is back.

**Status: beta.** The alert logic, the webhook payloads and the workflow generator are tested. The generated workflow has not been run on a live GitHub runner yet.

## Run it

```sh
npx inverse-audit watch --sites sites.txt --state inverse-watch-state.json --webhook https://hooks.slack.com/services/...
```

Alerts:

- **regression**: a site got worse than before (or is bad on the first run);
- **still failing**: the site stays broken; repeated every `--repeat-hours` (default 24, `0` = once);
- **recovered**: both buttons pass again;
- **unreachable**: the site could not be checked in `--error-threshold` runs in a row (default 2), so one network hiccup does not wake anyone.

`--webhook-format` is `slack` (default; also works for Mattermost and Teams-style incoming hooks), `discord` or `json`. The exit code is 1 when there was an alert (`--fail-on bad` while any site is broken, `never` always 0).

## On a schedule with GitHub Actions

```sh
npx inverse-audit init-action https://shop.example.com --cron "17 * * * *" --webhook > .github/workflows/inverse-watch.yml
```

The workflow runs the check hourly, keeps the state in the Actions cache and fails the run on an alert, so GitHub mails everyone who watches the repository. With `--webhook` it also posts to the URL in the secret `INVERSE_WEBHOOK_URL`. Scheduled runs on GitHub can start late, so treat the interval as approximate. Any other scheduler (cron, a container job) works the same way: run the command, keep the state file.

## In code

```ts
import { watchSites } from "@weber-development/inverse-audit";

const result = await watchSites(["https://shop.example.com"], { state: previousState });
// result.alerts, result.state (store it for the next run), result.reports
```
