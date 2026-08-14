import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import local from "./eslint-rules/no-spanish-identifiers.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override eslint-config-next's default ignores.
  globalIgnores([
    // eslint-config-next default ignores:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "eslint-rules/**",
  ]),
  {
    files: ["src/**/*.{ts,tsx}", "scripts/**/*.ts", "drizzle.config.ts"],
    plugins: { local },
    rules: {
      // Identifiers use English. User-visible copy and public routes remain in
      // Spanish, so the rule examines identifiers only.
      "local/no-spanish-identifiers": ["error", { allow: ["PanelLayout", "SidePanel"] }],
    },
  },
]);

export default eslintConfig;
