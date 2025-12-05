import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { getUserHandler, searchUsersHandler } from "../../../src/routes/users";
import { prismaMock } from "../../test-utils/prismaMock";
import { Response, Request } from "express";
import { SearchUsersRequest } from "../../../types/requests";
import { ExtendedPrismaClient } from "../../../prisma/prismaClient";
import { mockNext } from "../../test-utils/mockNext";

describe("Unit tests - User handlers", () => {
	let mockReq: MockRequest;
	let mockRes: MockResponse;
	beforeEach(() => {
		vi.spyOn(console, "error").mockImplementation(vi.fn());
		mockReq = createMockReq();
		mockRes = createMockRes();
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});
	describe("getUserHandler()", () => {
		test("Session user is following user", async () => {
			mockReq.session.user = { uuid: "mocksessionuserid" };
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockuserid",
				followers: [{ followerId: "mocksessionuserid" }],
			});
			await getUserHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				user: { uuid: "mockuserid" },
				isFollowing: true,
			});
		});
		test("Session user is not following user", async () => {
			mockReq.session.user = { uuid: "mocksessionuserid" };
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockuserid",
				followers: [],
			});
			await getUserHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				user: { uuid: "mockuserid" },
				isFollowing: false,
			});
		});
		test("No active session", async () => {
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockuserid",
			});
			await getUserHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				user: { uuid: "mockuserid" },
				isFollowing: null,
			});
		});
		test("Failure - invalid userId param provided", async () => {
			mockReq.session.user = { uuid: "mocksessionuserid" };
			await getUserHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - database error", async () => {
			prismaMock.user.findUniqueOrThrow.mockRejectedValueOnce(new Error("DB Error"));
			await getUserHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("searchUsersHandler()", () => {
		let searchUsersMock: ReturnType<typeof vi.fn>;
		beforeEach(() => {
			searchUsersMock = vi.fn().mockResolvedValue({ users: [], hasNext: false });
		});
		afterEach(() => {
			vi.clearAllMocks();
		});
		test("Search string provided", async () => {
			mockReq.query.search = "search";
			mockReq.query.take = String(20);
			mockReq.query.cursor = "valid";
			prismaMock.user.findUnique.mockResolvedValueOnce("valid");
			await searchUsersHandler(prismaMock as unknown as ExtendedPrismaClient, searchUsersMock)(
				mockReq as unknown as SearchUsersRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(searchUsersMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				20,
				"search",
				undefined,
				"valid"
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ users: [], hasNext: false });
		});
		test("No search parameter provided", async () => {
			await searchUsersHandler(prismaMock as unknown as ExtendedPrismaClient, searchUsersMock)(
				mockReq as unknown as SearchUsersRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ users: [], hasNext: false });
		});
		test("Empty search string", async () => {
			mockReq.query.search = "";
			await searchUsersHandler(prismaMock as unknown as ExtendedPrismaClient, searchUsersMock)(
				mockReq as unknown as SearchUsersRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ users: [], hasNext: false });
		});
		test("Invalid take", async () => {
			mockReq.query.search = "search";
			mockReq.query.take = "invalid";
			await searchUsersHandler(prismaMock as unknown as ExtendedPrismaClient, searchUsersMock)(
				mockReq as unknown as SearchUsersRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(searchUsersMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				10,
				"search",
				undefined,
				undefined
			);
		});
		test("Take clamped at max value", async () => {
			mockReq.query.search = "search";
			mockReq.query.take = String(100);
			await searchUsersHandler(prismaMock as unknown as ExtendedPrismaClient, searchUsersMock)(
				mockReq as unknown as SearchUsersRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(searchUsersMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				50,
				"search",
				undefined,
				undefined
			);
		});
		test("Invalid cursor", async () => {
			mockReq.query.search = "search";
			mockReq.query.cursor = "invalid";
			prismaMock.user.findUnique.mockResolvedValueOnce(null);
			await searchUsersHandler(prismaMock as unknown as ExtendedPrismaClient, searchUsersMock)(
				mockReq as unknown as SearchUsersRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(searchUsersMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				10,
				"search",
				undefined,
				undefined
			);
		});
		test("Failure - searchUsers() error", async () => {
			mockReq.query.search = "search";
			searchUsersMock.mockRejectedValueOnce(new Error("Search Error"));
			await searchUsersHandler(prismaMock as unknown as ExtendedPrismaClient, searchUsersMock)(
				mockReq as unknown as SearchUsersRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
