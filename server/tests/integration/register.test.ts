// import { describe, expect, test, beforeEach, vi, afterEach } from "vitest";
// import request from "supertest";
// import app from "../../src/app";
// import { resetDB } from "../../prisma/resetDB";
// import prisma from "../../prisma/prismaClient";
// import { ExtendedUserClient } from "../../types/extendedClients";
// import { validUser } from "../fixtures/users.fixtures";



// describe("Integration tests - Register route", async () => {
// 	beforeEach(async () => {
// 		await resetDB(prisma);
// 	});
// 	afterEach(() => {
// 		vi.restoreAllMocks();
// 	});
// 	describe("Register user at route [POST] /register", () => {
// 		test("Success", async () => {
// 			const res = await request(app).post("/api/register").send(validUser);
// 			expect(res.status).toBe(201);
// 			expect(res.body).toHaveProperty("uuid");
// 			expect(res.body.username).toBe("testuser");
// 			expect(Object.keys(res.body).sort()).toEqual(["uuid", "username"].sort());
// 		});
// 		test("Failure - username and email already exist", async () => {
// 			await (prisma.user as unknown as ExtendedUserClient).create({ data: validUser });
// 			const res = await request(app).post("/api/register").send(validUser);
// 			expect(res.status).toBe(400);
// 			expect(res.body.errors.sort()).toEqual(["Email address already taken.", "Username already taken."].sort());
// 		});
// 		test("Failure - DB error", async () => {
// 			vi.spyOn(prisma.user, "create").mockRejectedValue(new Error("Database error"));
// 			const res = await request(app).post("/api/register").send(validUser);
// 			expect(res.status).toBe(500);
// 			expect(res.body).toEqual({ errors: ["Internal server error."] });
// 		});
// 	});
// });
