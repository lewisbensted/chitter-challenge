// import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
// import request from "supertest";
// import app from "../../src/app";
// import { resetDB } from "../../prisma/resetDB";
// import prisma from "../../prisma/prismaClient";
// import { ExtendedUserClient } from "../../types/extendedClients";
// import { testUsers } from "../fixtures/users.fixtures";



// describe("Integration tests - User routes", () => {
// 	beforeEach(async () => {
// 		vi.spyOn(console, "error").mockImplementation(vi.fn());
// 		await resetDB(prisma);
// 		await (prisma.user as unknown as ExtendedUserClient).createMany({ data: testUsers });
// 	});
// 	afterAll(async () => {
// 		await prisma.$disconnect();
// 	});
// 	describe("Get user at route [GET] /user/:userId", () => {
// 		test("Success", async () => {
// 			const res = await request(app).get("/api/users/testuserid1");
// 			expect(res.status).toBe(200);
// 			expect(res.body.user).toEqual({
// 				username: "testuser1",
// 				uuid: "testuserid1",
// 			});
// 			expect(res.body.isFollowing).toBeNull();
// 		});
// 		test("Failure - DB error", async () => {
// 			vi.spyOn(prisma.user, "findUniqueOrThrow").mockRejectedValue(new Error("Database error"));
// 			const res = await request(app).get("/api/users/testuserid1");
// 			expect(res.status).toBe(500);
// 			expect(res.body).toEqual({ errors: ["Internal server error."] });
// 		});
// 	});
// 	describe("Search users at route [GET] /users", () => {
// 		test("Success - search string provided", async () => {
// 			const res = await request(app).get("/api/users?search=test");
// 			expect(res.status).toBe(200);
// 			expect(res.body.users).toHaveLength(5);
// 			expect(res.body.hasNext).toBe(false);
// 			expect(res.body.users[0]).toEqual({
// 				user: { uuid: "testuserid1", username: "testuser1" },
// 				isFollowing: null,
// 			});
// 		});
// 		test("Success - no search string provided", async () => {
// 			const res = await request(app).get("/api/users");
// 			expect(res.status).toBe(200);
// 			expect(res.body).toEqual({ users: [], hasNext: false });
// 		});
// 		test("Success - cursor and take", async () => {
// 			const res = await request(app).get("/api/users?search=test&cursor=testuserid1&take=2");
// 			expect(res.status).toBe(200);
// 			expect(res.body.users).toHaveLength(2);
// 			expect(res.body.hasNext).toBe(true);
// 			expect(res.body.users[0].user).toEqual({ uuid: "testuserid2", username: "testuser2" });
// 		});
// 		test("Failure - DB error", async () => {
// 			vi.spyOn(prisma.user, "findMany").mockRejectedValue(new Error("Database error"));
// 			const res = await request(app).get("/api/users?search=test");
// 			expect(res.status).toBe(500);
// 			expect(res.body).toEqual({ errors: ["Internal server error."] });
// 		});
// 	});
// });
