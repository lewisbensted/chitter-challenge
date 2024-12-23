import { test, describe, vi, expect } from "vitest";
import { authMiddleware } from "../../middleware/authMiddleware";
import { Request, Response, NextFunction } from "express";
import { authenticate } from "../../utils/authenticate";

describe("authenticates the user by comparing information stored on the request's sessions and cookies.", async () => {
    describe("Test authenticate function.", () => {
        test("Respective sessionIDs and userIDs match.", () => {
            const req = {
                sessionID: "testsessionid",
                session: { user: { uuid: "testuuid" } },
                cookies: { session: "s:testsessionid.", user_id: "testuuid" },
            } as unknown as Request;
            expect(authenticate(req)).toEqual(true);
        });
        test("Session IDs match but userID's do not.", async () => {
            const req = {
                sessionID: "testsessionid",
                session: { user: { uuid: "testuuid1" } },
                cookies: { session: "s:testsessionid.", user_id: "testuuid2" },
            } as unknown as Request;
            expect(authenticate(req)).toEqual(false);
        });
        test("User IDs match but sessionID's do not.", async () => {
            const req = {
                sessionID: "testsessionid1",
                session: { user: { uuid: "testuuid" } },
                cookies: { session: "s:testsessionid2.", user_id: "testuuid" },
            } as unknown as Request;
            expect(authenticate(req)).toEqual(false);
        });
        test("Neither User IDs nor sessionID's match.", async () => {
            const req = {
                sessionID: "testsessionid1",
                session: { user: { uuid: "testuuid1" } },
                cookies: { session: "s:testsessionid2.", user_id: "testuuid2" },
            } as unknown as Request;
            expect(authenticate(req)).toEqual(false);
        });
        test("Session IDs match but user cookie is missing.", async () => {
            const req = {
                sessionID: "testsessionid",
                session: { user: { uuid: "testuuid" } },
                cookies: { session: "s:testsessionid." },
            } as unknown as Request;
            expect(authenticate(req)).toEqual(false);
        });
        test("User IDs match but session cookie is missing.", async () => {
            const req = {
                sessionID: "testsessionid",
                session: { user: { uuid: "testuuid" } },
                cookies: { user_id: "testuuid" },
            } as unknown as Request;
            expect(authenticate(req)).toEqual(false);
        });
        test("Session IDs match but user is missing on the session and cookies.", async () => {
            const req = {
                sessionID: "testsessionid",
                session: {},
                cookies: { session: "s:testsessionid." },
            } as unknown as Request;
            expect(authenticate(req)).toEqual(false);
        });
        test("Session IDs match but user ID is missing on the session and cookies.", async () => {
            const req = {
                sessionID: "testID",
                session: { user: {} },
                cookies: { session_id: "testID" },
            } as unknown as Request;
            expect(authenticate(req)).toEqual(false);
        });
    });
    describe("Test authenticate middleware.", () => {
        test("Successful authentication.", async () => {
            const req = {
                sessionID: "testsessionid",
                session: { user: { uuid: "testuuid" } },
                cookies: { session: "s:testsessionid.", user_id: "testuuid" },
            } as unknown as Request;
            const res = { status: vi.fn(() => res), send: vi.fn(() => res) } as unknown as Response;
            const next = vi.fn() as unknown as NextFunction;

            authMiddleware(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledTimes(0);
        });
    });

    test("Unsuccessful authentication.", async () => {
        const req = {
            sessionID: "testsessionid",
                session: { user: { uuid: "testuuid1" } },
                cookies: { session: "s:testsessionid.", user_id: "testuuid2" },
        } as unknown as Request;
        const res = { status: vi.fn(() => res), send: vi.fn(() => res) } as unknown as Response;
        const next = vi.fn() as unknown as NextFunction;

        authMiddleware(req, res, next);
        expect(next).toHaveBeenCalledTimes(0);
        expect(res.send).toHaveBeenCalledTimes(1);
    });
});
