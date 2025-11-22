import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../../../src/utils/sendErrorResponse", () => ({
	sendErrorResponse: vi.fn(),
}));
vi.mock("../../../src/utils/logError", () => ({
	logError: vi.fn(),
}));

import { getReplyHandler, FetchRepliesType, postReplyHandler } from "../../../src/routes/replies";
import { prismaMock } from "../../test-utils/prismaMock";
import { createMockRes } from "../../test-utils/createMockRes";
import { Request } from "express";
import { createMockReq } from "../../test-utils/createMockReq";
import { sendErrorResponse } from "../../../src/utils/sendErrorResponse";
import { logError } from "../../../src/utils/logError";
import { SendReplyRequest } from "../../../types/requests";

describe("Replies - unit test", () => {
	describe("Fetch replies at route: [GET] /replies", () => {
		let fetchRepliesMock: FetchRepliesType;
		beforeEach(() => {
			fetchRepliesMock = vi.fn().mockResolvedValue({ replies: [], hasNext: false });
		});
		afterEach(() => {
			vi.clearAllMocks();
		});
		test("Success", async () => {
			const mockReq = createMockReq();
			const mockRes = createMockRes();

			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockcheet" });
			await getReplyHandler(prismaMock, fetchRepliesMock)(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ replies: [], hasNext: false });
			expect(fetchRepliesMock).toHaveBeenCalledWith(prismaMock, 10, "mockcheet", undefined);
		});
		test("Failure - invalid cheet ID", async () => {
			const mockReq = createMockReq();
			const mockRes = createMockRes();

			prismaMock.cheet.findUniqueOrThrow.mockRejectedValueOnce(new Error("Invalid cheet"));
			await getReplyHandler(prismaMock, fetchRepliesMock)(mockReq, mockRes);

			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - invalid take provided", async () => {
			const mockReq = createMockReq();
			const mockRes = createMockRes();
			mockReq.query.take = "invalidtake";

			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockcheet" });
			await getReplyHandler(prismaMock, fetchRepliesMock)(mockReq, mockRes);
			expect(fetchRepliesMock).toHaveBeenCalledWith(prismaMock, 10, "mockcheet", undefined);
		});
		test("Success - take clamped at max value", async () => {
			const mockReq = createMockReq();
			const mockRes = createMockRes();
			mockReq.query.take = String(100);

			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockcheet" });
			await getReplyHandler(prismaMock, fetchRepliesMock)(mockReq, mockRes);
			expect(fetchRepliesMock).toHaveBeenCalledWith(prismaMock, 50, "mockcheet", undefined);
		});
		test("Success - invalid cursor provided", async () => {
			const mockReq = createMockReq();
			const mockRes = createMockRes();
			mockReq.query.cursor = "invalidcursor";

			prismaMock.cheet.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockcheet" });
			await getReplyHandler(prismaMock, fetchRepliesMock)(mockReq, mockRes);
			expect(fetchRepliesMock).toHaveBeenCalledWith(prismaMock, 10, "mockcheet", undefined);
		});
	});
	describe("Post replies at route: [POST] /replies", () => {
		test("Success", async () => {
			const mockReq = createMockReq() as SendReplyRequest;
			const mockRes = createMockRes();
			mockReq.params.cheetId = 'mockcheetid'

			prismaMock.$transaction.mockResolvedValue({
				uuid: "mockreply",
			});

			await postReplyHandler(prismaMock)(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(201);
			expect(mockRes.json).toHaveBeenCalledWith({
				uuid: "mockreply",
			});
		});
		test("Failure", async () => {
			const mockReq = createMockReq() as SendReplyRequest;
			const mockRes = createMockRes();

			prismaMock.$transaction = vi.fn().mockRejectedValue(new Error("DB exploded"));
			await postReplyHandler(prismaMock)(mockReq, mockRes);

			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("Edit replies at route [PUT] /replies", () => {
		test("Success", async () => {
			expect(true).toBe(false);
		});
		test("Success - unchanged", async () => {
			expect(true).toBe(false);
		});
		test("Failure - invalid target reply", async () => {
			expect(true).toBe(false);
		});
		test("Failure - cheet doesn't belong to user", async () => {
			expect(true).toBe(false);
		});
	});
	describe("Delete replies at route [DELETE] /replies", () => {
		test("Success", async () => {
			expect(true).toBe(false);
		});
		test("Failure - invalid target reply", async () => {
			expect(true).toBe(false);
		});
		test("Failure - cheet doesn't belong to user", async () => {
			expect(true).toBe(false);
		});
	});
});
