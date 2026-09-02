// Flat config nativa (ESLint 9 + eslint-config-next 16).
// `eslint-config-next/core-web-vitals` e `eslint-config-next/typescript` já
// exportam arrays de flat config, então não é preciso FlatCompat/@eslint/eslintrc.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "public/**",
      "next-env.d.ts",
      "**/*.min.js",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
