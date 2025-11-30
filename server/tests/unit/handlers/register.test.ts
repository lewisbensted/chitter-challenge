import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../../../src/utils/sendErrorResponse", () => ({
	sendErrorResponse: vi.fn(),
}));
vi.mock("../../../src/utils/logError", () => ({
	logError: vi.fn(),
}));

import { prismaMock } from "../../test-utils/prismaMock";
import { registerHandler } from "../../../src/routes/register";
import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { sendErrorResponse } from "../../../src/utils/sendErrorResponse";
import { logError } from "../../../src/utils/logError";
import { Response } from "express";
import { RegisterUserRequest } from "../../../types/requests";
import { ExtendedPrismaClient } from "../../../prisma/prismaClient";

describe("Registration handler", () => {
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
	describe("registerHandler() function", () => {
		test("Success", async () => {
			prismaMock.user.create.mockResolvedValueOnce({ uuid: "newuser" });
			await registerHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as RegisterUserRequest,
				mockRes as unknown as Response
			);
			expect(mockRes.status).toHaveBeenCalledWith(201);
			expect(mockRes.json).toHaveBeenCalledWith({ uuid: "newuser" });
		});
		test("Failure", async () => {
			prismaMock.user.create.mockRejectedValueOnce(new Error("DB exploded"));
			await registerHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as RegisterUserRequest,
				mockRes as unknown as Response
			);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
