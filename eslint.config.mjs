import globals from "globals";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import eslint from "@eslint/js";
import onlyWarn from "eslint-plugin-only-warn";
import stylistic from "@stylistic/eslint-plugin";

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
	eslint.configs.recommended,
	{
		languageOptions: {
			globals: { ...globals.node, ...globals.browser },
		},
		settings: {
			react: {
				version: "detect",
			},
		},
	},
	{ ignores: ["eslint.config.mjs", "server/ts-register.mjs", "**/*/dist/", "**/*.config.ts"] },
	{
		files: ["**/*.{ts,tsx}"],
		extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
		languageOptions: {
			parserOptions: { project: ["./frontend/tsconfig.json", "./server/tsconfig.json"] },
		},

		plugins: {
			"@stylistic": stylistic,
			"only-warn": onlyWarn,
		},
		rules: {
			"@stylistic/indent": ["warn", "tab"],
			"@stylistic/linebreak-style": ["warn", "windows"],
			"@stylistic/quotes": ["warn", "double"],
			"@stylistic/semi": "warn",
			eqeqeq: ["warn", "smart"],
			"arrow-body-style": ["warn", "as-needed"],
			"@typescript-eslint/no-misused-promises": ["warn", { checksVoidReturn: false }],
			"@typescript-eslint/restrict-template-expressions": ["warn", { allowNumber: true }],
			"@typescript-eslint/no-non-null-assertion": ["off"],
		},
	},
	{
		files: ["**/*.{js,mjs,cjs,jsx}"],
		plugins: {
			"@stylistic": stylistic,
			"only-warn": onlyWarn,
		},
		rules: {
			"@stylistic/indent": ["warn", "tab"],
			"@stylistic/linebreak-style": ["warn", "windows"],
			"@stylistic/quotes": ["warn", "double"],
			"@stylistic/semi": "warn",
			eqeqeq: ["warn", "smart"],
			"arrow-body-style": ["warn", "as-needed"],
		},
	},
	{
		files: ["**/*.{jsx,tsx}"],
		plugins: {
			react: reactPlugin,
			"react-hooks": reactHooksPlugin,
		},
		rules: {
			...reactPlugin.configs.flat.recommended.rules,
			...reactHooksPlugin.configs.recommended.rules,
			"react/no-unused-prop-types": "warn",
		},
	}
);
