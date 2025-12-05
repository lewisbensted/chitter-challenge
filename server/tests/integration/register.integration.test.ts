import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../../prisma/resetDB";
import { createPrismaClient, type ExtendedPrismaClient } from "../../prisma/prismaClient";
import { createApp } from "../../src/app";
import { sessionUser } from "../fixtures/users.fixtures";
import request from "supertest";
import type { Express } from "express";
import { ExtendedUserClient } from "../../types/extendedClients";

describe("Integration tests - Register route", async () => {
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
	describe("Register user at route [POST] /register", () => {
		test("Success", async () => {
			const res = await request(app).post("/api/register").send(sessionUser);
			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty("uuid");
			expect(res.body.username).toBe("testusersession");
			expect(Object.keys(res.body).sort()).toEqual(["uuid", "username"].sort());
		});
		test("Failure - username and email already exist", async () => {
			await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
			const res = await request(app).post("/api/register").send(sessionUser);
			expect(res.status).toBe(400);
			expect(res.body.errors.sort()).toEqual(["Email address already taken.", "Username already taken."].sort());
		});
        
	});
});
