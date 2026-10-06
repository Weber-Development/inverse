// @vitest-environment jsdom
import { expect, it } from "vitest";

it("the script build mounts on load and exposes the API", async () => {
  document.body.innerHTML = `<div data-inverse-form="cancellation" data-endpoint="/api/inverse" data-locale="pl"></div>`;
  const Inverse = await import("../src/global");
  expect(document.querySelector("h2")?.textContent).toBe("Wypowiedzenie umowy");
  expect(typeof Inverse.mountDeclarationForm).toBe("function");
  expect(typeof Inverse.autoMount).toBe("function");
  expect(Inverse.locales).toContain("es");
});
