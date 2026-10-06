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

// Dutch, Spanish and Polish: the withdrawal labels are the wording of Article 11a of
// Directive 2011/83/EU (as amended by Directive (EU) 2023/2673) in that language version.
// All other texts are translations; have them reviewed before production use.

const nl: Messages = {
  withdrawal: {
    button: "Hier de overeenkomst herroepen",
    confirm: "Herroeping bevestigen",
    title: "Overeenkomst herroepen",
    intro:
      "Met dit formulier kunt u uw overeenkomst binnen de herroepingstermijn herroepen. U ontvangt direct een ontvangstbevestiging per e-mail.",
    reviewTitle: "Controleer uw gegevens",
    doneTitle: "Wij hebben uw herroeping ontvangen",
    doneText: "Er is een ontvangstbevestiging verzonden naar {email}.",
  },
  cancellation: {
    button: "Overeenkomsten hier opzeggen",
    confirm: "Nu opzeggen",
    title: "Overeenkomst opzeggen",
    intro:
      "Met dit formulier kunt u uw overeenkomst opzeggen zonder in te loggen. U ontvangt direct een ontvangstbevestiging per e-mail.",
    reviewTitle: "Controleer uw opzegging",
    doneTitle: "Wij hebben uw opzegging ontvangen",
    doneText: "Er is een ontvangstbevestiging verzonden naar {email}.",
  },
  fields: {
    name: "Voor- en achternaam",
    email: "E-mailadres voor de bevestiging",
    contractRef: "Bestel- of contractnummer",
    items: "Alleen deze artikelen of onderdelen (optioneel)",
    message: "Bericht (optioneel)",
    cancellationType: "Soort opzegging",
    ordinary: "Gewone opzegging",
    extraordinary: "Buitengewone opzegging (zonder opzegtermijn)",
    reason: "Reden van de opzegging",
    effectiveDate: "Opzeggen per",
    earliest: "Eerst mogelijke datum",
  },
  actions: {
    next: "Verder",
    back: "Terug",
    download: "Bevestiging downloaden",
  },
  errors: {
    required: "Vul dit veld in.",
    email: "Vul een geldig e-mailadres in.",
    too_long: "Deze tekst is te lang.",
    date: "Vul een geldige datum in.",
    type: "Ongeldige keuze.",
    network: "De verklaring kon niet worden verzonden. Probeer het opnieuw.",
  },
  receipt: {
    withdrawalSubject: "Ontvangstbevestiging van uw herroeping ({id})",
    cancellationSubject: "Ontvangstbevestiging van uw opzegging ({id})",
    greeting: "Beste {name}",
    withdrawalBody: "wij bevestigen de ontvangst van uw herroeping met de volgende inhoud:",
    cancellationBody: "wij bevestigen de ontvangst van uw opzegging met de volgende inhoud:",
    receivedAt: "Ontvangen op",
    reference: "Referentie",
    content: "Inhoud van de verklaring",
    endsAt: "De overeenkomst eindigt op",
    endsAtUnknown: "Wij laten u apart weten wanneer de overeenkomst eindigt.",
    footer: "Deze bevestiging is automatisch aangemaakt. Bewaar haar goed.",
  },
};

const es: Messages = {
  withdrawal: {
    button: "Desistir del contrato aquí",
    confirm: "Confirmar desistimiento",
    title: "Desistir del contrato",
    intro:
      "Con este formulario puede desistir de su contrato dentro del plazo de desistimiento. Recibirá de inmediato un acuse de recibo por correo electrónico.",
    reviewTitle: "Compruebe sus datos",
    doneTitle: "Hemos recibido su desistimiento",
    doneText: "Se ha enviado un acuse de recibo a {email}.",
  },
  cancellation: {
    button: "Cancelar contratos aquí",
    confirm: "Cancelar ahora",
    title: "Cancelar el contrato",
    intro:
      "Con este formulario puede cancelar su contrato sin iniciar sesión. Recibirá de inmediato un acuse de recibo por correo electrónico.",
    reviewTitle: "Compruebe su cancelación",
    doneTitle: "Hemos recibido su cancelación",
    doneText: "Se ha enviado un acuse de recibo a {email}.",
  },
  fields: {
    name: "Nombre y apellidos",
    email: "Correo electrónico para la confirmación",
    contractRef: "Número de pedido o de contrato",
    items: "Solo estos artículos o partes (opcional)",
    message: "Mensaje (opcional)",
    cancellationType: "Tipo de cancelación",
    ordinary: "Cancelación ordinaria",
    extraordinary: "Cancelación extraordinaria (sin preaviso)",
    reason: "Motivo de la cancelación",
    effectiveDate: "Cancelar con fecha",
    earliest: "Lo antes posible",
  },
  actions: {
    next: "Continuar",
    back: "Volver",
    download: "Descargar la confirmación",
  },
  errors: {
    required: "Rellene este campo.",
    email: "Introduzca una dirección de correo electrónico válida.",
    too_long: "Este texto es demasiado largo.",
    date: "Introduzca una fecha válida.",
    type: "Opción no válida.",
    network: "No se ha podido enviar la declaración. Inténtelo de nuevo.",
  },
  receipt: {
    withdrawalSubject: "Acuse de recibo de su desistimiento ({id})",
    cancellationSubject: "Acuse de recibo de su cancelación ({id})",
    greeting: "Hola, {name}",
    withdrawalBody: "confirmamos la recepción de su desistimiento con el siguiente contenido:",
    cancellationBody: "confirmamos la recepción de su cancelación con el siguiente contenido:",
    receivedAt: "Recibido el",
    reference: "Referencia",
    content: "Contenido de la declaración",
    endsAt: "El contrato finaliza el",
    endsAtUnknown: "Le comunicaremos por separado la fecha de finalización del contrato.",
    footer: "Esta confirmación se ha generado automáticamente. Consérvela.",
  },
};

const pl: Messages = {
  withdrawal: {
    button: "Odstąp od umowy tutaj",
    confirm: "Potwierdź odstąpienie od umowy",
    title: "Odstąpienie od umowy",
    intro:
      "Za pomocą tego formularza można odstąpić od umowy w terminie na odstąpienie. Potwierdzenie otrzymania zostanie od razu wysłane e-mailem.",
    reviewTitle: "Sprawdź swoje dane",
    doneTitle: "Otrzymaliśmy Twoje odstąpienie od umowy",
    doneText: "Potwierdzenie otrzymania wysłaliśmy na adres {email}.",
  },
  cancellation: {
    button: "Wypowiedz umowy tutaj",
    confirm: "Wypowiedz teraz",
    title: "Wypowiedzenie umowy",
    intro:
      "Za pomocą tego formularza można wypowiedzieć umowę bez logowania. Potwierdzenie otrzymania zostanie od razu wysłane e-mailem.",
    reviewTitle: "Sprawdź swoje wypowiedzenie",
    doneTitle: "Otrzymaliśmy Twoje wypowiedzenie",
    doneText: "Potwierdzenie otrzymania wysłaliśmy na adres {email}.",
  },
  fields: {
    name: "Imię i nazwisko",
    email: "Adres e-mail do potwierdzenia",
    contractRef: "Numer zamówienia lub umowy",
    items: "Tylko te artykuły lub części (opcjonalnie)",
    message: "Wiadomość (opcjonalnie)",
    cancellationType: "Rodzaj wypowiedzenia",
    ordinary: "Wypowiedzenie zwykłe",
    extraordinary: "Wypowiedzenie nadzwyczajne (bez zachowania okresu wypowiedzenia)",
    reason: "Przyczyna wypowiedzenia",
    effectiveDate: "Wypowiedzenie ze skutkiem na dzień",
    earliest: "Najwcześniejszy możliwy termin",
  },
  actions: {
    next: "Dalej",
    back: "Wstecz",
    download: "Pobierz potwierdzenie",
  },
  errors: {
    required: "Wypełnij to pole.",
    email: "Podaj prawidłowy adres e-mail.",
    too_long: "Ten tekst jest za długi.",
    date: "Podaj prawidłową datę.",
    type: "Nieprawidłowy wybór.",
    network: "Nie udało się wysłać oświadczenia. Spróbuj ponownie.",
  },
  receipt: {
    withdrawalSubject: "Potwierdzenie otrzymania odstąpienia od umowy ({id})",
    cancellationSubject: "Potwierdzenie otrzymania wypowiedzenia ({id})",
    greeting: "Dzień dobry {name}",
    withdrawalBody: "potwierdzamy otrzymanie odstąpienia od umowy o następującej treści:",
    cancellationBody: "potwierdzamy otrzymanie wypowiedzenia o następującej treści:",
    receivedAt: "Data otrzymania",
    reference: "Numer referencyjny",
    content: "Treść oświadczenia",
    endsAt: "Umowa kończy się",
    endsAtUnknown: "O dacie zakończenia umowy poinformujemy oddzielnie.",
    footer: "To potwierdzenie zostało utworzone automatycznie. Prosimy je zachować.",
  },
};

export const messages: Record<Locale, Messages> = { de, en, fr, it, nl, es, pl };

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
