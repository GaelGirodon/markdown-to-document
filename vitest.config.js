import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: "test/setup.js",
    restoreMocks: true,
    testTimeout: 30000,
    reporters: [["junit", { outputFile: "test-report.xml" }], ...configDefaults.reporters],
    coverage: {
      include: ["{assets,src}/**/*.js"],
      exclude: ["**/*.min.js"],
      reporter: ["lcov", "text"],
    },
  },
});
