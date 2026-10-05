import type { HandlerResult } from "@sweberdev/inverse";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CancellationForm, InverseLink, WithdrawalForm } from "../src";

afterEach(cleanup);

describe("InverseLink", () => {
  it("uses the statutory labels", () => {
    render(
      <>
        <InverseLink kind="withdrawal" href="/widerruf" />
        <InverseLink kind="cancellation" href="/kuendigen" />
        <InverseLink kind="cancellation" href="/cancel" locale="en" />
      </>,
    );
    expect(screen.getByRole("link", { name: "Vertrag widerrufen" }).getAttribute("href")).toBe(
      "/widerruf",
    );
    expect(screen.getByRole("link", { name: "Verträge hier kündigen" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Cancel contracts here" })).toBeTruthy();
  });
});

describe("WithdrawalForm", () => {
  it("validates, shows the review step and confirms", async () => {
    const submit = vi.fn(
      async (): Promise<HandlerResult> => ({
        ok: true,
        id: "W-ABC",
        kind: "withdrawal",
        receivedAt: "2026-10-05T12:00:00.000Z",
        copy: "Ihr Widerruf ist eingegangen\nReferenz: W-ABC\n",
      }),
    );
    render(<WithdrawalForm endpoint="/api/inverse" submit={submit} />);

    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    expect(screen.getAllByText("Bitte ausfüllen.")).toHaveLength(3);

    fireEvent.change(screen.getByLabelText("Vor- und Nachname"), { target: { value: "Erika" } });
    fireEvent.change(screen.getByLabelText("E-Mail-Adresse für die Bestätigung"), {
      target: { value: "erika@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Bestell- oder Vertragsnummer"), {
      target: { value: "A-1001" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    expect(screen.getByText("Bitte prüfen Sie Ihre Angaben")).toBeTruthy();
    expect(screen.getByText("A-1001")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Widerruf bestätigen" }));

    await waitFor(() => expect(screen.getByText("Ihr Widerruf ist eingegangen")).toBeTruthy());
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "withdrawal",
        data: { name: "Erika", email: "erika@example.com", contractRef: "A-1001" },
      }),
    );
    expect(screen.getByRole("button", { name: "Bestätigung herunterladen" })).toBeTruthy();
  });

  it("shows an error and stays on the review step when sending fails", async () => {
    const submit = vi.fn(async (): Promise<HandlerResult> => ({ ok: false, error: "server" }));
    render(
      <WithdrawalForm
        endpoint="/api/inverse"
        submit={submit}
        defaultValues={{ name: "Erika", email: "erika@example.com", contractRef: "A-1" }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    fireEvent.click(screen.getByRole("button", { name: "Widerruf bestätigen" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.getByRole("button", { name: "Widerruf bestätigen" })).toBeTruthy();
  });
});

describe("CancellationForm", () => {
  it("asks for a reason for an extraordinary cancellation and uses the confirm label", () => {
    render(
      <CancellationForm
        endpoint="/api/inverse"
        locale="en"
        defaultValues={{ name: "Max", email: "max@example.com", contractRef: "K-7" }}
      />,
    );
    fireEvent.click(screen.getByLabelText("Extraordinary cancellation (without notice)"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Please fill in this field.")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Reason for cancellation"), {
      target: { value: "Price increase" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("button", { name: "Cancel now" })).toBeTruthy();
    expect(screen.getByText("Earliest possible date")).toBeTruthy();
  });
});
