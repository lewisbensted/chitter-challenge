import { beforeEach, describe, expect, test, vi } from "vitest";
import { authenticator } from "../../../src/middleware/authentication";
import { Request, Response, NextFunction } from "express";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { mockNext } from "../../test-utils/mockNext";

describe("Unit tests - authentication middleware", () => {
	describe("authenticator()", () => {
		let mockReq: MockRequest;
		let mockRes: MockResponse;
		beforeEach(() => {
			mockReq = createMockReq();
			mockRes = createMockRes();
		});
		test("No session user", () => {
			mockReq.cookies = { user_id: "mockuserid" };
			authenticator(mockReq as unknown as Request, mockRes as unknown as Response, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("No user ID cookie", () => {
			mockReq.session.user = { uuid: "mockuserid" };
			authenticator(mockReq as unknown as Request, mockRes as unknown as Response, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Neither user ID session nor cookie", () => {
			authenticator(mockReq as unknown as Request, mockRes as unknown as Response, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Session user id does not match cookie user id", () => {
			mockReq.cookies = { user_id: "mockuserid1" };
			mockReq.session.user = { uuid: "mockuserid2" };
			authenticator(mockReq as unknown as Request, mockRes as unknown as Response, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success", () => {
			mockReq.cookies = { user_id: "mockuserid" };
			mockReq.session.user = { uuid: "mockuserid" };
			authenticator(mockReq as unknown as Request, mockRes as unknown as Response, mockNext);
			expect(mockNext).toHaveBeenCalled();
			expect(mockRes.status).not.toHaveBeenCalledWith(401);
		});
	});
});