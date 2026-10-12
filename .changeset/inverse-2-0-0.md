---
"@sweberdev/inverse": major
"@sweberdev/inverse-react": major
---

Inverse 2.0: legal areas as an API and a record that shows which state of the rules it followed.

- **Jurisdictions.** New `jurisdiction` handler option (and `jurisdictions` allow-list, `data-jurisdiction` on the form) for `de`, `at`, `ch`, `fr`, `it`, `es`, `nl` and `pl`. Every `DeclarationRecord` now carries `jurisdiction` and `legalCheckedOn`. France, Italy, Spain, the Netherlands and Poland rest on Article 11a of the directive only; the national acts were not read, and each entry says so.
- **Legal status per area.** Breaking: `legalRevision` is replaced by `legalRevisions`, `getLegalRevision(id)` and `legalChangesSince(id, date)`. `inverse legal --jurisdiction <id> [--since <date>]` exits 1 when the status is newer than your date.
- **Node 22.** Breaking: `engines.node` is `>=22`.
- End-to-end test of the browser flow against a real HTTP server (CORS, validation, jurisdictions).

See the migration guide: docs/migrating-to-2.md.
