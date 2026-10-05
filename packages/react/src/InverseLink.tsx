import { type DeclarationKind, getMessages, type Locale } from "@sweberdev/inverse";
import type { AnchorHTMLAttributes } from "react";

export interface InverseLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  kind: DeclarationKind;
  href: string;
  locale?: Locale;
}

/**
 * The entry point: a link labelled "Vertrag widerrufen" or "Verträge hier kündigen".
 * Put it in a place that is visible on every page, such as the footer, and link to a page
 * that works without login.
 */
export function InverseLink({
  kind,
  locale = "de",
  children,
  className,
  ...rest
}: InverseLinkProps) {
  const m = getMessages(locale);
  return (
    <a {...rest} className={["inverse-link", className].filter(Boolean).join(" ")} data-kind={kind}>
      {children ?? (kind === "withdrawal" ? m.withdrawal.button : m.cancellation.button)}
    </a>
  );
}
