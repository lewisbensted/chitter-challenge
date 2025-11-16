import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["tests/**/*.test.ts"],
		poolOptions: {
			threads: {
				singleThread: true,
			},
		},
	},
});
