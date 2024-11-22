import express from "express";
import { test, describe, vi, expect } from "vitest";
import validate from "../../routes/validate";
import request from "supertest";
import session from "express-session";
import { authMiddleware } from "../../middleware/authMiddleware";

describe("Return information about the session's user at route: [GET] /validate.", async () => {
    vi.mock("./../../middleware/authMiddleware", () => ({
        authMiddleware: vi.fn((req, _res, next) => {
            next();
        }),
    }));
    
    const testApp = express();
    testApp.use("/validate", validate);
    const sessionApp = express();
    sessionApp.use(session({ secret: "secret-key" }));
    sessionApp.all("*", (req, res, next) => {
        req.session.user = { id: 1, uuid: "testuseruuid1" };
        next();
    });
    sessionApp.use(testApp);

    test("Responds with HTTP status 200 and session's user information.", async () => {
        const { status, text } = await request(sessionApp).get("/validate");
        expect(authMiddleware).toHaveBeenCalledTimes(1);
        expect(status).toEqual(200);
        expect(text).toEqual("testuseruuid1");
    });
});
