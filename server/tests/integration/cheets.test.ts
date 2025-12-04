// import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
// import { resetDB } from "../../prisma/resetDB";
// import prisma from "../../prisma/prismaClient";
// import { testUsers } from "../fixtures/users.fixtures";
// import { ExtendedCheetClient, ExtendedUserClient } from "../../types/extendedClients";
// import { testCheets } from "../fixtures/cheets.fixtures";
// import app from "../../src/app";
// import request from "supertest";
// import { NextFunction, Request, Response } from "express";


// describe("Integration tests - Cheet routes", () => {
// 	beforeEach(async () => {
// 		await resetDB(prisma);
// 		await (prisma.user as unknown as ExtendedUserClient).createMany({ data: testUsers });
// 		await (prisma.cheet as unknown as ExtendedCheetClient).createMany({ data: testCheets });
// 	});
// 	afterEach(() => {
// 		vi.restoreAllMocks();
// 	});
// 	describe("Fetch cheets at route [GET] /cheets", () => {
// 		test("Success - no userId provided", async () => {
// 			const res = await request(app).get("/api/cheets");
// 			expect(res.status).toBe(200);
// 			expect(res.body.hasNext).toBe(false);
// 			expect(res.body.cheets).toHaveLength(10);
// 			expect(res.body.cheets[0]).toHaveProperty("uuid");
// 			expect(res.body.cheets[0]).toHaveProperty("text");
// 		});
// 		test("Success - userId provided", async () => {
// 			const res = await request(app).get("/api/users/testuserid1/cheets");
// 			expect(res.status).toBe(200);
// 			expect(res.body.hasNext).toBe(false);
// 			expect(res.body.cheets).toHaveLength(4);
// 			expect(res.body.cheets[0]).toHaveProperty("uuid");
// 			expect(res.body.cheets[0]).toHaveProperty("text");
// 		});
// 		test("Success - empty return", async () => {
// 			const res = await request(app).get("/api/users/testuserid4/cheets");
// 			expect(res.status).toBe(200);
// 			expect(res.body.hasNext).toBe(false);
// 			expect(res.body.cheets).toHaveLength(0);
// 		});
// 		test("Success - cursor and take", async () => {
// 			const res = await request(app).get("/api/cheets?cursor=testcheetid9&take=5");
// 			expect(res.status).toBe(200);
// 			expect(res.body.hasNext).toBe(true);
// 			expect(res.body.cheets).toHaveLength(5);
// 			expect(res.body.cheets[0].uuid).toBe("testcheetid8");
// 		});
// 		test("Failure - DB error", async () => {
// 			vi.spyOn(prisma.cheet, "findMany").mockRejectedValue(new Error("Database error"));
// 			const res = await request(app).get("/api/cheets");
// 			expect(res.status).toBe(500);
// 			expect(res.body).toEqual({ errors: ["Internal server error."] });
// 		});
// 	});
// 	describe("Send cheet at route [POST] /cheets", () => {
// 		test("Success", () => {
// 			expect(true).toBe(false);
// 		});
// 		test("Failure - DB error", async () => {
// 			vi.spyOn(prisma.cheet, "create").mockRejectedValue(new Error("Database error"));
			
// 			const res = await request(app).post("/api/cheets").send({ text: "New Cheet" });
// 			expect(res.status).toBe(500);
// 			expect(res.body).toEqual({ errors: ["Internal server error."] });
// 		});
// 	});
// 	describe("Edit cheet at route [PUT] /cheets/:cheetId", () => {
// 		test("Success", () => {
// 			expect(true).toBe(false);
// 		});
// 		test("Failure - DB error", () => {
// 			expect(true).toBe(false);
// 		});
// 	});
// 	describe("Delete cheet at route [DELETE] /cheets/:cheetId", () => {
// 		test("Success", () => {
// 			expect(true).toBe(false);
// 		});
// 		test("Failure - DB error", () => {
// 			expect(true).toBe(false);
// 		});
// 	});
// });
