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
		test("Invalid userId param provided", async () => {
			mockReq.session.user = { uuid: "mocksessionuserid" };
			await getUserHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Success - is following", async () => {
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
		test("Success - is not following", async () => {
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
		test("Success - no active session", async () => {
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
	});
	describe("searchUsersHandler()", () => {
		let fetchUsersMock: ReturnType<typeof vi.fn>;
		beforeEach(() => {
			fetchUsersMock = vi.fn().mockResolvedValue({ users: [], hasNext: false });
		});
		afterEach(() => {
			vi.clearAllMocks();
		});
		test("Success", async () => {
			mockReq.query.search = "search";
			mockReq.query.take = String(20);
			mockReq.query.cursor = "valid";
			prismaMock.user.findUnique.mockResolvedValueOnce("valid");
			await searchUsersHandler(prismaMock as unknown as ExtendedPrismaClient, fetchUsersMock)(
				mockReq as unknown as SearchUsersRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchUsersMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				20,
				"search",
				undefined,
				"valid"
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ users: [], hasNext: false });
		});
		test("No search param", async () => {
			await searchUsersHandler(prismaMock as unknown as ExtendedPrismaClient, fetchUsersMock)(
				mockReq as unknown as SearchUsersRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ users: [], hasNext: false });
		});
		test("Empty search string", async () => {
			mockReq.query.search = "";
			await searchUsersHandler(prismaMock as unknown as ExtendedPrismaClient, fetchUsersMock)(
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
			await searchUsersHandler(prismaMock as unknown as ExtendedPrismaClient, fetchUsersMock)(
				mockReq as unknown as SearchUsersRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchUsersMock).toHaveBeenCalledWith(
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
			await searchUsersHandler(prismaMock as unknown as ExtendedPrismaClient, fetchUsersMock)(
				mockReq as unknown as SearchUsersRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchUsersMock).toHaveBeenCalledWith(
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
			await searchUsersHandler(prismaMock as unknown as ExtendedPrismaClient, fetchUsersMock)(
				mockReq as unknown as SearchUsersRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchUsersMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				10,
				"search",
				undefined,
				undefined
			);
		});
		test("Error", async () => {
			mockReq.query.search = "search";
			fetchUsersMock.mockRejectedValueOnce(new Error("DB exploded"));
			await searchUsersHandler(prismaMock as unknown as ExtendedPrismaClient, fetchUsersMock)(
				mockReq as unknown as SearchUsersRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
