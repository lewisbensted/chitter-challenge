import { Mock, vi } from "vitest";
import { Response } from "express";

export const createMockRes = () => {
	const res: any = {};
	res.status = vi.fn().mockImplementation(() => res);
	res.json = vi.fn().mockImplementation(() => res);
	return res as Response & {
		status: Mock;
		json: Mock;
	};;
};
