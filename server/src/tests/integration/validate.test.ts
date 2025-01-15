import express, { NextFunction } from "express";
import { test, describe, vi, expect } from "vitest";
import validate from "../../routes/validate";
import request from "supertest";
import session from "express-session";
import { authMiddleware } from "../../middleware/authMiddleware";

describe("Return information about the session's user at route: [GET] /validate.", () => {
	vi.mock("./../../middleware/authMiddleware", () => ({
		authMiddleware: vi.fn((_req, _res, next: NextFunction) => {
			next();
		}),
	}));

	const testApp = express();
	testApp.use(session({ secret: "secret-key" }));
	testApp.all("*", (req, _res, next) => {
		req.session.user = { id: 1, uuid: "testuseruuid1" };
		next();
	});
	testApp.use("/validate", validate);

	test("Responds with HTTP status 200 and session's user information.", async () => {
		const { status, text } = await request(testApp).get("/validate");
		expect(authMiddleware).toHaveBeenCalledTimes(1);
		expect(status).toEqual(200);
		expect(text).toEqual("testuseruuid1");
	});
});
