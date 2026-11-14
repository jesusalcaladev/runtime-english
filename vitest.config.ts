import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "preact",
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    globals: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/lib/**", "src/hooks/**", "src/components/**"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/types.ts"],
    },
    environmentMatchGlobs: [
      ["src/**/*.component.test.tsx", "happy-dom"],
      ["src/**/*.ui.test.tsx", "happy-dom"],
      ["src/hooks/**/*.test.tsx", "happy-dom"],
    ],
  },
});
