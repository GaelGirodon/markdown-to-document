import js from "@eslint/js";
import globals from "globals";
import { defineConfig, includeIgnoreFile } from "eslint/config";

export default defineConfig([
  includeIgnoreFile(import.meta.dirname + "/.gitignore", { gitignoreResolution: true }),
  {
    files: ["**/*.js"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.node, ...globals.mocha } },
  },
  {
    rules: {
      "no-unused-vars": ["error", { caughtErrors: "all", caughtErrorsIgnorePattern: "err" }],
    },
  },
]);
