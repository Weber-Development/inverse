// Entry of the <script> build (dist/inverse.global.js). Exposes `window.Inverse` and mounts
// every element with data-inverse-form / data-inverse-link once the page has loaded.
import { autoMount } from "./ui";

export * from "./ui";

if (typeof document !== "undefined" && !document.currentScript?.hasAttribute("data-manual")) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => autoMount(), { once: true });
  } else {
    autoMount();
  }
}
