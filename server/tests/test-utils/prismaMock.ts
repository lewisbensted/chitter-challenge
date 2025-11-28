import { vi } from "vitest";
import { ExtendedPrismaClient } from "../../prisma/prismaClient";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";

// export const prismaMock = mockDeep<ExtendedPrismaClient>() as DeepMockProxy<ExtendedPrismaClient>;

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
	reply: {
		update: vi.fn(),
		delete: vi.fn(),
		findMany: vi.fn(),
		findUnique: vi.fn(),
		findUniqueOrThrow: vi.fn(),
	},
	message: {
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		findMany: vi.fn(),
		findUnique: vi.fn(),
		findUniqueOrThrow: vi.fn(),
	},
	messageStatus: {
		softDelete: vi.fn(),
		create: vi.fn(),
		updateMany: vi.fn(),
	},
	conversation: {
		upsert: vi.fn(),
		update: vi.fn(),
		findFirst: vi.fn(),
		findMany: vi.fn(),
		findUnique: vi.fn(),
	},
	follow: {
		create: vi.fn(),
		delete: vi.fn(),
	}
} as any;
