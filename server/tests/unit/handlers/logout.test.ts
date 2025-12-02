import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { logoutHandler } from "../../../src/routes/logout";
import { Response, Request } from "express";
import { mockNext } from "../../test-utils/mockNext";

describe("Unit tests - Logout handler", () => {
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
	describe("logoutHandler()", () => {
		test("success", () => {
			const destroyMock = vi.fn((callback) => callback(null));
			mockReq.session = { user: { id: "mockuserid" }, destroy: destroyMock };
			mockReq.cookies = { token: "mocksession" };
			logoutHandler(mockReq as unknown as Request, mockRes as unknown as Response, mockNext);
			expect(destroyMock).toHaveBeenCalled();
			expect(mockRes.clearCookie).toHaveBeenCalledWith("token");
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith("Logout successful.");
		});
		test("error", () => {
			const destroyMock = vi.fn((callback) => callback(new Error("DB exploded")));
			mockReq.session = { user: { id: "mockuserid" }, destroy: destroyMock };
			mockReq.cookies = { token: "mocksession" };
			logoutHandler(mockReq as unknown as Request, mockRes as unknown as Response, mockNext);
			expect(destroyMock).toHaveBeenCalled();
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
		test("no session", () => {
			logoutHandler(mockReq as unknown as Request, mockRes as unknown as Response, mockNext);
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["Not logged in."],
			});
		});
	});
});
