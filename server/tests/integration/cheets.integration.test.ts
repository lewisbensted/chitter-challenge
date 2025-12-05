import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../../prisma/resetDB";
import { createPrismaClient, ExtendedPrismaClient } from "../../prisma/prismaClient";
import { createApp } from "../../src/app";
import type { Express } from "express";
import { ExtendedCheetClient, ExtendedUserClient } from "../../types/extendedClients";
import request from "supertest";
import { sessionUser, testUsers } from "../fixtures/users.fixtures";
import { sessionUserCheet, sessionUserCheetStatus, testCheets } from "../fixtures/cheets.fixtures";

describe("Integration tests - Cheet routes", () => {
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
	describe("Fetch cheets at route [GET] /cheets", () => {
		beforeEach(async () => {
			await (prisma.user as unknown as ExtendedUserClient).createMany({ data: testUsers });
			await (prisma.cheet as unknown as ExtendedCheetClient).createMany({ data: testCheets });
		});
		test("No userId provided", async () => {
			const res = await request(app).get("/api/cheets");
			expect(res.status).toBe(200);
			expect(res.body.hasNext).toBe(false);
			expect(res.body.cheets).toHaveLength(10);
			expect(res.body.cheets[0]).toHaveProperty("uuid");
			expect(res.body.cheets[0]).toHaveProperty("text");
		});
		test("userId provided", async () => {
			const res = await request(app).get("/api/users/testuserid1/cheets");
			expect(res.status).toBe(200);
			expect(res.body.hasNext).toBe(false);
			expect(res.body.cheets).toHaveLength(4);
			expect(res.body.cheets[0]).toHaveProperty("uuid");
			expect(res.body.cheets[0]).toHaveProperty("text");
		});
		test("Empty return", async () => {
			const res = await request(app).get("/api/users/testuserid4/cheets");
			expect(res.status).toBe(200);
			expect(res.body).toEqual({ hasNext: false, cheets: [] });
		});
		test("Cursor and take", async () => {
			const res = await request(app).get("/api/cheets?cursor=testcheetid9&take=5");
			expect(res.status).toBe(200);
			expect(res.body.hasNext).toBe(true);
			expect(res.body.cheets).toHaveLength(5);
			expect(res.body.cheets[0].uuid).toBe("testcheetid8");
		});
		test("Failure - invalid user ID", async () => {
			const res = await request(app).get("/api/users/testuserinvalid/cheets");
			expect(res.status).toBe(404);
			expect(res.body).toEqual({ errors: ["The User you are trying to access could not be found."] });
		});
	});
	describe("Send cheet at route [POST] /cheets", () => {
		beforeEach(async () => {
			await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
		});
		test("Success", async () => {
			const res = await request(app)
				.post("/api/cheets")
				.set("session-required", "true")
				.send({ text: "New Cheet" });
			expect(res.status).toBe(201);
			expect(res.body).toEqual(expect.objectContaining({ text: "New Cheet" }));
		});
		test("Failure - validation error", async () => {
			const res = await request(app).post("/api/cheets").set("session-required", "true").send();
			expect(res.status).toBe(400);
			expect(res.body).toEqual({ errors: ["Text not provided."] });
		});
	});
	describe("Edit cheet at route [PUT] /cheets/:cheetId", () => {
		beforeEach(async () => {
			await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
			await prisma.cheet.create({ data: sessionUserCheet });
			await prisma.cheetStatus.create({ data: sessionUserCheetStatus });
		});
		test("Success", async () => {
			const res = await request(app)
				.put("/api/cheets/sessionusercheetid")
				.set("session-required", "true")
				.send({ text: "Edited Cheet" });

			expect(res.status).toBe(200);
			expect(res.body).toEqual(expect.objectContaining({ text: "Edited Cheet" }));
		});
		test("Failure - invalid cheet ID", async () => {
			const res = await request(app)
				.put("/api/cheets/testcheetinvalid")
				.set("session-required", "true")
				.send({ text: "Edited Cheet" });
			expect(res.status).toBe(404);
			expect(res.body).toEqual({ errors: ["The Cheet you are trying to access could not be found."] });
		});
		test("Failure - validation error", async () => {
			const res = await request(app)
				.put("/api/cheets/sessionusercheetid")
				.set("session-required", "true")
				.send({ text: "Ed" });
			expect(res.status).toBe(400);
			expect(res.body).toEqual({ errors: ["Cheet too short - must be between 5 and 50 characters."] });
		});
	});

	describe("Delete cheet at route [DELETE] /cheets/:cheetId", () => {
		beforeEach(async () => {
			await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
			await prisma.cheet.create({ data: sessionUserCheet });
			await prisma.cheetStatus.create({ data: sessionUserCheetStatus });
		});
		test("Success", async () => {
			const res = await request(app).delete("/api/cheets/sessionusercheetid").set("session-required", "true");
			expect(res.status).toBe(204);
		});
		test("Failure - invalid cheet ID", async () => {
			const res = await request(app).delete("/api/cheets/testcheetidinvalid").set("session-required", "true");
			expect(res.status).toBe(404);
			expect(res.body).toEqual({ errors: ["The Cheet you are trying to access could not be found."] });
		});
	});
});
