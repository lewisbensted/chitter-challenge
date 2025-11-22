import { describe, expect, test, vi } from "vitest";
import { authenticate } from "../../../src/utils/authenticate";
import * as authUtils from "../../../src/utils/authenticate";
import { authenticator } from "../../../src/middleware/authMiddleware";
import { Request, NextFunction } from "express";
import { createMockRes } from "../../test-utils/createMockRes";

describe("Authentication", () => {
	describe("authenticate()", () => {
		test("sessionIDs and userIDs match.", () => {
			const testReq = {
				sessionID: "testsessionid",
				session: { user: { uuid: "testuseruuid" } },
				cookies: { session_id: "testsessionid", user_id: "testuseruuid" },
			} as unknown as Request;
			expect(authenticate(testReq)).toEqual(true);
		});
		test("userID's don't match", () => {
			const testReq = {
				sessionID: "testsessionid",
				session: { user: { uuid: "testuseruuid1" } },
				cookies: { session_id: "testsessionid", user_id: "testuseruuid2" },
			} as unknown as Request;
			expect(authenticate(testReq)).toEqual(false);
		});
		test("sessionID's don't match", () => {
			const testReq = {
				sessionID: "testsessionid1",
				session: { user: { uuid: "testuseruuid" } },
				cookies: { session_id: "testsessionid2", user_id: "testuseruuid" },
			} as unknown as Request;
			expect(authenticate(testReq)).toEqual(false);
		});
		test("Neither match", () => {
			const testReq = {
				sessionID: "testsessionid1",
				session: { user: { uuid: "testuseruuid1" } },
				cookies: { session_id: "testsessionid2", user_id: "testuseruuid2" },
			} as unknown as Request;
			expect(authenticate(testReq)).toEqual(false);
		});
		test("session_id cookie missing", () => {
			const testReq = {
				sessionID: "testsessionid",
				session: { user: { uuid: "testuseruuid" } },
				cookies: { user_id: "testuseruuid" },
			} as unknown as Request;
			expect(authenticate(testReq)).toEqual(false);
		});
		test("sessionID missing.", () => {
			const testReq = {
				session: { user: { uuid: "testuseruuid" } },
				cookies: { session_id: "testsessionid", user_id: "testuseruuid" },
			} as unknown as Request;
			expect(authenticate(testReq)).toEqual(false);
		});
		test("sessionID and session_id cookie both missing.", () => {
			const testReq = {
				session: { user: { uuid: "testuseruuid" } },
				cookies: { user_id: "testuseruuid" },
			} as unknown as Request;
			expect(authenticate(testReq)).toEqual(false);
		});
		test("User cookie missing", () => {
			const testReq = {
				sessionID: "testsessionid",
				session: { user: { uuid: "testuseruuid" } },
				cookies: { session_id: "testsessionid" },
			} as unknown as Request;
			expect(authenticate(testReq)).toEqual(false);
		});
		test("User session missing", () => {
			const testReq = {
				sessionID: "testsessionid",
				session: { user: {} },
				cookies: { session_id: "testsessionid", user_id: "testuseruuid" },
			} as unknown as Request;
			expect(authenticate(testReq)).toEqual(false);
		});
		test("user missing on session.", () => {
			const testReq = {
				sessionID: "testsessionid",
				session: {},
				cookies: { session_id: "testsessionid", user_id: "testuseruuid" },
			} as unknown as Request;
			expect(authenticate(testReq)).toEqual(false);
		});
		test("user uuid missing on session and cookies.", () => {
			const testReq = {
				sessionID: "testsessionid",
				session: { user: {} },
				cookies: { session_id: "testsessionid" },
			} as unknown as Request;
			expect(authenticate(testReq)).toEqual(false);
		});
		test("userId missing on session and cookies.", () => {
			const testReq = {
				sessionID: "testsessionid",
				session: {},
				cookies: { session_id: "testsessionid" },
			} as unknown as Request;
			expect(authenticate(testReq)).toEqual(false);
		});
	});
	describe("authMiddleware()", () => {
		test("pass", () => {
			const mockReq = {} as Request;
			const mockRes = createMockRes();
			const mockNext: NextFunction = vi.fn();
			vi.spyOn(authUtils, "authenticate").mockReturnValue(true);
			authenticator(mockReq, mockRes, mockNext);
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockRes.status).toHaveBeenCalledTimes(0);
		});
		test("fail", () => {
			const mockReq = {} as Request;
			const mockRes = createMockRes();
			const mockNext: NextFunction = vi.fn();
			vi.spyOn(authUtils, "authenticate").mockReturnValue(false);
			authenticator(mockReq, mockRes, mockNext);
			expect(mockNext).toHaveBeenCalledTimes(0);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Invalid credentials."] });
		});
	});
});
