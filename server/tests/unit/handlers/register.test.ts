import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { prismaMock } from "../../test-utils/prismaMock";
import { registerHandler } from "../../../src/routes/register";
import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { Response } from "express";
import { RegisterUserRequest } from "../../../types/requests";
import { ExtendedPrismaClient } from "../../../prisma/prismaClient";
import { mockNext } from "../../test-utils/mockNext";

describe("Unit tests - Registration handler", () => {
	let mockReq: MockRequest;
	let mockRes: MockResponse;
	beforeEach(() => {
		vi.spyOn(console, "error").mockImplementation(vi.fn());
		mockReq = createMockReq();
		mockRes = createMockRes();
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});
	describe("registerHandler()", () => {
		test("Success", async () => {
			prismaMock.user.create.mockResolvedValueOnce({ uuid: "newuser" });
			await registerHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as RegisterUserRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(201);
			expect(mockRes.json).toHaveBeenCalledWith({ uuid: "newuser" });
		});
		test("Failure - database error", async () => {
			prismaMock.user.create.mockRejectedValueOnce(new Error("DB Error"));
			await registerHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as RegisterUserRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
