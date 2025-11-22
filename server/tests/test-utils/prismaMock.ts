import { vi } from "vitest";
import { ExtendedPrismaClient } from "../../prisma/prismaClient";

export const prismaMock = {
	$transaction: vi.fn(),
	user: {
		findMany: vi.fn(),
		findUnique: vi.fn(),
		findUniqueOrThrow: vi.fn(),
		create: vi.fn(),
	},
	cheet: {
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		findMany: vi.fn(),
		findUnique: vi.fn(),
		findUniqueOrThrow: vi.fn(),
	},
	cheetStatus: {
		create: vi.fn(),
	},
} as any;
