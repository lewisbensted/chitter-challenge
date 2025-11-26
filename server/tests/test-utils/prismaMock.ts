import { vi } from "vitest";

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
		create: vi.fn()
	},
	conversation: {
		upsert:vi.fn(),
		findMany:vi.fn()
	}
} as any;
