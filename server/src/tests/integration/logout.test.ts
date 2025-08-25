import { beforeEach, describe, expect, test } from "vitest";
import express from "express";
import logout from "../../routes/logout";
import request from "supertest";
import session from "express-session";
import { resetDB } from "../../../prisma/resetDB";

describe("Logout a user at route: [DELETE] /logout.", () => {
	beforeEach(async () => {
		await resetDB();
	});

	test("Responds with HTTP status 403 if a user does not exist on the session object (is not logged in).", async () => {
		const testApp1 = express();
		testApp1.use(session({ secret: "secret-key", saveUninitialized: false, resave: false }));
		testApp1.use("/logout", logout);
		const { status, body } = (await request(testApp1).delete("/logout")) as { status: number; body: string[] };
		expect(status).toEqual(403);
		expect(body).toEqual(["Not logged in."]);
	});

	test("Responds with HTTP status 200 when a user is successfully logged out.", async () => {
		const testApp2 = express();
		testApp2.use(session({ secret: "secret-key", saveUninitialized: false, resave: false }));
		testApp2.all("*", (req, _res, next) => {
			req.session.user = { id: 1, uuid: "testuseruuid1" };
			req.cookies = { user_id: "testuserid", session_id: "testsessionid" };
			next();
		});
		testApp2.use("/logout", logout);
		const { status, text, headers } = await request(testApp2).delete("/logout");
		expect(status).toEqual(200);
		let cookies = headers["set-cookie"] as unknown as string[];
		cookies = cookies.map((cookie) => cookie.split(";")[0]);
		expect(cookies).toContain("user_id=");
		expect(cookies).toContain("session_id=");
		expect(text).toEqual("Logout successful.");
	});
});
