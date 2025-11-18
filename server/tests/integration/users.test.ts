import { beforeAll, describe, expect, test, vi } from "vitest";
import prisma from "../../prisma/prismaClient";
import { resetDB } from "../../prisma/resetDB";
import { validTestUsers } from "../fixtures/users.fixtures";
import { searchUsersHandler } from "./../../src/routes/users";
import { createMockRes } from "../test-utils";
import { Request } from "express";

describe("Users", () => {
	beforeAll(async () => {
		await resetDB();
		await prisma.user.createMany({ data: validTestUsers });
	});
	describe("Search for multiple users", () => {
		test("Empty Search", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				query: {},
			} as unknown as Request;
			const mockRes = createMockRes();
			await searchUsersHandler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ users: [], hasNext: false });
		});
		test("Matches one user - hasNext is false", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				query: { search: "unique" },
			} as unknown as Request;
			const mockRes = createMockRes();
			await searchUsersHandler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			const res = mockRes.json.mock.calls[0][0];
			expect(res.users).toHaveLength(1);
			expect(res.users[0].user).toStrictEqual({ username: "testuserunique", uuid: "testuseruuid6" });
			expect(res.users[0].isFollowing).toBe(false);
			expect(res.hasNext).toBe(false);
		});
		test("Matches multiple users - hasNext is true", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				query: { search: "test", take: 5 },
			} as unknown as Request;
			const mockRes = createMockRes();
			await searchUsersHandler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			const res = mockRes.json.mock.calls[0][0];
			expect(res.users).toHaveLength(5);
			expect(res.hasNext).toBe(true);
		});
        test("Invalid take", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				query: { search: "test", take: 'hi' },
			} as unknown as Request;
			const mockRes = createMockRes();
			await searchUsersHandler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			const res = mockRes.json.mock.calls[0][0];
			expect(res.users).toHaveLength(6);
			expect(res.hasNext).toBe(false);
		});
		test("No active session - null isFollowing", async () => {
			const mockReq = {
				session: {},
				query: { search: "unique" },
			} as unknown as Request;
			const mockRes = createMockRes();
			await searchUsersHandler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			const res = mockRes.json.mock.calls[0][0];
			expect(res.users[0].user).toStrictEqual({ username: "testuserunique", uuid: "testuseruuid6" });
			expect(res.users[0].isFollowing).toBe(null);
		});
		test("No matches", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				query: { search: "moreunique" },
			} as unknown as Request;
			const mockRes = createMockRes();
			await searchUsersHandler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			const res = mockRes.json.mock.calls[0][0];
			expect(res.users).toHaveLength(0);
			expect(res.hasNext).toBe(false);
		});
		test("Pagination - valid cursor", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				query: { search: "test", cursor: "testuseruuid2" },
			} as unknown as Request;
			const mockRes = createMockRes();
			await searchUsersHandler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			const res = mockRes.json.mock.calls[0][0];
			expect(res.users).toHaveLength(4);
			expect(res.users[0].user).toStrictEqual({ username: "testuser3", uuid: "testuseruuid3" });
		});
        test("Pagination - incorrect cursor", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				query: { search: "test", cursor: "notauser" },
			} as unknown as Request;
			const mockRes = createMockRes();
			await searchUsersHandler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			const res = mockRes.json.mock.calls[0][0];
			expect(res.users).toHaveLength(6);
		});
        test("Pagination - invalid cursor", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				query: { search: "test", cursor: 3 },
			} as unknown as Request;
			const mockRes = createMockRes();
			await searchUsersHandler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			const res = mockRes.json.mock.calls[0][0];
			expect(res.users).toHaveLength(6);

		});
		test("Error", () => {
			expect(true).toBe(false)
		});
	});
	describe("Search for single users", () => {
		test("No userId param provided", () => {expect(true).toBe(false)});
		test("Invalid userId param provided", () => {expect(true).toBe(false)});
		test("Matches user - active session", () => {expect(true).toBe(false)});
		test("Matches user - no active session", () => {expect(true).toBe(false)});
		test("Error", () => {expect(true).toBe(false)});
	});
});
