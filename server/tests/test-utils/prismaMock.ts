import { vi } from "vitest";

export const prismaMock = {
	user: {
		findMany: vi.fn(),
		findUnique: vi.fn(),
		findUniqueOrThrow: vi.fn(),
		create: vi.fn()
	},
};
