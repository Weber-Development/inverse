import type { Locale } from "./types";

/** Legal areas Inverse knows. `ch` is a note only: see {@link Jurisdiction.withdrawalFunction}. */
export const jurisdictionIds = ["de", "at", "ch", "fr", "it", "es", "nl", "pl"] as const;

export type JurisdictionId = (typeof jurisdictionIds)[number];

/**
 * How well Inverse knows the rules of a legal area.
 *
 * - `checked`: the national provision was read and the dates and labels were compared.
 * - `directive`: Inverse follows Article 11a of Directive (EU) 2023/2673 only. The national
 *   implementing act was not read; look it up before you rely on it.
 * - `note`: no EU duty applies; Inverse only offers the same flow voluntarily.
 */
export type Verification = "checked" | "directive" | "note";

export interface Jurisdiction {
  id: JurisdictionId;
  /** English name of the country. */
  country: string;
  /** Language used when a handler gets no `locale`. */
  defaultLocale: Locale;
  verification: Verification;
  withdrawalFunction: {
    /** Whether a withdrawal function is required for online contracts, as far as Inverse knows. */
    required: boolean;
    /** First day the duty applies, `YYYY-MM-DD`, or `null` if Inverse does not state one. */
    since: string | null;
    /** The provision the duty comes from. */
    basis: string;
  };
  cancellationButton: {
    /** `true` only where Inverse knows a statutory cancellation button duty. */
    required: boolean;
    basis: string | null;
  };
  /** Days of the withdrawal period. */
  withdrawalDays: number;
  /** What a consumer should read before relying on this entry. */
  note: string;
}

const DIRECTIVE = "Directive (EU) 2023/2673, Article 11a Consumer Rights Directive";

export const jurisdictions: Record<JurisdictionId, Jurisdiction> = {
  de: {
    id: "de",
    country: "Germany",
    defaultLocale: "de",
    verification: "checked",
    withdrawalFunction: { required: true, since: "2026-06-19", basis: "§ 356a BGB" },
    cancellationButton: { required: true, basis: "§ 312k BGB" },
    withdrawalDays: 14,
    note: "Both duties apply to online contracts with consumers.",
  },
  at: {
    id: "at",
    country: "Austria",
    defaultLocale: "de",
    verification: "checked",
    withdrawalFunction: {
      required: true,
      since: "2026-10-01",
      basis: `${DIRECTIVE}, implemented in the FAGG`,
    },
    cancellationButton: { required: false, basis: null },
    withdrawalDays: 14,
    note: "Inverse states no Austrian cancellation button duty. Look up the FAGG at ris.bka.gv.at.",
  },
  ch: {
    id: "ch",
    country: "Switzerland",
    defaultLocale: "de",
    verification: "note",
    withdrawalFunction: {
      required: false,
      since: null,
      basis: "No EU duty; Inverse makes no statement on Swiss law.",
    },
    cancellationButton: { required: false, basis: null },
    withdrawalDays: 14,
    note: "Use the flow voluntarily if you want to. EU customers are covered by the EU duty wherever your shop sits.",
  },
  fr: {
    id: "fr",
    country: "France",
    defaultLocale: "fr",
    verification: "directive",
    withdrawalFunction: { required: true, since: "2026-06-19", basis: DIRECTIVE },
    cancellationButton: { required: false, basis: null },
    withdrawalDays: 14,
    note: "The French implementing act was not read. Check the Code de la consommation on legifrance.gouv.fr.",
  },
  it: {
    id: "it",
    country: "Italy",
    defaultLocale: "it",
    verification: "directive",
    withdrawalFunction: { required: true, since: "2026-06-19", basis: DIRECTIVE },
    cancellationButton: { required: false, basis: null },
    withdrawalDays: 14,
    note: "The Italian implementing act was not read. Check the Codice del consumo on normattiva.it.",
  },
  es: {
    id: "es",
    country: "Spain",
    defaultLocale: "es",
    verification: "directive",
    withdrawalFunction: { required: true, since: "2026-06-19", basis: DIRECTIVE },
    cancellationButton: { required: false, basis: null },
    withdrawalDays: 14,
    note: "The Spanish implementing act was not read. Check the Ley General para la Defensa de los Consumidores on boe.es.",
  },
  nl: {
    id: "nl",
    country: "Netherlands",
    defaultLocale: "nl",
    verification: "directive",
    withdrawalFunction: { required: true, since: "2026-06-19", basis: DIRECTIVE },
    cancellationButton: { required: false, basis: null },
    withdrawalDays: 14,
    note: "The Dutch implementing act was not read. Check the Burgerlijk Wetboek (Boek 6) on wetten.overheid.nl.",
  },
  pl: {
    id: "pl",
    country: "Poland",
    defaultLocale: "pl",
    verification: "directive",
    withdrawalFunction: { required: true, since: "2026-06-19", basis: DIRECTIVE },
    cancellationButton: { required: false, basis: null },
    withdrawalDays: 14,
    note: "The Polish implementing act was not read. Check the ustawa o prawach konsumenta on isap.sejm.gov.pl.",
  },
};

export function isJurisdiction(value: unknown): value is JurisdictionId {
  return typeof value === "string" && (jurisdictionIds as readonly string[]).includes(value);
}

export function getJurisdiction(id: JurisdictionId): Jurisdiction {
  return jurisdictions[id];
}
