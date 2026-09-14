import { fileURLToPath, URL } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";
import { redwood } from "rwsdk/vite";

export default defineConfig({
  // Immutable generated reports are checked by their evidence manifest, not rewritten.
  fmt: {
    ignorePatterns: ["comparison/evidence/**"],
  },
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    // Archived snippets are checked against the installed package, not workspace imports.
    ignorePatterns: ["comparison/evidence/sdk-contract-review/example-*.ts"],
    options: { typeAware: true, typeCheck: true },
  },
  plugins: [
    cloudflare({ inspectorPort: false, viteEnvironment: { name: "worker" } }),
    react(),
    redwood(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "127.0.0.1",
  },
});
