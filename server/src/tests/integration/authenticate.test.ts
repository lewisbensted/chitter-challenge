import { test, describe, vi, expect } from "vitest";
import { authMiddleware } from "../../middleware/authMiddleware";
import { Request, Response, NextFunction } from "express";
import { authenticate } from "../../utils/authenticate";

describe("authenticates the user by comparing information stored on the request's sessions and cookies.", () => {
	describe("Test authenticate function.", () => {
		test("Respective sessionIDs and userIDs match.", () => {
			const req = {
				sessionID: "testsessionid",
				session: { user: { uuid: "testuseruuid" } },
				cookies: { session_id: "testsessionid", user_id: "testuseruuid" },
			} as unknown as Request;
			expect(authenticate(req)).toEqual(true);
		});
		test("Session IDs match but userID's do not.", () => {
			const req = {
				sessionID: "testsessionid",
				session: { user: { uuid: "testuseruuid1" } },
				cookies: { session_id: "testsessionid", user_id: "testuseruuid2" },
			} as unknown as Request;
			expect(authenticate(req)).toEqual(false);
		});
		test("User IDs match but session ID's do not.", () => {
			const req = {
				sessionID: "testsessionid1",
				session: { user: { uuid: "testuseruuid" } },
				cookies: { session_id: "testsessionid2", user_id: "testuseruuid" },
			} as unknown as Request;
			expect(authenticate(req)).toEqual(false);
		});
		test("Neither User IDs nor session ID's match.", () => {
			const req = {
				sessionID: "testsessionid1",
				session: { user: { uuid: "testuseruuid1" } },
				cookies: { session_id: "testsessionid2", user_id: "testuseruuid2" },
			} as unknown as Request;
			expect(authenticate(req)).toEqual(false);
		});
		test("User IDs match but session cookie is missing.", () => {
			const req = {
				sessionID: "testsessionid",
				session: { user: { uuid: "testuseruuid" } },
				cookies: { user_id: "testuseruuid" },
			} as unknown as Request;
			expect(authenticate(req)).toEqual(false);
		});
		test("User IDs match but session ID is missing.", () => {
			const req = {
				session: { user: { uuid: "testuseruuid" } },
				cookies: { user_id: "testuseruuid", session_id: "testsessionid" },
			} as unknown as Request;
			expect(authenticate(req)).toEqual(false);
		});
		test("User IDs match but session ID and session cookie are both missing.", () => {
			const req = {
				session: { user: { uuid: "testuseruuid" } },
				cookies: { user_id: "testuseruuid"},
			} as unknown as Request;
			expect(authenticate(req)).toEqual(false);
		});
		test("Session IDs match but user cookie is missing.", () => {
			const req = {
				sessionID: "testsessionid",
				session: { user: { uuid: "testuseruuid" } },
				cookies: { session_id: "testsessionid" },
			} as unknown as Request;
			expect(authenticate(req)).toEqual(false);
		});
		test("Session IDs match but user is missing on the session.", () => {
			const req = {
				sessionID: "testsessionid",
				session: {},
				cookies: { session_id: "testsessionid", user_id: "testuseruuid" },
			} as unknown as Request;
			expect(authenticate(req)).toEqual(false);
		});
		test("Session IDs match but user ID is missing on the session.", () => {
			const req = {
				sessionID: "testsessionid",
				session: { user: {} },
				cookies: { session_id: "testsessionid", user_id: "testuseruuid" },
			} as unknown as Request;
			expect(authenticate(req)).toEqual(false);
		});
		test("Session IDs match but user is missing on the session and cookies.", () => {
			const req = {
				sessionID: "testsessionid",
				session: {},
				cookies: { session_id: "testsessionid" },
			} as unknown as Request;
			expect(authenticate(req)).toEqual(false);
		});
		test("Session IDs match but user ID is missing on the session and cookies.", () => {
			const req = {
				sessionID: "testsessionid",
				session: { user: {} },
				cookies: { session_id: "testsessionid" },
			} as unknown as Request;
			expect(authenticate(req)).toEqual(false);
		});
	});

	describe("Test authenticate middleware.", () => {
		test("Successful authentication.", () => {
			const req = {
				sessionID: "testsessionid",
				session: { user: { uuid: "testuseruuid" } },
				cookies: { session_id: "testsessionid", user_id: "testuseruuid" },
			} as unknown as Request;
			const res = { status: vi.fn(() => res), send: vi.fn(() => res) } as unknown as Response;
			const next = vi.fn() as unknown as NextFunction;

			authMiddleware(req, res, next);
			expect(next).toHaveBeenCalledTimes(1);
			expect(res.send).toHaveBeenCalledTimes(0);
		});
	});

	test("Unsuccessful authentication.", () => {
		const req = {
			sessionID: "testsessionid",
			session: { user: { uuid: "testuseruuid1" } },
			cookies: { session: "testsessionid", user_id: "testuseruuid2" },
		} as unknown as Request;
		const res = { status: vi.fn(() => res), send: vi.fn(() => res) } as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		authMiddleware(req, res, next);
		expect(next).toHaveBeenCalledTimes(0);
		expect(res.send).toHaveBeenCalledTimes(1);
	});
});
