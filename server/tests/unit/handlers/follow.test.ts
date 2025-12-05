import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { prismaMock } from "../../test-utils/prismaMock";
import { followHandler, unfollowHandler } from "../../../src/routes/follow";
import { Response, Request } from "express";
import { ExtendedPrismaClient } from "../../../prisma/prismaClient";
import { mockNext } from "../../test-utils/mockNext";

describe("Unit tests - Follow handlers", () => {
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
	describe("followHandler()", () => {
		test("Failure - unauthorised", async () => {
			await followHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Self follow", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.followingId = "mockuserid";
			await followHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["You cannot follow yourself."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.followingId = "otheruserid";
			prismaMock.follow.create.mockResolvedValueOnce({});
			await followHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.sendStatus).toHaveBeenCalledWith(201);
		});
		test("Failure - database error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.followingId = "otheruserid";
			prismaMock.follow.create.mockRejectedValueOnce(new Error("DB exploded"));
			await followHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("unfollowHandler()", () => {
		test("Failure - unauthorised", async () => {
			await unfollowHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.followingId = "otheruserid";
			prismaMock.follow.delete.mockResolvedValueOnce({});
			await unfollowHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
		});
		test("Success - record already removed", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.followingId = "otheruserid";
			prismaMock.follow.create.mockRejectedValueOnce({
				code: "P2025",
			});
			await unfollowHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
		});
		test("Failure - database error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.followingId = "otheruserid";
			prismaMock.follow.delete.mockRejectedValueOnce(new Error("DB exploded"));
			await unfollowHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
