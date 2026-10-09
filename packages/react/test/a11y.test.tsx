import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import { CancellationForm, InverseLink, WithdrawalForm } from "../src";

afterEach(cleanup);

// jsdom has no layout, so colour contrast cannot be checked here; everything else runs.
async function violations(container: HTMLElement) {
  const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(" | ")}`);
}

describe("accessibility (axe)", () => {
  it("has no violations in the links", async () => {
    const { container } = render(
      <main>
        <InverseLink kind="withdrawal" href="/widerruf" />
        <InverseLink kind="cancellation" href="/kuendigen" />
      </main>,
    );
    expect(await violations(container)).toEqual([]);
  });

  for (const locale of ["de", "en"] as const) {
    it(`has no violations in the withdrawal form (${locale}), also with errors`, async () => {
      const { container } = render(
        <main>
          <WithdrawalForm endpoint="/api/inverse" locale={locale} />
        </main>,
      );
      expect(await violations(container)).toEqual([]);
      fireEvent.click(screen.getAllByRole("button")[0] as HTMLElement);
      expect(await violations(container)).toEqual([]);
    });

    it(`has no violations in the cancellation form (${locale}), also with errors`, async () => {
      const { container } = render(
        <main>
          <CancellationForm endpoint="/api/inverse" locale={locale} />
        </main>,
      );
      expect(await violations(container)).toEqual([]);
      fireEvent.click(screen.getAllByRole("button")[0] as HTMLElement);
      expect(await violations(container)).toEqual([]);
    });
  }
});
