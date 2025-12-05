import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
	getRepliesHandler,
	createReplyHandler,
	updateReplyHandler,
	deleteReplyHandler,
} from "../../../src/routes/replies";
import { prismaMock } from "../../test-utils/prismaMock";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { EditReplyRequest, SendReplyRequest } from "../../../types/requests";
import { Response, Request } from "express";
import { ExtendedPrismaClient } from "../../../prisma/prismaClient";
import { mockNext } from "../../test-utils/mockNext";

describe("Unit tests - Reply handlers", () => {
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
	describe("getRepliesHandler()", () => {
		let fetchRepliesMock: ReturnType<typeof vi.fn>;
		beforeEach(() => {
			fetchRepliesMock = vi.fn().mockResolvedValue({ replies: [], hasNext: false });
		});
		afterEach(() => {
			vi.clearAllMocks();
		});
		test("Success", async () => {
			mockReq.params.cheetId = "mockcheetid";
			mockReq.query.take = String(20);
			mockReq.query.cursor = "valid";
			prismaMock.reply.findUnique.mockResolvedValueOnce("valid");
			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockcheet" });
			await getRepliesHandler(prismaMock as unknown as ExtendedPrismaClient, fetchRepliesMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchRepliesMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				20,
				"mockcheet",
				"valid"
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ replies: [], hasNext: false });
		});
		test("Failure - invalid cheet ID provided", async () => {
			mockReq.params.cheetId = "mockcheetid";
			prismaMock.cheet.findUniqueOrThrow.mockRejectedValueOnce(new Error("Invalid Cheet"));
			await getRepliesHandler(prismaMock as unknown as ExtendedPrismaClient, fetchRepliesMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Invalid take provided", async () => {
			mockReq.params.cheetId = "mockcheetid";
			mockReq.query.take = "invalidtake";

			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockcheet" });
			await getRepliesHandler(prismaMock as unknown as ExtendedPrismaClient, fetchRepliesMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchRepliesMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				10,
				"mockcheet",
				undefined
			);
		});
		test("Take clamped at max value", async () => {
			mockReq.params.cheetId = "mockcheetid";
			mockReq.query.take = String(100);

			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockcheet" });
			await getRepliesHandler(prismaMock as unknown as ExtendedPrismaClient, fetchRepliesMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchRepliesMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				50,
				"mockcheet",
				undefined
			);
		});
		test("Invalid cursor provided", async () => {
			mockReq.params.cheetId = "mockcheetid";
			mockReq.query.cursor = "invalidcursor";

			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockcheet" });
			prismaMock.reply.findUnique.mockResolvedValueOnce(null);
			await getRepliesHandler(prismaMock as unknown as ExtendedPrismaClient, fetchRepliesMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchRepliesMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				10,
				"mockcheet",
				undefined
			);
		});
		test("Failure - fetchReplies() error", async () => {
			mockReq.params.cheetId = "mockcheetid";
			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockcheet" });
			fetchRepliesMock.mockRejectedValueOnce(new Error("Fetch Error"));
			await getRepliesHandler(prismaMock as unknown as ExtendedPrismaClient, fetchRepliesMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("createReplyHandler()", () => {
		test("Failure - unauthorised", async () => {
			await createReplyHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as SendReplyRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.cheetId = "mockcheetid";

			prismaMock.$transaction.mockResolvedValue({
				uuid: "mockreplyid",
			});

			await createReplyHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as SendReplyRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(201);
			expect(mockRes.json).toHaveBeenCalledWith({
				uuid: "mockreplyid",
			});
		});
		test("Failure - database error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.cheetId = "mockcheetid";

			prismaMock.$transaction = vi.fn().mockRejectedValue(new Error("DB exploded"));
			await createReplyHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as SendReplyRequest,
				mockRes as unknown as Response,
				mockNext
			);

			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("updateReplyHandler()", () => {
		test("Failure - unauthorised", async () => {
			await updateReplyHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditReplyRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.replyId = "mockreplyid";
			mockReq.body = { text: "Edited mock reply" };

			prismaMock.reply.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockreplyid",
				text: "Mock Reply",
				user: { uuid: "mockuserid" },
			});
			prismaMock.reply.update.mockResolvedValueOnce({
				uuid: "mockreplyid",
			});
			await updateReplyHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditReplyRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ uuid: "mockreplyid" });
		});
		test("Success - reply text unchanged", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.replyId = "mockreplyid";
			mockReq.body = { text: "Mock Reply" };

			prismaMock.reply.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockreplyid",
				text: "Mock Reply",
				user: { uuid: "mockuserid" },
			});
			await updateReplyHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditReplyRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				uuid: "mockreplyid",
				text: "Mock Reply",
				user: { uuid: "mockuserid" },
			});
		});
		test("Failure - invalid target reply ID", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.reply.findUniqueOrThrow.mockRejectedValueOnce(new Error("Reply not found"));
			await updateReplyHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditReplyRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - reply doesn't belong to user", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.reply.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockreplyid",
				user: { uuid: "mockuseridother" },
			});
			await updateReplyHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditReplyRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot update someone else's reply."] });
		});
		test("Failure - database error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.reply.findUniqueOrThrow.mockRejectedValueOnce(new Error("DB Error"));
			await updateReplyHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditReplyRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("deleteReplyHandler()", () => {
		test("Failure - unauthorised", async () => {
			await deleteReplyHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.replyId = "mockreplyid";
			prismaMock.reply.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockreply",
				user: { uuid: "mockuserid" },
			});
			prismaMock.reply.delete.mockResolvedValueOnce(undefined);
			await deleteReplyHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
		});
		test("Failure - invalid target reply ID", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.reply.findUniqueOrThrow.mockRejectedValueOnce(new Error("Reply not found"));
			await deleteReplyHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - cheet doesn't belong to user", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.reply.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockreplyid",
				user: { uuid: "mockuseridother" },
			});
			await deleteReplyHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot delete someone else's reply."] });
		});
		test("Failure - database error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.reply.findUniqueOrThrow.mockRejectedValueOnce(new Error("DB Error"));
			await deleteReplyHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditReplyRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
