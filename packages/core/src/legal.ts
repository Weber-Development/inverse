/**
 * The state of the law Inverse was last checked against, and what changed since 0.1.
 * `inverse legal` prints it; the docs page "Legal status" lists the same entries.
 */
export const legalRevision = {
  /** Date the rules and texts were last checked against sources, `YYYY-MM-DD`. */
  checkedOn: "2026-10-06",
  /** Where the requirements come from. */
  sources: [
    "Directive (EU) 2023/2673, Article 11a Consumer Rights Directive (withdrawal function)",
    "§ 356a BGB (withdrawal function, in force 19 June 2026)",
    "§ 312k BGB (cancellation button, in force 1 July 2022)",
    "§§ 187, 188, 193 BGB (calculation of periods), § 357 BGB (refund within 14 days)",
  ],
  /** What changed in Inverse because of the law, newest first. */
  changes: [
    {
      version: "0.9.0",
      date: "2026-10-09",
      summary:
        "Austria page added: what Inverse covers for Austria and what it does not claim. No change in requirements.",
    },
    {
      version: "0.8.0",
      date: "2026-10-09",
      summary: "WordPress plugin; forms checked with axe (WCAG rules). No change in requirements.",
    },
    {
      version: "0.7.0",
      date: "2026-10-07",
      summary: "Example projects added. No change in requirements.",
    },
    {
      version: "0.6.0",
      date: "2026-10-06",
      summary:
        "Integrations for WooCommerce, Shopware and Shopify (`inverse snippet`). No change in requirements.",
    },
    {
      version: "0.5.0",
      date: "2026-10-06",
      summary:
        "Revision record added. No change in requirements; Austria applies the withdrawal function from 1 October 2026 and uses the same labels.",
    },
    {
      version: "0.3.0",
      date: "2026-10-06",
      summary:
        "Dutch, Spanish and Polish added; withdrawal labels taken verbatim from Article 11a of the directive.",
    },
    {
      version: "0.1.0",
      date: "2026-10-05",
      summary:
        "Labels, two-step flow, receipt with date and time, downloadable copy and page check for § 356a and § 312k BGB.",
    },
  ],
} as const;

export type LegalRevision = typeof legalRevision;
