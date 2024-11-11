import { beforeEach, describe, expect, test } from "vitest";
import express from "express";
import logout from "../../routes/logout";
import request from "supertest";
import session from "express-session";
import { resetDB } from "../resetDB";

describe("Logout a user at route: [DELETE] /logout.", async () => {
    beforeEach(async () => {
        await resetDB();
    });

    const testApp = express();
    testApp.use("/logout", logout);

    test("Responds with HTTP status 403 if a user does not exist on the session object (is not logged in).", async () => {
        const sessionApp = express();
        sessionApp.use(session({ secret: "secret-key" }));
        sessionApp.use(testApp);
        const { status, body } = await request(sessionApp).delete("/logout");
        expect(status).toEqual(403);
        expect(body).toEqual(["Not logged in."]);
    });

    test("Responds with HTTP status 200 when a user is successfully logged out.", async () => {
        const sessionApp = express();
        sessionApp.use(session({ secret: "secret-key" }));
        sessionApp.all("*", (req, res, next) => {
            req.session.user = { id: 1, username: "testuser1" };
            next();
        });
        sessionApp.use(testApp);
        const { status, text } = await request(sessionApp).delete("/logout");
        expect(status).toEqual(200);
        expect(text).toEqual("Logout successful.");
    });
});
