import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../../../src/utils/sendErrorResponse", () => ({
	sendErrorResponse: vi.fn(),
}));
vi.mock("../../../src/utils/logError", () => ({
	logError: vi.fn(),
}));

import {
	getRepliesHandler,
	createReplyHandler,
	updateReplyHandler,
	deleteReplyHandler,
} from "../../../src/routes/replies";
import { prismaMock } from "../../test-utils/prismaMock";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { sendErrorResponse } from "../../../src/utils/sendErrorResponse";
import { logError } from "../../../src/utils/logError";
import { EditReplyRequest, SendReplyRequest } from "../../../types/requests";
import { Response, Request } from "express";

describe("Reply handlers", () => {
	beforeAll(() => {
		vi.spyOn(console, "error").mockImplementation(() => {});
	});
	let mockReq: MockRequest;
	let mockRes: MockResponse;
	beforeEach(() => {
		mockReq = createMockReq();
		mockRes = createMockRes();
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	describe("getRepliesHandler() function", () => {
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
			await getRepliesHandler(prismaMock, fetchRepliesMock)(mockReq as Request, mockRes as unknown as Response);
			expect(fetchRepliesMock).toHaveBeenCalledWith(prismaMock, 20, "mockcheet", "valid");
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ replies: [], hasNext: false });
		});
		test("Failure - invalid cheet ID", async () => {
			mockReq.params.cheetId = "mockcheetid";
			prismaMock.cheet.findUniqueOrThrow.mockRejectedValueOnce(new Error("Invalid cheet"));
			await getRepliesHandler(prismaMock, fetchRepliesMock)(mockReq as Request, mockRes as unknown as Response);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - invalid take provided", async () => {
			mockReq.params.cheetId = "mockcheetid";
			mockReq.query.take = "invalidtake";

			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockcheet" });
			await getRepliesHandler(prismaMock, fetchRepliesMock)(mockReq as Request, mockRes as unknown as Response);
			expect(fetchRepliesMock).toHaveBeenCalledWith(prismaMock, 10, "mockcheet", undefined);
		});
		test("Success - take clamped at max value", async () => {
			mockReq.params.cheetId = "mockcheetid";
			mockReq.query.take = String(100);

			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockcheet" });
			await getRepliesHandler(prismaMock, fetchRepliesMock)(mockReq as Request, mockRes as unknown as Response);
			expect(fetchRepliesMock).toHaveBeenCalledWith(prismaMock, 50, "mockcheet", undefined);
		});
		test("Success - invalid cursor provided", async () => {
			mockReq.params.cheetId = "mockcheetid";
			mockReq.query.cursor = "invalidcursor";

			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockcheet" });
			prismaMock.reply.findUnique.mockResolvedValueOnce(null);
			await getRepliesHandler(prismaMock, fetchRepliesMock)(mockReq as Request, mockRes as unknown as Response);
			expect(fetchRepliesMock).toHaveBeenCalledWith(prismaMock, 10, "mockcheet", undefined);
		});
	});
	describe("createReplyHandler() function", () => {
		test("Unauthorised", async () => {
			await createReplyHandler(prismaMock)(mockReq as SendReplyRequest, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.cheetId = "mockcheetid";

			prismaMock.$transaction.mockResolvedValue({
				uuid: "mockreply",
			});

			await createReplyHandler(prismaMock)(mockReq as SendReplyRequest, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(201);
			expect(mockRes.json).toHaveBeenCalledWith({
				uuid: "mockreply",
			});
		});
		test("Failure", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.cheetId = "mockcheetid";

			prismaMock.$transaction = vi.fn().mockRejectedValue(new Error("DB exploded"));
			await createReplyHandler(prismaMock)(mockReq as SendReplyRequest, mockRes as unknown as Response);

			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("updateReplyHandler() function", () => {
		test("Unauthorised", async () => {
			await updateReplyHandler(prismaMock)(mockReq as EditReplyRequest, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.replyId = "mockreplyuuid";
			mockReq.body = { text: "Edited mock reply" };

			prismaMock.reply.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockreplyuuid",
				text: "Mock Reply",
				user: { uuid: "mockuserid" },
			});
			prismaMock.reply.update.mockResolvedValueOnce({
				uuid: "mockreplyuuid",
			});
			await updateReplyHandler(prismaMock)(mockReq as EditReplyRequest, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ uuid: "mockreplyuuid" });
		});
		test("Success - unchanged", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.replyId = "mockreplyuuid";
			mockReq.body = { text: "Mock Reply" };

			prismaMock.reply.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockreplyuuid",
				text: "Mock Reply",
				user: { uuid: "mockuserid" },
			});
			await updateReplyHandler(prismaMock)(mockReq as EditReplyRequest, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				uuid: "mockreplyuuid",
				text: "Mock Reply",
				user: { uuid: "mockuserid" },
			});
		});
		test("Failure - invalid target reply ID", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.reply.findUniqueOrThrow.mockRejectedValueOnce(new Error("Reply not found"));
			await updateReplyHandler(prismaMock)(mockReq as EditReplyRequest, mockRes as unknown as Response);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - cheet doesn't belong to user", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.reply.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockreplyuuid",
				user: { uuid: "mockuseridother" },
			});
			await updateReplyHandler(prismaMock)(mockReq as EditReplyRequest, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot update someone else's reply."] });
		});
	});
	describe("deleteReplyHandler() function", () => {
		test("Unauthorised", async () => {
			await deleteReplyHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.replyId = "mockreplyuuid";
			prismaMock.reply.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockreply",
				user: { uuid: "mockuserid" },
			});
			prismaMock.reply.delete.mockResolvedValueOnce(undefined);
			await deleteReplyHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
		});
		test("Failure - invalid target reply ID", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.reply.findUniqueOrThrow.mockRejectedValueOnce(new Error("Reply not found"));
			await deleteReplyHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - cheet doesn't belong to user", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.reply.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockreplyuuid",
				user: { uuid: "mockuseridother" },
			});
			await deleteReplyHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot delete someone else's reply."] });
		});
	});
});
