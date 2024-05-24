import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  { languageOptions: { globals: { ...globals.node, ...globals.browser, ...globals.mocha } } },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": ["error", { caughtErrors: "all", caughtErrorsIgnorePattern: "err" }],
    },
  },
];
