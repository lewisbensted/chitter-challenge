import globals from "globals";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import eslint from "@eslint/js";
import onlyWarn from "eslint-plugin-only-warn";
import stylistic from "@stylistic/eslint-plugin";

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
	{ files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
	{
		languageOptions: {
			globals: { ...globals.node, ...globals.browser },
			parserOptions: { project: "./tsconfig.json" },
		},
	},
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	{
		settings: {
			react: {
				version: "detect",
			},
		},
	},
	{
		plugins: {
			"@stylistic": stylistic,
			react: reactPlugin,
			"react-hooks": reactHooksPlugin,
			"only-ware": onlyWarn,
		},
		rules: {
			"@stylistic/indent": ["warn", "tab"],
			"@stylistic/linebreak-style": ["warn", "windows"],
			"@stylistic/quotes": ["warn", "double"],
			"@stylistic/semi": "warn",
			eqeqeq: ["warn", "smart"],
			"arrow-body-style": ["warn", "as-needed"],
			...reactPlugin.configs.flat.recommended.rules,
			...reactHooksPlugin.configs.recommended.rules,
			"@typescript-eslint/restrict-template-expressions": ["warn"],
			"@typescript-eslint/no-misused-promises" : ["warn", {checksVoidReturn:false}]
		},
	}
);
