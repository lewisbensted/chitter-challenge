import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
	getCheetsHandler,
	createCheetHandler,
	updateCheetHandler,
	deleteCheetHandler,
} from "../../../src/routes/cheets";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { Response, Request } from "express";
import { prismaMock } from "../../test-utils/prismaMock";
import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { EditCheetRequest, SendCheetRequest } from "../../../types/requests";
import { ExtendedPrismaClient } from "../../../prisma/prismaClient";
import { mockNext } from "../../test-utils/mockNext";

describe("Unit test - Cheet handlers", () => {
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
	describe("getCheetsHandler()", () => {
		let fetchCheetsMock: ReturnType<typeof vi.fn>;
		beforeEach(() => {
			fetchCheetsMock = vi.fn().mockResolvedValue({ cheets: [], hasNext: false });
		});
		afterEach(() => {
			vi.clearAllMocks();
		});
		test("No user filters provided", async () => {
			mockReq.query.take = String(20);
			mockReq.query.cursor = "valid";
			prismaMock.cheet.findUnique.mockResolvedValueOnce({ uuid: "valid" });
			await getCheetsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchCheetsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ cheets: [], hasNext: false });
			expect(fetchCheetsMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				20,
				undefined,
				undefined,
				"valid"
			);
		});
		test("userId provided", async () => {
			mockReq.params.userId = "mockuserid";
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockuserid" });
			await getCheetsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchCheetsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchCheetsMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				10,
				undefined,
				"mockuserid",
				undefined
			);
		});
		test("sessionId provided", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			await getCheetsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchCheetsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchCheetsMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				10,
				"mockuserid",
				undefined,
				undefined
			);
		});
		test("Invalid take provide", async () => {
			mockReq.query.take = "invalid";
			await getCheetsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchCheetsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchCheetsMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				10,
				undefined,
				undefined,
				undefined
			);
		});
		test("Take clamped at max value", async () => {
			mockReq.query.take = String(100);
			await getCheetsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchCheetsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchCheetsMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				50,
				undefined,
				undefined,
				undefined
			);
		});
		test("Invalid cursor provided", async () => {
			mockReq.query.cursor = "invalid";
			prismaMock.cheet.findUnique.mockResolvedValueOnce(null);
			await getCheetsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchCheetsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchCheetsMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				10,
				undefined,
				undefined,
				undefined
			);
		});
		test("Failure - invalid userId provided", async () => {
			mockReq.params.userId = "mockuserid";
			prismaMock.user.findUniqueOrThrow.mockRejectedValueOnce(new Error("User not found"));
			await getCheetsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchCheetsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - fetchCheets() error", async () => {
			fetchCheetsMock.mockRejectedValueOnce(new Error("Fetch Error"));
			await getCheetsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchCheetsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("createCheetHandler()", () => {
		test("Failure - unauthorised", async () => {
			await createCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as SendCheetRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };

			prismaMock.$transaction.mockResolvedValue({
				uuid: "mockcheetuuid",
				cheetStatus: { hasReplies: false },
			});

			await createCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as SendCheetRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(201);
			expect(mockRes.json).toHaveBeenCalledWith({
				uuid: "mockcheetuuid",
				cheetStatus: { hasReplies: false },
			});
		});
		test("Failure - database error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.$transaction = vi.fn().mockRejectedValue(new Error("DB exploded"));
			await createCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as SendCheetRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("updateCheetHandler()", () => {
		test("Failure - unauthorised", async () => {
			await updateCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditCheetRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.body = { text: "Edited mock cheet" };
			mockReq.params.cheetId = "mockcheetuuid";

			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockcheetuuid",
				text: "Mock cheet",
				cheetStatus: { hasReplies: false },
				user: { uuid: "mockuserid" },
				createdAt: new Date(Date.now() - 60 * 1000),
			});
			prismaMock.cheet.update.mockResolvedValueOnce({
				uuid: "mockcheetuuid",
			});
			await updateCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditCheetRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ uuid: "mockcheetuuid" });
		});
		test("Success - cheet text unchanged", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.body = { text: "Mock cheet" };
			mockReq.params.cheetId = "mockcheetuuid";

			const date = Date.now();
			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockcheet",
				text: "Mock cheet",
				cheetStatus: { hasReplies: false },
				user: { uuid: "mockuserid" },
				createdAt: new Date(date - 60 * 1000),
			});
			await updateCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditCheetRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				uuid: "mockcheet",
				text: "Mock cheet",
				cheetStatus: { hasReplies: false },
				user: { uuid: "mockuserid" },
				createdAt: new Date(date - 60 * 1000),
			});
		});
		test("Failure - invalid target cheet ID", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.cheetId = "mockcheetuuid";
			prismaMock.cheet.findUniqueOrThrow.mockRejectedValueOnce(new Error("Cheet not found"));
			await updateCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditCheetRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - cheet doesn't belong to user", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.cheetId = "mockcheetuuid";
			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockcheetuuid",
				user: { uuid: "mockuseridother" },
			});
			await updateCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditCheetRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot update someone else's cheet."] });
		});
		test("Failure - cheet not recent enough to edit", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.cheetId = "mockcheetuuid";
			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockcheet",
				cheetStatus: { hasReplies: false },
				user: { uuid: "mockuserid" },
				createdAt: new Date(Date.now() - 60 * 61 * 1000),
			});
			await updateCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditCheetRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cheet cannot be updated (time limit exceeded)."] });
		});
		test("Failure - cheet has replies", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.cheetId = "mockcheetuuid";
			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockcheet",
				user: { uuid: "mockuserid" },
				cheetStatus: { hasReplies: true },
				createdAt: new Date(Date.now() - 60 * 1000),
			});
			await updateCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditCheetRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot update a cheet with replies."] });
		});
		test("Failure - database error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.cheetId = "mockcheetuuid";
			prismaMock.cheet.findUniqueOrThrow.mockRejectedValueOnce(new Error("DB Error"));
			await updateCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditCheetRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("deleteCheetHandler()", () => {
		test("Failure - unauthorised", async () => {
			await deleteCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditCheetRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.cheetId = "mockcheetuuid";
			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockcheet",
				user: { uuid: "mockuserid" },
			});
			prismaMock.cheet.delete.mockResolvedValueOnce(undefined);
			await deleteCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
		});
		test("Failure - invalid target cheet ID", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.cheetId = "mockcheetuuid";
			prismaMock.cheet.findUniqueOrThrow.mockRejectedValueOnce(new Error("Cheet not found"));
			await deleteCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - cheet doesn't belong to user", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.cheetId = "mockcheetuuid";
			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockcheet", user: { uuid: "mockuser" } });

			await deleteCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot delete someone else's cheet."] });
		});
		test("Failure - database error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.cheetId = "mockcheetuuid";
			prismaMock.cheet.findUniqueOrThrow.mockRejectedValueOnce(new Error("DB Error"));
			await deleteCheetHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditCheetRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
