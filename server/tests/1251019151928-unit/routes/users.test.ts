vi.mock("../../../src/utils/sendErrorResponse", () => ({
	sendErrorResponse: vi.fn(),
}));
vi.mock("../../../src/utils/logError", () => ({
	logError: vi.fn(),
}));

import { beforeAll, describe, expect, test, vi } from "vitest";
import prisma from "../../../prisma/prismaClient";
import { resetDB } from "../../../prisma/resetDB";
import { testUsers } from "../../fixtures/users.fixtures";
import { getUserHandler, searchUsersHandler } from "../../../src/routes/users";
import { createMockRes } from "../../test-utils/createMockRes";
import { Request } from "express";
import { sendErrorResponse } from "../../../src/utils/sendErrorResponse";
import { logError } from "../../../src/utils/logError";
import { prismaMock } from "../../test-utils/prismaMock";

describe("Users", () => {
	beforeAll(async () => {
		await resetDB();
		await prisma.user.createMany({ data: testUsers });
	});
	describe("Search for multiple users", () => {
		test("Empty search", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				query: {},
			} as unknown as Request;
			const mockRes = createMockRes();
			const handler = searchUsersHandler(prisma);
			await handler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ users: [], hasNext: false });
		});
		test("Invalid search", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				query: { search: 2 },
			} as unknown as Request;
			const mockRes = createMockRes();
			const handler = searchUsersHandler(prisma);
			await handler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ users: [], hasNext: false });
		});
		test("Matches one user - hasNext is false", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				query: { search: "unique" },
			} as unknown as Request;
			const mockRes = createMockRes();
			const handler = searchUsersHandler(prisma);
			await handler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			const res = mockRes.json.mock.calls[0][0];
			expect(res.users).toHaveLength(1);
			expect(res.users[0].user).toStrictEqual({ username: "testuserunique", uuid: "testuseruuid6" });
			expect(res.users[0].isFollowing).toBe(false);
			expect(res.hasNext).toBe(false);
		});
		test("Matches multiple users - take, hasNext and no cursor.", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				query: { search: "test", take: 5 },
			} as unknown as Request;
			const mockRes = createMockRes();
			const handler = searchUsersHandler(prisma);
			await handler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			const res = mockRes.json.mock.calls[0][0];
			expect(res.users).toHaveLength(5);
			expect(res.hasNext).toBe(true);
		});
		test("Invalid take", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				query: { search: "test", take: "invalid" },
			} as unknown as Request;
			const mockRes = createMockRes();
			const handler = searchUsersHandler(prisma);
			await handler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			const res = mockRes.json.mock.calls[0][0];
			expect(res.users).toHaveLength(6);
			expect(res.hasNext).toBe(false);
		});
		test("Take clamped at max value", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				query: { search: "test", take: 100 },
			} as unknown as Request;
			const mockRes = createMockRes();
			prismaMock.user.findMany.mockResolvedValueOnce([]);
			const handler = searchUsersHandler(prismaMock);
			await handler(mockReq, mockRes);
			expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 51 }));
		});
		test("No active session - null isFollowing", async () => {
			const mockReq = {
				session: {},
				query: { search: "unique" },
			} as unknown as Request;
			const mockRes = createMockRes();
			const handler = searchUsersHandler(prisma);
			await handler(mockReq, mockRes);
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
			const handler = searchUsersHandler(prisma);
			await handler(mockReq, mockRes);
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
			const handler = searchUsersHandler(prisma);
			await handler(mockReq, mockRes);
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
			const handler = searchUsersHandler(prisma);
			await handler(mockReq, mockRes);
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
			const handler = searchUsersHandler(prisma);
			await handler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			const res = mockRes.json.mock.calls[0][0];
			expect(res.users).toHaveLength(6);
		});
		test("Error", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				query: { search: "test", cursor: 3 },
			} as unknown as Request;
			const mockRes = createMockRes();
			prismaMock.user.findMany.mockRejectedValueOnce(new Error("DB exploded"));
			const handler = searchUsersHandler(prismaMock);
			await handler(mockReq, mockRes);
			expect(sendErrorResponse).toHaveBeenCalled();
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalled();
		});
	});
	describe("Search for single users", () => {
		test("No userId param provided", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				params: {},
			} as unknown as Request;
			const mockRes = createMockRes();
			const handler = getUserHandler(prisma);
			await handler(mockReq, mockRes);
			expect(sendErrorResponse).toHaveBeenCalled();
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalled();
		});
		test("Invalid userId param provided", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				params: { userId: 1 },
			} as unknown as Request;
			const mockRes = createMockRes();
			const handler = getUserHandler(prisma);
			await handler(mockReq, mockRes);
			expect(sendErrorResponse).toHaveBeenCalled();
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalled();
		});
		test("Matches user - active session", async () => {
			const mockReq = {
				session: { user: { uuid: "testuseruuid1" } },
				params: { userId: "testuseruuid2" },
			} as unknown as Request;
			const mockRes = createMockRes();
			const handler = getUserHandler(prisma);
			await handler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				user: { username: "testuser2", uuid: "testuseruuid2" },
				isFollowing: false,
			});
		});
		test("Matches user - no active session", async () => {
			const mockReq = {
				session: {},
				params: { userId: "testuseruuid2" },
			} as unknown as Request;
			const mockRes = createMockRes();
			const handler = getUserHandler(prisma);
			await handler(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				user: { username: "testuser2", uuid: "testuseruuid2" },
				isFollowing: null,
			});
		});
	});
});
