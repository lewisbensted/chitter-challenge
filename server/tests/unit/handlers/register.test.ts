import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

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

describe("Registration handler", () => {
	beforeAll(() => {
		vi.spyOn(console, "error").mockImplementation(() => {});
	});
	let mockReq: MockRequest;
	let mockRes: MockResponse;
	beforeEach(() => {
		mockReq = createMockReq();
		mockRes = createMockRes();
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	describe("registerHandler() function", () => {
		test("Success", async () => {
			prismaMock.user.create.mockResolvedValueOnce({ uuid: "newuser" });
			await registerHandler(prismaMock)(mockReq as RegisterUserRequest, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(201);
			expect(mockRes.json).toHaveBeenCalledWith({ uuid: "newuser" });
		});
		test("Failure", async () => {
			prismaMock.user.create.mockRejectedValueOnce(new Error("DB exploded"));
			await registerHandler(prismaMock)(mockReq as RegisterUserRequest, mockRes as unknown as Response);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
