import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../../prisma/resetDB";
import { createPrismaClient, ExtendedPrismaClient } from "../../prisma/prismaClient";
import { createApp } from "../../src/app";
import type { Express } from "express";
import { ExtendedUserClient } from "../../types/extendedClients";
import request from "supertest";
import { sessionUser } from "../fixtures/users.fixtures";

describe("Integration tests - Login route", () => {
	let prisma: ExtendedPrismaClient;
	let app: Express;
	beforeAll(async () => {
		prisma = createPrismaClient();
		await prisma.$connect();
		app = createApp(prisma);
	});
	beforeEach(async () => {
		vi.spyOn(console, "error").mockImplementation(vi.fn());
		await resetDB(prisma);
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});
	afterAll(async () => {
		await prisma.$disconnect();
	});
	describe("Login at route [POST] /login", () => {
		test("Success", async () => {
			await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
			const res = await request(app).post("/api/login").send({ username: "testusersession", password: "password1!" });
			expect(res.status).toBe(200);
			expect(res.headers["set-cookie"]).toBeDefined();
			const cookiesHeaders = res.headers["set-cookie"];
			const cookies = cookiesHeaders ? (Array.isArray(cookiesHeaders) ? cookiesHeaders : [cookiesHeaders]) : [];
			expect(cookies.find((c) => c.startsWith("user_id="))).toBeDefined();
			expect(cookies.find((c) => c.startsWith("session="))).toBeDefined();
			expect(typeof res.body).toBe("string");
		});
		test("Failure - No matching user", async () => {
			const res = await request(app).post("/api/login").send({ username: "testusersession", password: "password1!" });
			expect(res.status).toBe(401);
			expect(res.body).toEqual({ errors: ["Invalid username or password."] });
		});
	});
});