import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite-plus/test/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["dist", "node_modules", ".next", ".open-next"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
