import { test, describe, vi, expect } from "vitest";
import { authMiddleware } from "../../middleware/authMiddleware";
import { Request, Response, NextFunction } from "express";
import { authenticate } from "../../utils/authenticate";

describe("authenticates the user by comparing information stored on the request's sessions and cookies.", async () => {
    describe("Test authenticate function.", () => {
        test("Respective sessionIDs and userIDs match.", () => {
            const req = {
                sessionID: "testID",
                session: { user: { id: 1234 } },
                cookies: { session_id: "testID", user_id: 1234 },
            } as unknown as Request;
            expect(authenticate(req)).toEqual(true);
        });
        test("Session IDs match but userID's do not.", async () => {
            const req = {
                sessionID: "testID",
                session: { user: { id: 200 } },
                cookies: { session_id: "testID", user_id: 202 },
            } as unknown as Request;
            expect(authenticate(req)).toEqual(false);
        });
        test("User IDs match but sessionID's do not.", async () => {
            const req = {
                sessionID: "testID",
                session: { user: { id: 200 } },
                cookies: { session_id: "testID_2", user_id: 200 },
            } as unknown as Request;
            expect(authenticate(req)).toEqual(false);
        });
        test("Neither User IDs nor sessionID's match.", async () => {
            const req = {
                sessionID: "testID",
                session: { user: { id: 200 } },
                cookies: { session_id: "testID_2", user_id: 202 },
            } as unknown as Request;
            expect(authenticate(req)).toEqual(false);
        });
        test("Session IDs match but user cookie is missing.", async () => {
            const req = {
                sessionID: "testID",
                session: { user: { id: 200 } },
                cookies: { session_id: "testID" },
            } as unknown as Request;
            expect(authenticate(req)).toEqual(false);
        });
        test("User IDs match but session cookie is missing.", async () => {
            const req = {
                sessionID: "testID",
                session: { user: { id: 200 } },
                cookies: { user_id: 200 },
            } as unknown as Request;
            expect(authenticate(req)).toEqual(false);
        });
        test("Session IDs match but user is missing on the session and cookies.", async () => {
            const req = {
                sessionID: "testID",
                session: {},
                cookies: { session_id: "testID" },
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
                sessionID: "testID",
                session: { user: { id: 1234 } },
                cookies: { session_id: "testID", user_id: 1234 },
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
            sessionID: "testID",
            session: { user: { id: 123 } },
            cookies: { session_id: "testID", user_id: 1234 },
        } as unknown as Request;
        const res = { status: vi.fn(() => res), send: vi.fn(() => res) } as unknown as Response;
        const next = vi.fn() as unknown as NextFunction;

        authMiddleware(req, res, next);
        expect(next).toHaveBeenCalledTimes(0);
        expect(res.send).toHaveBeenCalledTimes(1);
    });
});
