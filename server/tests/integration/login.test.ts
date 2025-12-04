// import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
// import { resetDB } from "../../prisma/resetDB";
// import prisma from "../../prisma/prismaClient";
// import { ExtendedUserClient } from "../../types/extendedClients";
// import request from "supertest";
// import app from "../../src/app";
// import { validUser } from "../fixtures/users.fixtures";

// describe("Integration tests - Login route", () => {
// 	beforeEach(async () => {
// 		await resetDB(prisma);
// 	});
// 	afterEach(() => {
// 		vi.restoreAllMocks();
// 	});
// 	describe("Login at route [POST] /login", () => {
// 		test("Success", async () => {

// 			await (prisma.user as unknown as ExtendedUserClient).create({ data: validUser });
// 			const res = await request(app).post("/api/login").send({ username: "testuser", password: "password1!" });
// 			expect(res.status).toBe(200);
// 			expect(res.headers["set-cookie"]).toBeDefined();
// 			const cookiesHeaders = res.headers["set-cookie"];
// 			const cookies = cookiesHeaders ? (Array.isArray(cookiesHeaders) ? cookiesHeaders : [cookiesHeaders]) : [];
// 			expect(cookies.find((c) => c.startsWith("user_id="))).toBeDefined();
// 			expect(cookies.find((c) => c.startsWith("session="))).toBeDefined();
// 			expect(typeof res.body).toBe("string");
// 		});
// 		test("Failure - invalid username or password", async () => {
// 			vi.spyOn(prisma.user, "create").mockRejectedValue(new Error("Database error"));
// 			const res = await request(app).post("/api/login").send({ username: "testuse", password: "password1!" });
// 			expect(res.status).toBe(401);
// 			expect(res.body).toEqual({ errors: ["Invalid username or password."] });
// 		});
// 	});
// });
