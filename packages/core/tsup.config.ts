import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/bin.ts", "src/ui.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    target: "es2021",
  },
  {
    // Self-contained browser build for a <script> tag (jsDelivr, unpkg): window.Inverse.
    entry: { inverse: "src/global.ts" },
    format: ["iife"],
    globalName: "Inverse",
    platform: "browser",
    minify: true,
    sourcemap: true,
    target: "es2019",
  },
]);
