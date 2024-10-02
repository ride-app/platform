// import typescriptEslint from "@typescript-eslint/eslint-plugin";
// import globals from "globals";
// import tsParser from "@typescript-eslint/parser";
// import path from "node:path";
// import { fileURLToPath } from "node:url";
// import js from "@eslint/js";
// import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const compat = new FlatCompat({
//   baseDirectory: __dirname,
//   recommendedConfig: js.configs.recommended,
//   allConfig: js.configs.all,
// });

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);

// export default [
//   {
//     ignores: ["**/*.js", "**/gen"],
//   },
//   ...compat.extends(
//     "eslint:recommended",
//     "plugin:@typescript-eslint/strict-type-checked",
//     "plugin:@typescript-eslint/stylistic-type-checked",
//     "plugin:prettier/recommended",
//   ),
//   {
//     plugins: {
//       "@typescript-eslint": typescriptEslint,
//     },

//     languageOptions: {
//       globals: {
//         ...globals.node,
//       },

//       parser: tsParser,
//       ecmaVersion: "latest",
//       sourceType: "module",

//       parserOptions: {
//         project: ["tsconfig.json", "test/tsconfig.json"],
//       },
//     },

//     rules: {
//       "no-console": [
//         "warn",
//         {
//           allow: ["info", "warn", "error"],
//         },
//       ],

//       "@typescript-eslint/no-non-null-assertion": "off",
//       "@typescript-eslint/member-ordering": "warn",
//     },
//   },
// ];
