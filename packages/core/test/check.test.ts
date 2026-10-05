import { describe, expect, it } from "vitest";
import { checkHtml, extractControls } from "../src";
import { main } from "../src/cli";

describe("extractControls", () => {
  it("reads links, buttons, inputs and role=button with accessible names", () => {
    const controls = extractControls(`
      <!-- <a href="/x">Vertrag widerrufen</a> -->
      <a href="/widerruf"><span>Vertrag</span>&nbsp;widerrufen</a>
      <button aria-label="Verträge hier kündigen"><svg></svg></button>
      <input type="submit" value="Jetzt kündigen">
      <div role="button">Hilfe</div>
      <script>"<a>Vertrag widerrufen</a>"</script>
    `);
    expect(controls.map((c) => c.label)).toEqual([
      "Vertrag widerrufen",
      "Verträge hier kündigen",
      "Jetzt kündigen",
      "Hilfe",
    ]);
    expect(controls[0]?.href).toBe("/widerruf");
  });
});

describe("checkHtml", () => {
  it("passes statutory wording", () => {
    const r = checkHtml(
      `<footer><a href="/widerruf">Vertrag widerrufen</a> <a href="/kuendigen">Verträge hier kündigen</a></footer>`,
    );
    expect(r.verdict).toBe("pass");
  });

  it("warns on similar wording and login targets", () => {
    const r = checkHtml(
      `<a href="/abo">Abo kündigen</a><a href="/login?next=/widerruf">Vertrag widerrufen</a>`,
    );
    expect(r.results.map((x) => x.verdict)).toEqual(["warn", "warn"]);
  });

  it("ignores information links and fails without a button", () => {
    const r = checkHtml(
      `<a href="/widerrufsbelehrung">Widerrufsbelehrung</a><a href="/agb">Kündigungsfrist</a>`,
    );
    expect(r.verdict).toBe("fail");
    expect(r.results.every((x) => x.matches.length === 0)).toBe(true);
  });

  it("accepts English, French and Italian labels", () => {
    expect(checkHtml(`<a href="#">Withdraw from contract here</a>`, ["withdrawal"]).verdict).toBe(
      "pass",
    );
    expect(checkHtml(`<a href="#">Résilier les contrats ici</a>`, ["cancellation"]).verdict).toBe(
      "pass",
    );
    expect(checkHtml(`<a href="#">Recedere dal contratto qui</a>`, ["withdrawal"]).verdict).toBe(
      "pass",
    );
  });
});

describe("cli", () => {
  it("prints help and rejects unknown commands", async () => {
    expect(await main(["--help"])).toBe(0);
    expect(await main(["scan"])).toBe(2);
  });
});
