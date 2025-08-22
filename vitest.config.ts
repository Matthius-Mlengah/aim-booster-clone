import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",                 
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    globals: true,
    coverage: { reporter: ["text", "html"] },
  },
});
