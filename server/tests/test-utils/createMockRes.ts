import { vi } from "vitest";

export interface MockResponse {
	status: ReturnType<typeof vi.fn>;
	sendStatus: ReturnType<typeof vi.fn>;
	json: ReturnType<typeof vi.fn>;
	clearCookie: ReturnType<typeof vi.fn>;
	cookie: ReturnType<typeof vi.fn>;
}

export const createMockRes = (): MockResponse => ({
	status: vi.fn().mockReturnThis(),
	sendStatus: vi.fn().mockReturnThis(),
	json: vi.fn().mockReturnThis(),
	clearCookie: vi.fn().mockReturnThis(),
	cookie: vi.fn().mockReturnThis(),
});
