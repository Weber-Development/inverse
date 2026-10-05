import type { Locale } from "./types";

export interface Messages {
  withdrawal: {
    /** Label of the withdrawal function (§ 356a Abs. 1 BGB: "Vertrag widerrufen"). */
    button: string;
    /** Label of the confirmation function (§ 356a Abs. 3 BGB: "Widerruf bestätigen"). */
    confirm: string;
    title: string;
    intro: string;
    reviewTitle: string;
    doneTitle: string;
    doneText: string;
  };
  cancellation: {
    /** Label of the cancellation button (§ 312k Abs. 2 BGB: "Verträge hier kündigen"). */
    button: string;
    /** Label of the confirmation button (§ 312k Abs. 2 BGB: "jetzt kündigen"). */
    confirm: string;
    title: string;
    intro: string;
    reviewTitle: string;
    doneTitle: string;
    doneText: string;
  };
  fields: {
    name: string;
    email: string;
    contractRef: string;
    items: string;
    message: string;
    cancellationType: string;
    ordinary: string;
    extraordinary: string;
    reason: string;
    effectiveDate: string;
    earliest: string;
  };
  actions: {
    next: string;
    back: string;
    download: string;
  };
  errors: {
    required: string;
    email: string;
    too_long: string;
    date: string;
    type: string;
    network: string;
  };
  receipt: {
    withdrawalSubject: string;
    cancellationSubject: string;
    greeting: string;
    withdrawalBody: string;
    cancellationBody: string;
    receivedAt: string;
    reference: string;
    content: string;
    endsAt: string;
    endsAtUnknown: string;
    footer: string;
  };
}

const de: Messages = {
  withdrawal: {
    button: "Vertrag widerrufen",
    confirm: "Widerruf bestätigen",
    title: "Vertrag widerrufen",
    intro:
      "Hier können Sie Ihren Vertrag innerhalb der Widerrufsfrist widerrufen. Sie erhalten sofort eine Eingangsbestätigung per E-Mail.",
    reviewTitle: "Bitte prüfen Sie Ihre Angaben",
    doneTitle: "Ihr Widerruf ist eingegangen",
    doneText: "Wir haben Ihnen eine Eingangsbestätigung an {email} gesendet.",
  },
  cancellation: {
    button: "Verträge hier kündigen",
    confirm: "Jetzt kündigen",
    title: "Vertrag kündigen",
    intro:
      "Hier können Sie Ihren Vertrag ohne Anmeldung kündigen. Sie erhalten sofort eine Eingangsbestätigung per E-Mail.",
    reviewTitle: "Bitte prüfen Sie Ihre Kündigung",
    doneTitle: "Ihre Kündigung ist eingegangen",
    doneText: "Wir haben Ihnen eine Eingangsbestätigung an {email} gesendet.",
  },
  fields: {
    name: "Vor- und Nachname",
    email: "E-Mail-Adresse für die Bestätigung",
    contractRef: "Bestell- oder Vertragsnummer",
    items: "Nur diese Artikel oder Teile (optional)",
    message: "Mitteilung (optional)",
    cancellationType: "Art der Kündigung",
    ordinary: "Ordentliche Kündigung",
    extraordinary: "Ausserordentliche (fristlose) Kündigung",
    reason: "Kündigungsgrund",
    effectiveDate: "Kündigen zum",
    earliest: "Nächstmöglichen Zeitpunkt",
  },
  actions: {
    next: "Weiter",
    back: "Zurück",
    download: "Bestätigung herunterladen",
  },
  errors: {
    required: "Bitte ausfüllen.",
    email: "Bitte eine gültige E-Mail-Adresse angeben.",
    too_long: "Dieser Text ist zu lang.",
    date: "Bitte ein gültiges Datum angeben.",
    type: "Ungültige Auswahl.",
    network: "Die Erklärung konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
  },
  receipt: {
    withdrawalSubject: "Eingangsbestätigung Ihres Widerrufs ({id})",
    cancellationSubject: "Eingangsbestätigung Ihrer Kündigung ({id})",
    greeting: "Guten Tag {name}",
    withdrawalBody: "wir bestätigen den Eingang Ihres Widerrufs mit folgendem Inhalt:",
    cancellationBody: "wir bestätigen den Eingang Ihrer Kündigung mit folgendem Inhalt:",
    receivedAt: "Eingegangen am",
    reference: "Referenz",
    content: "Inhalt der Erklärung",
    endsAt: "Der Vertrag endet am",
    endsAtUnknown: "Wir teilen Ihnen das Vertragsende separat mit.",
    footer: "Diese Bestätigung wurde automatisch erstellt. Bitte bewahren Sie sie auf.",
  },
};

const en: Messages = {
  withdrawal: {
    button: "Withdraw from contract here",
    confirm: "Confirm withdrawal",
    title: "Withdraw from contract",
    intro:
      "Use this form to withdraw from your contract within the withdrawal period. You receive an acknowledgement of receipt by e-mail straight away.",
    reviewTitle: "Please check your details",
    doneTitle: "We have received your withdrawal",
    doneText: "An acknowledgement of receipt has been sent to {email}.",
  },
  cancellation: {
    button: "Cancel contracts here",
    confirm: "Cancel now",
    title: "Cancel contract",
    intro:
      "Use this form to cancel your contract without logging in. You receive an acknowledgement of receipt by e-mail straight away.",
    reviewTitle: "Please check your cancellation",
    doneTitle: "We have received your cancellation",
    doneText: "An acknowledgement of receipt has been sent to {email}.",
  },
  fields: {
    name: "Full name",
    email: "E-mail address for the confirmation",
    contractRef: "Order or contract number",
    items: "Only these items or parts (optional)",
    message: "Message (optional)",
    cancellationType: "Type of cancellation",
    ordinary: "Ordinary cancellation",
    extraordinary: "Extraordinary cancellation (without notice)",
    reason: "Reason for cancellation",
    effectiveDate: "Cancel as of",
    earliest: "Earliest possible date",
  },
  actions: {
    next: "Continue",
    back: "Back",
    download: "Download confirmation",
  },
  errors: {
    required: "Please fill in this field.",
    email: "Please enter a valid e-mail address.",
    too_long: "This text is too long.",
    date: "Please enter a valid date.",
    type: "Invalid choice.",
    network: "The declaration could not be sent. Please try again.",
  },
  receipt: {
    withdrawalSubject: "Acknowledgement of your withdrawal ({id})",
    cancellationSubject: "Acknowledgement of your cancellation ({id})",
    greeting: "Hello {name}",
    withdrawalBody: "we confirm receipt of your withdrawal with the following content:",
    cancellationBody: "we confirm receipt of your cancellation with the following content:",
    receivedAt: "Received on",
    reference: "Reference",
    content: "Content of the declaration",
    endsAt: "The contract ends on",
    endsAtUnknown: "We will tell you separately when the contract ends.",
    footer: "This confirmation was generated automatically. Please keep it for your records.",
  },
};

const fr: Messages = {
  withdrawal: {
    button: "Se rétracter du contrat ici",
    confirm: "Confirmer la rétractation",
    title: "Se rétracter du contrat",
    intro:
      "Ce formulaire vous permet de vous rétracter de votre contrat pendant le délai de rétractation. Vous recevez immédiatement un accusé de réception par e-mail.",
    reviewTitle: "Veuillez vérifier vos informations",
    doneTitle: "Votre rétractation a été reçue",
    doneText: "Un accusé de réception a été envoyé à {email}.",
  },
  cancellation: {
    button: "Résilier les contrats ici",
    confirm: "Résilier maintenant",
    title: "Résilier le contrat",
    intro:
      "Ce formulaire vous permet de résilier votre contrat sans vous connecter. Vous recevez immédiatement un accusé de réception par e-mail.",
    reviewTitle: "Veuillez vérifier votre résiliation",
    doneTitle: "Votre résiliation a été reçue",
    doneText: "Un accusé de réception a été envoyé à {email}.",
  },
  fields: {
    name: "Nom et prénom",
    email: "Adresse e-mail pour la confirmation",
    contractRef: "Numéro de commande ou de contrat",
    items: "Uniquement ces articles ou parties (facultatif)",
    message: "Message (facultatif)",
    cancellationType: "Type de résiliation",
    ordinary: "Résiliation ordinaire",
    extraordinary: "Résiliation extraordinaire (sans préavis)",
    reason: "Motif de la résiliation",
    effectiveDate: "Résilier au",
    earliest: "Date la plus proche possible",
  },
  actions: {
    next: "Continuer",
    back: "Retour",
    download: "Télécharger la confirmation",
  },
  errors: {
    required: "Veuillez remplir ce champ.",
    email: "Veuillez saisir une adresse e-mail valide.",
    too_long: "Ce texte est trop long.",
    date: "Veuillez saisir une date valide.",
    type: "Choix non valide.",
    network: "La déclaration n'a pas pu être envoyée. Veuillez réessayer.",
  },
  receipt: {
    withdrawalSubject: "Accusé de réception de votre rétractation ({id})",
    cancellationSubject: "Accusé de réception de votre résiliation ({id})",
    greeting: "Bonjour {name}",
    withdrawalBody: "nous confirmons la réception de votre rétractation avec le contenu suivant :",
    cancellationBody: "nous confirmons la réception de votre résiliation avec le contenu suivant :",
    receivedAt: "Reçue le",
    reference: "Référence",
    content: "Contenu de la déclaration",
    endsAt: "Le contrat prend fin le",
    endsAtUnknown: "Nous vous communiquerons séparément la date de fin du contrat.",
    footer: "Cette confirmation a été générée automatiquement. Veuillez la conserver.",
  },
};

const it: Messages = {
  withdrawal: {
    button: "Recedere dal contratto qui",
    confirm: "Confermare il recesso",
    title: "Recedere dal contratto",
    intro:
      "Con questo modulo può recedere dal contratto entro il periodo di recesso. Riceverà subito una conferma di ricezione via e-mail.",
    reviewTitle: "Verifichi i suoi dati",
    doneTitle: "Abbiamo ricevuto il suo recesso",
    doneText: "Una conferma di ricezione è stata inviata a {email}.",
  },
  cancellation: {
    button: "Disdire i contratti qui",
    confirm: "Disdire ora",
    title: "Disdire il contratto",
    intro:
      "Con questo modulo può disdire il contratto senza effettuare l'accesso. Riceverà subito una conferma di ricezione via e-mail.",
    reviewTitle: "Verifichi la sua disdetta",
    doneTitle: "Abbiamo ricevuto la sua disdetta",
    doneText: "Una conferma di ricezione è stata inviata a {email}.",
  },
  fields: {
    name: "Nome e cognome",
    email: "Indirizzo e-mail per la conferma",
    contractRef: "Numero d'ordine o di contratto",
    items: "Solo questi articoli o parti (facoltativo)",
    message: "Messaggio (facoltativo)",
    cancellationType: "Tipo di disdetta",
    ordinary: "Disdetta ordinaria",
    extraordinary: "Disdetta straordinaria (senza preavviso)",
    reason: "Motivo della disdetta",
    effectiveDate: "Disdire al",
    earliest: "Prima data possibile",
  },
  actions: {
    next: "Avanti",
    back: "Indietro",
    download: "Scarica la conferma",
  },
  errors: {
    required: "Compili questo campo.",
    email: "Inserisca un indirizzo e-mail valido.",
    too_long: "Questo testo è troppo lungo.",
    date: "Inserisca una data valida.",
    type: "Scelta non valida.",
    network: "Non è stato possibile inviare la dichiarazione. Riprovi.",
  },
  receipt: {
    withdrawalSubject: "Conferma di ricezione del suo recesso ({id})",
    cancellationSubject: "Conferma di ricezione della sua disdetta ({id})",
    greeting: "Buongiorno {name}",
    withdrawalBody: "confermiamo la ricezione del suo recesso con il seguente contenuto:",
    cancellationBody: "confermiamo la ricezione della sua disdetta con il seguente contenuto:",
    receivedAt: "Ricevuta il",
    reference: "Riferimento",
    content: "Contenuto della dichiarazione",
    endsAt: "Il contratto termina il",
    endsAtUnknown: "Le comunicheremo separatamente la data di fine del contratto.",
    footer: "Questa conferma è stata generata automaticamente. La conservi.",
  },
};

export const messages: Record<Locale, Messages> = { de, en, fr, it };

export const locales = Object.keys(messages) as Locale[];

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

export type MessageOverrides = DeepPartial<Messages>;

/** Returns the messages for a locale, with optional overrides merged in. */
export function getMessages(locale: Locale = "de", overrides?: MessageOverrides): Messages {
  const base = messages[locale] ?? messages.de;
  if (!overrides) return base;
  const out = structuredClone(base) as unknown as Record<string, Record<string, string>>;
  for (const [group, values] of Object.entries(overrides)) {
    if (!values || !out[group]) continue;
    Object.assign(out[group], values);
  }
  return out as unknown as Messages;
}

/** Replaces `{key}` placeholders. */
export function format(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && value in messages;
}
