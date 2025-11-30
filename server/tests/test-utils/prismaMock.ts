import { vi } from "vitest";

interface MockModel {
	findUnique: ReturnType<typeof vi.fn>;
	findUniqueOrThrow: ReturnType<typeof vi.fn>;
	findMany: ReturnType<typeof vi.fn>;
	create: ReturnType<typeof vi.fn>;
	update: ReturnType<typeof vi.fn>;
	delete: ReturnType<typeof vi.fn>;
	upsert: ReturnType<typeof vi.fn>;
	updateMany: ReturnType<typeof vi.fn>;
	findFirst: ReturnType<typeof vi.fn>;
}

type MessageStatusMock = MockModel & {
	softDelete: ReturnType<typeof vi.fn>;
};

export interface MockPrisma {
	$transaction: ReturnType<typeof vi.fn>;
	user: MockModel;
	cheet: MockModel;
	cheetStatus: MockModel;
	reply: MockModel;
	message: MockModel;
	messageStatus: MockModel;
	conversation: MockModel;
	follow: MockModel;
}

const createMockModel = (): MockModel => ({
	findUnique: vi.fn(),
	findUniqueOrThrow: vi.fn(),
	findMany: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	upsert: vi.fn(),
	updateMany: vi.fn(),
	findFirst: vi.fn(),
});

const createMessageStatusMock = (): MessageStatusMock => ({
	...createMockModel(),
	softDelete: vi.fn(),
});

export const prismaMock: MockPrisma = {
	$transaction: vi.fn(),
	user: createMockModel(),
	cheet: createMockModel(),
	cheetStatus: createMockModel(),
	reply: createMockModel(),
	message: createMockModel(),
	messageStatus: createMessageStatusMock(),
	conversation: createMockModel(),
	follow: createMockModel(),
};
