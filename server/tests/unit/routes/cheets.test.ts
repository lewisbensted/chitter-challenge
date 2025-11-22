import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../../../src/utils/sendErrorResponse", () => ({
	sendErrorResponse: vi.fn(),
}));
vi.mock("../../../src/utils/logError", () => ({
	logError: vi.fn(),
}));

import {
	getCheetHandler,
	FetchCheetsType,
	postCheetHandler,
	putCheetHandler,
	deleteCheetHandler,
} from "../../../src/routes/cheets";
import { createMockRes } from "../../test-utils/createMockRes";
import { Request, Response } from "express";
import { sendErrorResponse } from "../../../src/utils/sendErrorResponse";
import { logError } from "../../../src/utils/logError";
import { prismaMock } from "../../test-utils/prismaMock";
import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { EditCheetRequest } from "../../../types/requests";

describe("Cheets - unit tests", () => {
	let mockReq: MockRequest;
	let mockRes: Response;
	beforeEach(() => {
		mockReq = createMockReq();
		mockRes = createMockRes();
	});
	describe("Fetch cheets at route: [GET] /cheets", () => {
		let fetchCheetsMock: FetchCheetsType;
		beforeEach(() => {
			fetchCheetsMock = vi.fn().mockResolvedValue({ cheets: [], hasNext: false });
		});
		afterEach(() => {
			vi.clearAllMocks();
		});
		test("No filters provided", async () => {
			await getCheetHandler(prismaMock, fetchCheetsMock)(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ cheets: [], hasNext: false });
			expect(fetchCheetsMock).toHaveBeenCalledWith(prismaMock, 10, undefined, undefined, undefined);
		});
		test("userId provided", async () => {
			mockReq.params.userId = "mockuseruuid";
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockuseruuid" });
			await getCheetHandler(prismaMock, fetchCheetsMock)(mockReq, mockRes);
			expect(fetchCheetsMock).toHaveBeenCalledWith(prismaMock, 10, undefined, "mockuseruuid", undefined);
		});
		test("sessionId provided", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			await getCheetHandler(prismaMock, fetchCheetsMock)(mockReq, mockRes);
			expect(fetchCheetsMock).toHaveBeenCalledWith(prismaMock, 10, "mockuseruuid", undefined, undefined);
		});
		test("Invalid take provide", async () => {
			mockReq.query.take = "invalid";
			await getCheetHandler(prismaMock, fetchCheetsMock)(mockReq, mockRes);
			expect(fetchCheetsMock).toHaveBeenCalledWith(prismaMock, 10, undefined, undefined, undefined);
		});
		test("Take clamped at max value", async () => {
			mockReq.query.take = String(100);
			await getCheetHandler(prismaMock, fetchCheetsMock)(mockReq, mockRes);
			expect(fetchCheetsMock).toHaveBeenCalledWith(prismaMock, 50, undefined, undefined, undefined);
		});
		test("Invalid cursor provided", async () => {
			mockReq.query.cursor = "invalid";
			prismaMock.cheet.findUnique.mockResolvedValueOnce(null);
			await getCheetHandler(prismaMock, fetchCheetsMock)(mockReq, mockRes);
			expect(fetchCheetsMock).toHaveBeenCalledWith(prismaMock, 10, undefined, undefined, undefined);
		});
		test("Invalid userId provided", async () => {
			mockReq.params.userId = "mockuseruuid";
			prismaMock.user.findUniqueOrThrow.mockRejectedValueOnce(new Error("User not found"));
			await getCheetHandler(prismaMock, fetchCheetsMock)(mockReq, mockRes);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("Send cheet at route: [POST] /cheets", () => {
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };

			prismaMock.$transaction.mockResolvedValue({
				uuid: "mockcheetuuid",
				cheetStatus: { hasReplies: false },
			});

			await postCheetHandler(prismaMock)(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(201);
			expect(mockRes.json).toHaveBeenCalledWith({
				uuid: "mockcheetuuid",
				cheetStatus: { hasReplies: false },
			});
		});
		test("Failure", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			prismaMock.$transaction = vi.fn().mockRejectedValue(new Error("DB exploded"));
			await postCheetHandler(prismaMock)(mockReq, mockRes);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("Edit cheet at route [PUT] /cheets", () => {
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			mockReq.body = { text: "Edited mock cheet" };
			
			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockcheet",
				text: "Mock cheet",
				cheetStatus: { hasReplies: false },
				user: { uuid: "mockuseruuid" },
				createdAt: new Date(Date.now() - 60 * 1000),
			});
			prismaMock.cheet.update.mockResolvedValueOnce({
				uuid: "mockcheet",
			});
			await putCheetHandler(prismaMock)(mockReq as EditCheetRequest, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ uuid: "mockcheet" });
		});
		test("Success - cheet text unchanged", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			mockReq.body = { text: "Mock cheet" };
			const date = Date.now()
			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockcheet",
				text: "Mock cheet",
				cheetStatus: { hasReplies: false },
				user: { uuid: "mockuseruuid" },
				createdAt: new Date(date - 60 * 1000),
			});
			await putCheetHandler(prismaMock)(mockReq as EditCheetRequest, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				uuid: "mockcheet",
				text: "Mock cheet",
				cheetStatus: { hasReplies: false },
				user: { uuid: "mockuseruuid" },
				createdAt: new Date(date - 60 * 1000),
			});
		});
		test("Failure - invalid target cheet ID", async () => {
			prismaMock.cheet.findUniqueOrThrow.mockRejectedValueOnce(new Error("Cheet not found"));
			await putCheetHandler(prismaMock)(mockReq as EditCheetRequest, mockRes);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - cheet doesn't belong to user", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockcheetuuid",
				user: { uuid: "mockuseruuidother" },
			});
			await putCheetHandler(prismaMock)(mockReq as EditCheetRequest, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot update someone else's cheet."] });
		});
		test("Failure - cheet not recent enough to edit", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockcheet",
				cheetStatus: { hasReplies: false },
				user: { uuid: "mockuseruuid" },
				createdAt: new Date(Date.now() - 60 * 61 * 1000),
			});
			await putCheetHandler(prismaMock)(mockReq as EditCheetRequest, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cheet cannot be updated (time limit exceeded)."] });
		});
		test("Failure - cheet has replies", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockcheet",
				user: { uuid: "mockuseruuid" },
				cheetStatus: { hasReplies: true },
				createdAt: new Date(Date.now() - 60 * 1000),
			});
			await putCheetHandler(prismaMock)(mockReq as EditCheetRequest, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot update a cheet with replies."] });
		});
	});
	describe("Delete cheet at route [DELETE] /cheets", () => {
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockcheet",
				user: { uuid: "mockuseruuid" },
			});
			prismaMock.cheet.delete.mockResolvedValueOnce(undefined);
			await deleteCheetHandler(prismaMock)(mockReq, mockRes);
			expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
		});
		test("Failure - invalid target cheet ID", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			prismaMock.cheet.findUniqueOrThrow.mockRejectedValueOnce(new Error("Cheet not found"));
			await deleteCheetHandler(prismaMock)(mockReq, mockRes);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - cheet doesn't belong to user", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockcheet", user: { uuid: "mockuser" } });

			await deleteCheetHandler(prismaMock)(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot delete someone else's cheet."] });
		});
	});
});
