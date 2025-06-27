import { test, describe, beforeEach, expect, vi } from "vitest";
import { resetDB } from "../../../prisma/resetDB";
import prisma from "../../../prisma/prismaClient";
import login from "../../routes/login";
import express from "express";
import request from "supertest";
import session from "express-session";
import { testUser1 } from "../fixtures/users.fixtures";
import { registerExtension } from "../../routes/register";

interface IResponse {
	status: number;
	body: string | string[];
}

describe("Login with an existing user at route: [POST] /login.", () => {
	vi.mock("./../../utils/authenticate", () => ({
		authenticate: vi
			.fn()
			.mockImplementationOnce(() => true)
			.mockImplementation(() => false),
	}));

	beforeEach(async () => {
		await resetDB();
		await prisma.$extends(registerExtension).user.create({ data: testUser1 }); // user extension needed to check hashed password
	});

	const testApp = express();
	testApp.use(session({ secret: "secret-key", name: "session", saveUninitialized: false, resave: false }));
	testApp.use("/login", express.json(), login);

	test("Responds with HTTP status 403 if the user already exist on the session object (is already logged in).", async () => {
		const { status, body } = (await request(testApp)
			.post("/login")
			.send({ username: "testuser1", password: "password1!" })) as IResponse;
		expect(status).toEqual(403);
		expect(body).toEqual(["Already logged in."]);
	});
	test("Responds with HTTP status 200 if the password and username provided match their respective values in the database.", async () => {
		const { status, text, headers } = await request(testApp)
			.post("/login")
			.send({ username: "testuser1", password: "password1!" });
		expect(status).toEqual(200);
		expect(text).toEqual("testuseruuid1");
		let cookies = headers["set-cookie"] as unknown as string[];
		cookies = cookies.map((cookie) => cookie.split(";")[0]);
		expect(cookies).toContain("user_id=testuseruuid1");
		cookies = cookies.map((cookie) => cookie.split("=")[0]);
		expect(cookies).toContain("session");
		expect(cookies).toContain("session_id");
	});
	test("Responds with HTTP status 400 if username is not provided as a parameter.", async () => {
		const { status, body } = (await request(testApp).post("/login").send({ password: "password1!" })) as IResponse;
		expect(status).toEqual(400);
		expect(body).toEqual(["Username not provided."]);
	});
	test("Responds with HTTP status 400 if username provided is empty string.", async () => {
		const { status, body } = (await request(testApp)
			.post("/login")
			.send({ username: "", password: "password1!" })) as IResponse;
		expect(status).toEqual(400);
		expect(body).toEqual(["Username not provided."]);
	});
	test("Responds with HTTP status 400 if password is not provided as a parameter.", async () => {
		const { status, body } = (await request(testApp).post("/login").send({ username: "testuser1" })) as IResponse;
		expect(status).toEqual(400);
		expect(body).toEqual(["Password not provided."]);
	});
	test("Responds with HTTP status 400 if password provided is empty string.", async () => {
		const { status, body } = (await request(testApp)
			.post("/login")
			.send({ username: "testuser1", password: "" })) as IResponse;
		expect(status).toEqual(400);
		expect(body).toEqual(["Password not provided."]);
	});
	test("Responds with HTTP status 401 if the password provided in the params does not match the decrypted value from the database.", async () => {
		const { status, body } = (await request(testApp)
			.post("/login")
			.send({ username: "testuser1", password: "password1" })) as IResponse;
		expect(status).toEqual(401);
		expect(body).toEqual(["Incorrect password."]);
	});
	test("Responds with HTTP status 404 if user does not exist in the database.", async () => {
		const { status, body } = (await request(testApp)
			.post("/login")
			.send({ username: "testuser", password: "password1!" })) as IResponse;
		expect(status).toEqual(404);
		expect(body).toEqual(["User does not exist."]);
	});
});
