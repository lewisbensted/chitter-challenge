vi.mock("../../../src/utils/sendErrorResponse", () => ({
	sendErrorResponse: vi.fn(),
}));
vi.mock("../../../src/utils/logError", () => ({
	logError: vi.fn(),
}));

import { beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../../../prisma/resetDB";
import { createMockRes } from "../../test-utils/createMockRes";
import prisma from "../../../prisma/prismaClient";
import { registerHandler } from "../../../src/routes/register";
import { RegisterUserRequest, RegisterUserRequestBody } from "../../../types/requests";
import { prismaMock } from "../../test-utils/prismaMock";
import { sendErrorResponse } from "../../../src/utils/sendErrorResponse";
import { logError } from "../../../src/utils/logError";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

describe("Register.", () => {
	beforeEach(async () => {
		await resetDB();
	});
	test("success.", async () => {
		const mockReq = {
			body: {
				uuid: "testuseruuidnew",
				email: "testusernew@test.com",
				firstName: "Test",
				lastName: "User",
				password: "password1!",
				username: "testusernew",
			} as RegisterUserRequestBody,
		} as unknown as RegisterUserRequest;
		const mockRes = createMockRes();
		const handler = registerHandler(prisma);
		await handler(mockReq, mockRes);
		expect(mockRes.status).toHaveBeenCalledWith(201);
		expect(mockRes.json).toHaveBeenCalledWith({ username: "testusernew", uuid: "testuseruuidnew" });
	});
	test("validation error", async () => {
		const mockReq = {
			body: {
				uuid: "testuseruuidmissingemail",
				firstName: "Test",
				lastName: "User",
				password: "password1!",
				username: "testusermissingemail",
			} as unknown as RegisterUserRequestBody,
		} as unknown as RegisterUserRequest;
		const mockRes = createMockRes();
		const handler = registerHandler(prisma);
		await handler(mockReq, mockRes);
		expect(sendErrorResponse).toHaveBeenCalled();
		expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
		expect(logError).toHaveBeenCalled();
	});
	test("race condition - duplicate email.", async () => {
		const mockReq = {
			body: {
				uuid: "testuseruuidduplicateemail",
                email: "testuseruuidduplicateemail@hotmail.com",
				firstName: "Test",
				lastName: "User",
				password: "password1!",
				username: "testuserduplicateemail",
			} as unknown as RegisterUserRequestBody,
		} as unknown as RegisterUserRequest;

		const prismaError = Object.create(PrismaClientKnownRequestError.prototype);
		prismaError.message = "Unique constraint failed";
		prismaError.code = "P2002";
		prismaError.meta = { target: ["email"] };
		prismaMock.user.create.mockRejectedValueOnce(prismaError);

		const mockRes = createMockRes();
		const handler = registerHandler(prismaMock);
		await handler(mockReq, mockRes);
		expect(sendErrorResponse).toHaveBeenCalled();
		expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(PrismaClientKnownRequestError), mockRes);
		expect(logError).toHaveBeenCalled();
	});
});
