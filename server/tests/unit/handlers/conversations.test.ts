import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { prismaMock } from "../../test-utils/prismaMock";
import { getConversationsHandler, getUnreadHandler } from "../../../src/routes/conversations";
import { Request, Response } from "express";
import { ExtendedPrismaClient } from "../../../prisma/prismaClient";
import { mockNext } from "../../test-utils/mockNext";

describe("Unit test - Conversation handlers", () => {
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
	describe("getUnreadHandler()", () => {
		test("Failure - unauthorised", async () => {
			await getUnreadHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("No unread messages", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.conversation.findFirst.mockResolvedValueOnce(null);
			await getUnreadHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith(false);
		});
		test("Unread messages", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.conversation.findFirst.mockResolvedValueOnce({ key: "test-key" });
			await getUnreadHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith(true);
		});
		test("Failure - database error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.conversation.findFirst.mockRejectedValueOnce(new Error("DB Error"));
			await getUnreadHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("getConversationsHandler()", () => {
		let fetchConversationsMock: ReturnType<typeof vi.fn>;
		beforeEach(() => {
			fetchConversationsMock = vi.fn().mockResolvedValue({ conversations: [], hasNext: false });
		});
		afterEach(() => {
			vi.clearAllMocks();
		});
		test("Unauthorised", async () => {
			await getConversationsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchConversationsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("No user IDs provided", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.take = String(20);
			mockReq.query.cursor = "valid";
			prismaMock.conversation.findUnique.mockResolvedValueOnce({ key: "valid" });
			await getConversationsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchConversationsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ conversations: [], hasNext: false });
			expect(fetchConversationsMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				20,
				"mockuserid",
				undefined,
				"valid"
			);
		});
		test("Empty user IDs string", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.userIds = "";
			await getConversationsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchConversationsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ conversations: [], hasNext: false });
			expect(fetchConversationsMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				10,
				"mockuserid",
				[],
				undefined
			);
		});
		test("Valid user ID string", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.userIds = "abc,def,geh";
			await getConversationsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchConversationsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ conversations: [], hasNext: false });
			expect(fetchConversationsMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				10,
				"mockuserid",
				["abc", "def", "geh"],
				undefined
			);
		});
		test("Multiple commas in user ID string", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.userIds = "abc,,def, ,geh";
			await getConversationsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchConversationsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ conversations: [], hasNext: false });
			expect(fetchConversationsMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				10,
				"mockuserid",
				["abc", "def", "geh"],
				undefined
			);
		});
		test("Invalid take provide", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.take = "invalid";
			await getConversationsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchConversationsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchConversationsMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				10,
				"mockuserid",
				undefined,
				undefined
			);
		});
		test("Take clamped at max value", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.take = String(100);
			await getConversationsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchConversationsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchConversationsMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				50,
				"mockuserid",
				undefined,
				undefined
			);
		});
		test("Invalid cursor provided", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.take = String(100);
			mockReq.query.cursor = "invalid";
			prismaMock.conversation.findUnique.mockResolvedValueOnce(null);
			await getConversationsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchConversationsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchConversationsMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				50,
				"mockuserid",
				undefined,
				undefined
			);
		});
		test("Failure - fetchConversations() error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			fetchConversationsMock = vi.fn().mockRejectedValueOnce(new Error("Fetch Error"));
			await getConversationsHandler(prismaMock as unknown as ExtendedPrismaClient, fetchConversationsMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
