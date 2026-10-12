import { isJurisdiction, type JurisdictionId, jurisdictionIds } from "./jurisdiction";

/** The state of the law Inverse was checked against for one legal area. */
export interface LegalRevision {
  jurisdiction: JurisdictionId;
  /** Date the rules and texts were last checked against sources, `YYYY-MM-DD`. */
  checkedOn: string;
  /** Where the requirements come from. */
  sources: readonly string[];
  /** What changed in Inverse because of the law, newest first. */
  changes: ReadonlyArray<{ version: string; date: string; summary: string }>;
}

const EU_SOURCES = [
  "Directive (EU) 2023/2673, Article 11a Consumer Rights Directive (withdrawal function)",
] as const;

/** Entries that apply to every legal area, newest first. */
const COMMON = [
  {
    version: "2.0.0",
    date: "2026-10-12",
    summary:
      "Legal status is kept per legal area (`legalRevisions`, `getLegalRevision`). France, Italy, Spain, the Netherlands and Poland added on the basis of the directive only. No change in requirements.",
  },
  {
    version: "1.0.0",
    date: "2026-10-09",
    summary:
      "Stable release; public API frozen. Switzerland note added. No change in requirements.",
  },
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
] as const;

const OWN: Record<JurisdictionId, { checkedOn: string; sources: readonly string[] }> = {
  de: {
    checkedOn: "2026-10-12",
    sources: [
      "§ 356a BGB (withdrawal function, in force 19 June 2026)",
      "§ 312k BGB (cancellation button, in force 1 July 2022)",
      "§§ 187, 188, 193 BGB (calculation of periods), § 357 BGB (refund within 14 days)",
    ],
  },
  at: {
    checkedOn: "2026-10-12",
    sources: ["Austrian FAGG (distance and off-premises contracts), applies from 1 October 2026"],
  },
  ch: {
    checkedOn: "2026-10-12",
    sources: ["No EU duty applies; note only"],
  },
  fr: { checkedOn: "2026-10-12", sources: ["National implementing act not read"] },
  it: { checkedOn: "2026-10-12", sources: ["National implementing act not read"] },
  es: { checkedOn: "2026-10-12", sources: ["National implementing act not read"] },
  nl: { checkedOn: "2026-10-12", sources: ["National implementing act not read"] },
  pl: { checkedOn: "2026-10-12", sources: ["National implementing act not read"] },
};

function build(jurisdiction: JurisdictionId): LegalRevision {
  const own = OWN[jurisdiction];
  return {
    jurisdiction,
    checkedOn: own.checkedOn,
    sources: [...EU_SOURCES, ...own.sources],
    changes: COMMON,
  };
}

/** The legal status of every legal area, keyed by jurisdiction id. */
export const legalRevisions = Object.fromEntries(
  jurisdictionIds.map((id) => [id, build(id)]),
) as Record<JurisdictionId, LegalRevision>;

export function getLegalRevision(jurisdiction: JurisdictionId): LegalRevision {
  return legalRevisions[jurisdiction];
}

export interface LegalChangesSince {
  jurisdiction: JurisdictionId;
  /** The date you asked about. */
  since: string;
  /** Entries newer than `since`, newest first. */
  changes: LegalRevision["changes"];
  /** `true` if the legal area was re-checked after `since`. */
  rechecked: boolean;
}

/**
 * What changed for one legal area after a date, so a deployment can notice that the texts or
 * rules it runs on are older than the library's legal status.
 */
export function legalChangesSince(jurisdiction: JurisdictionId, since: string): LegalChangesSince {
  if (!isJurisdiction(jurisdiction)) throw new Error(`Unknown jurisdiction "${jurisdiction}".`);
  const rev = legalRevisions[jurisdiction];
  return {
    jurisdiction,
    since,
    changes: rev.changes.filter((c) => c.date > since),
    rechecked: rev.checkedOn > since,
  };
}
