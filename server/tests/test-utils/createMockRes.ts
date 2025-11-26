import { vi } from "vitest";
import { Response } from "express";

export interface MockResponse extends Response {}

export const createMockRes = () => ({
	status: vi.fn().mockReturnThis(),
	sendStatus: vi.fn().mockReturnThis(),
	json: vi.fn().mockReturnThis(),
} as unknown as MockResponse);
