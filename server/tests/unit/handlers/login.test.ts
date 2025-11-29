import { afterAll, beforeAll, beforeEach, describe, expect, Mock, test, vi } from "vitest";
import * as bcrypt from "bcrypt";
vi.mock("../../../src/utils/sendErrorResponse", () => ({
	sendErrorResponse: vi.fn(),
}));
vi.mock("../../../src/utils/logError", () => ({
	logError: vi.fn(),
}));
vi.mock("bcrypt");
import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { loginHandler } from "../../../src/routes/login";
import { prismaMock } from "../../test-utils/prismaMock";
import { Response, Request } from "express";
import { sendErrorResponse } from "../../../src/utils/sendErrorResponse";
import { logError } from "../../../src/utils/logError";

describe("Login handler", () => {
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
	describe("loginHandler() function", () => {
		test("Already logged in", async () => {
			mockReq.session.user = { uuid: "mockuserir" };
			await loginHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Already logged in."] });
		});
		test("No password provided", async () => {
			mockReq.body = { username: "mockusername" };
			await loginHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Password not provided."] });
		});
		test("No username provided", async () => {
			mockReq.body = { password: "mockpassword" };
			await loginHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Username not provided."] });
		});
		test("Neither password nor username provided", async () => {
			mockReq.body = {};
			await loginHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Username not provided.", "Password not provided."] });
		});
		test("User not found", async () => {
			mockReq.body = { username: "mockusername", password: "mockpassword" };
			prismaMock.user.findUnique.mockResolvedValueOnce(null);
			await loginHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Invalid username or password."] });
		});
		test("Success", async () => {
			mockReq.body = { username: "mockusername", password: "mockpassword" };
			prismaMock.user.findUnique.mockResolvedValueOnce({ uuid: "mockuserid", passwordHash: "mockpasswordhash" });
			(bcrypt.compareSync as unknown as Mock).mockReturnValueOnce(true);
			await loginHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith("mockuserid");
			expect(mockRes.cookie).toHaveBeenCalledWith("user_id", "mockuserid");
			expect(mockRes.cookie).toHaveBeenCalledWith("session_id", "mocksessionid");
			expect(mockReq.session.user).toEqual({ uuid: "mockuserid" });
		});
		test("Error", async () => {
			mockReq.body = { username: "mockusername", password: "mockpassword" };
			prismaMock.user.findUnique.mockRejectedValueOnce(new Error("DB exploded"));
			await loginHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
