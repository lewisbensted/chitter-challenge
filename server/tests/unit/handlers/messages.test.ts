import { afterEach, beforeEach, describe, expect, Mock, test, vi } from "vitest";

vi.mock("../../../src/utils/generateConversationKey", () => ({
	generateConversationKey: vi.fn(() => "test-key"),
}));
vi.mock("../../../src/utils/readMessages", () => ({
	readMessages: vi.fn(),
}));
vi.mock("../../../prisma/services/messageStatus", () => ({
	softDeleteMessageStatus: vi.fn(),
}));

import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { prismaMock } from "../../test-utils/prismaMock";
import {
	deleteMessageHandler,
	updateMessageHandler,
	getMessagesHandler,
	postMessageHandler,
	readMessagesHandler,
} from "../../../src/routes/messages";
import { EditMessageRequest, SendMessageRequest } from "../../../types/requests";
import { generateConversationKey } from "../../../src/utils/generateConversationKey";
import { readMessages } from "../../../src/utils/readMessages";
import { Response, Request } from "express";
import { ExtendedPrismaClient } from "../../../prisma/prismaClient";
import { mockNext } from "../../test-utils/mockNext";
import { Prisma } from "@prisma/client";
import { softDeleteMessageStatus } from "../../../prisma/services/messageStatus";

describe("Unit tests - Message handlers", () => {
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
	describe("getMessagesHandler()", () => {
		let fetchMessagesMock: ReturnType<typeof vi.fn>;
		beforeEach(() => {
			fetchMessagesMock = vi.fn().mockResolvedValue({
				messages: [],
				hasNext: false,
			});
		});
		afterEach(() => {
			vi.clearAllMocks();
		});
		test("Failure - unauthorised", async () => {
			await getMessagesHandler(prismaMock as unknown as ExtendedPrismaClient, fetchMessagesMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.take = String(20);
			mockReq.query.cursor = "valid";
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockrecipientid" });
			prismaMock.message.findUnique.mockResolvedValueOnce({ uuid: "valid" });
			await getMessagesHandler(prismaMock as unknown as ExtendedPrismaClient, fetchMessagesMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				messages: [],
				hasNext: false,
			});
			expect(fetchMessagesMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				20,
				"mockuserid",
				"mockrecipientid",
				"valid"
			);
		});
		test("Failure - invalid recipient ID provided", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.user.findUniqueOrThrow.mockRejectedValueOnce(new Error("Recipient not found"));
			await getMessagesHandler(prismaMock as unknown as ExtendedPrismaClient, fetchMessagesMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Invalid take provided", async () => {
			mockReq.query.take = "invalid";
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockrecipientid" });
			await getMessagesHandler(prismaMock as unknown as ExtendedPrismaClient, fetchMessagesMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchMessagesMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				10,
				"mockuserid",
				"mockrecipientid",
				undefined
			);
		});
		test("Take clamped at max value", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.take = String(100);
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockrecipientid" });
			await getMessagesHandler(prismaMock as unknown as ExtendedPrismaClient, fetchMessagesMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchMessagesMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				50,
				"mockuserid",
				"mockrecipientid",
				undefined
			);
		});
		test("Invalid cursor provided", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.cursor = "invalid";
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockrecipientid" });
			prismaMock.message.findUnique.mockResolvedValueOnce(null);
			await getMessagesHandler(prismaMock as unknown as ExtendedPrismaClient, fetchMessagesMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(fetchMessagesMock).toHaveBeenCalledWith(
				prismaMock as unknown as ExtendedPrismaClient,
				10,
				"mockuserid",
				"mockrecipientid",
				undefined
			);
		});
		test("Failure - fetchMessages() error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockrecipientid" });
			fetchMessagesMock.mockRejectedValueOnce(new Error("Fetch Error"));
			await getMessagesHandler(prismaMock as unknown as ExtendedPrismaClient, fetchMessagesMock)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("readMessagesHandler()", () => {
		test("Failure - unauthorised", async () => {
			await readMessagesHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("No messages updated", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			(readMessages as Mock).mockResolvedValueOnce(0);
			const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(vi.fn());
			await readMessagesHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(consoleWarnSpy).toHaveBeenCalledWith("No messages marked as read");
			expect(mockRes.sendStatus).toHaveBeenCalledWith(200);
		});
		test("Messages updated", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			(readMessages as Mock).mockResolvedValueOnce(5);
			const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(vi.fn());
			await readMessagesHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(consoleWarnSpy).not.toHaveBeenCalled();
			expect(mockRes.sendStatus).toHaveBeenCalledWith(200);
		});
		test("Failure - readMessages() error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			(readMessages as Mock).mockRejectedValueOnce(new Error("Read Error"));
			await readMessagesHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});

	describe("postMessageHandler()", () => {
		beforeEach(() => {
			prismaMock.$transaction.mockImplementationOnce(
				async (cb: (transaction: typeof prismaMock) => Promise<unknown>) => cb(prismaMock)
			);
		});
		test("Failure - unauthorised", async () => {
			await postMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as SendMessageRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success - self message", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.body = { text: "Mock message" };

			prismaMock.message.create.mockResolvedValueOnce({
				uuid: "mockmessageid",
				sender: { uuid: "mockuserid" },
				recipient: { uuid: "mockuserid" },
			});
			prismaMock.messageStatus.create.mockResolvedValueOnce({
				isRead: false,
			});
			await postMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as SendMessageRequest,
				mockRes as unknown as Response,
				mockNext
			);
			const upsertCall = prismaMock.conversation.upsert.mock.calls[0][0] as Prisma.ConversationUpsertArgs;
			expect(upsertCall.update).toEqual({ latestMessageId: "mockmessageid" });
			expect(upsertCall.create).toEqual({
				user1Id: "mockuserid",
				user2Id: "mockuserid",
				latestMessageId: "mockmessageid",
				key: "test-key",
			});
			expect(generateConversationKey).toHaveBeenCalledWith("mockuserid", "mockuserid");
			expect(mockRes.status).toHaveBeenCalledWith(201);
			expect(mockRes.json).toHaveBeenCalledWith({
				messageStatus: {
					isRead: false,
				},
				recipient: {
					uuid: "mockuserid",
				},
				sender: {
					uuid: "mockuserid",
				},
				uuid: "mockmessageid",
			});
		});
		test("Success - first user is sender", async () => {
			mockReq.session.user = { uuid: "a-mocksenderid" };
			mockReq.body = { text: "Mock message" };

			prismaMock.message.create.mockResolvedValueOnce({
				uuid: "mockmessageid",
				sender: { uuid: "a-mocksenderid" },
				recipient: { uuid: "b-mockrecipientid" },
			});
			prismaMock.messageStatus.create.mockResolvedValueOnce({
				isRead: false,
			});
			await postMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as SendMessageRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(generateConversationKey).toHaveBeenCalledWith("a-mocksenderid", "b-mockrecipientid");
			expect(prismaMock.conversation.upsert).toHaveBeenCalledWith(
				expect.objectContaining({
					update: expect.objectContaining({ user2Unread: true, latestMessageId: "mockmessageid" }),
					create: expect.objectContaining({
						user1Id: "a-mocksenderid",
						user2Id: "b-mockrecipientid",
						latestMessageId: "mockmessageid",
						user2Unread: true,
					}),
				})
			);
			expect(mockRes.status).toHaveBeenCalledWith(201);
			expect(mockRes.json).toHaveBeenCalledWith({
				messageStatus: {
					isRead: false,
				},
				recipient: {
					uuid: "b-mockrecipientid",
				},
				sender: {
					uuid: "a-mocksenderid",
				},
				uuid: "mockmessageid",
			});
		});
		test("Success - second user is sender", async () => {
			mockReq.session.user = { uuid: "b-mocksenderid" };
			mockReq.body = { text: "Mock message" };
			prismaMock.$transaction.mockImplementationOnce(
				async (cb: (transaction: typeof prismaMock) => Promise<unknown>) => cb(prismaMock)
			);
			prismaMock.message.create.mockResolvedValueOnce({
				uuid: "mockmessageid",
				sender: { uuid: "b-mocksenderid" },
				recipient: { uuid: "a-mockrecipientid" },
			});
			prismaMock.messageStatus.create.mockResolvedValueOnce({
				isRead: false,
			});
			await postMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as SendMessageRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(generateConversationKey).toHaveBeenCalledWith("a-mockrecipientid", "b-mocksenderid");
			expect(prismaMock.conversation.upsert).toHaveBeenCalledWith(
				expect.objectContaining({
					update: expect.objectContaining({ user1Unread: true, latestMessageId: "mockmessageid" }),
					create: expect.objectContaining({
						user1Id: "a-mockrecipientid",
						user2Id: "b-mocksenderid",
						latestMessageId: "mockmessageid",
						user1Unread: true,
					}),
				})
			);
			expect(mockRes.status).toHaveBeenCalledWith(201);
			expect(mockRes.json).toHaveBeenCalledWith({
				messageStatus: {
					isRead: false,
				},
				recipient: {
					uuid: "a-mockrecipientid",
				},
				sender: {
					uuid: "b-mocksenderid",
				},
				uuid: "mockmessageid",
			});
		});
		test("Failure - database error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.$transaction.mockRejectedValueOnce(new Error("DB Error"));
			await postMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as SendMessageRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("updateMessageHandler()", () => {
		test("Failure - unauthorised", async () => {
			await updateMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditMessageRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.messageId = "mockmessageid";
			mockReq.body = { text: "Mock message" };
			prismaMock.message.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockmessageid",
				sender: { uuid: "mockuserid" },
				text: "Mock message other",
				messageStatus: { isRead: false, isDeleted: false },
			});
			prismaMock.message.update.mockResolvedValueOnce({ uuid: "mockmessageid", text: "Mock message" });
			await updateMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditMessageRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ uuid: "mockmessageid", text: "Mock message" });
		});
		test("Success - message text unchanged", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.messageId = "mockmessageid";
			mockReq.body = { text: "Mock message" };
			prismaMock.message.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockmessageid",
				sender: { uuid: "mockuserid" },
				text: "Mock message",
				messageStatus: { isRead: false, isDeleted: false },
			});
			await updateMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditMessageRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				uuid: "mockmessageid",
				sender: { uuid: "mockuserid" },
				text: "Mock message",
				messageStatus: { isRead: false, isDeleted: false },
			});
		});
		test("Failure - invalid target message ID", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.messageId = "mockmessageid";
			prismaMock.message.findUniqueOrThrow.mockRejectedValueOnce(new Error("Message not found"));
			await updateMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditMessageRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - message already read", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.messageId = "mockmessageid";
			prismaMock.message.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockmessageid",
				sender: { uuid: "mockuserid" },
				messageStatus: {
					isRead: true,
				},
			});
			await updateMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditMessageRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot update a message after it has been read."] });
		});
		test("Failure - message doesn't belong to user", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.messageId = "mockmessageid";
			prismaMock.message.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockmessageid",
				sender: { uuid: "mockuseridother" },
			});
			await updateMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditMessageRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot update someone else's message."] });
		});
		test("Failure - message previously deleted", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.messageId = "mockmessageid";
			prismaMock.message.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockmessageid",
				sender: { uuid: "mockuserid" },
				messageStatus: {
					isDeleted: true,
				},
			});
			await updateMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditMessageRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot update a deleted message."] });
		});
		test("Failure - database error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.messageId = "mockmessageid";
			prismaMock.message.findUniqueOrThrow.mockRejectedValueOnce(new Error("DB Error"));
			await updateMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditMessageRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("deleteMessageHandler()", () => {
		test("Failure - unauthorised", async () => {
			await deleteMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.messageId = "mockmessageid";
			prismaMock.message.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockmessageid",
				sender: { uuid: "mockuserid" },
			});
			(softDeleteMessageStatus as Mock).mockResolvedValueOnce({ uuid: "mockmessageid", text: null });
			await deleteMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
		});
		test("Failure - invalid target message ID", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.messageId = "mockmessageid";
			prismaMock.message.findUniqueOrThrow.mockRejectedValueOnce(new Error("Message not found"));
			await deleteMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - message doesn't belong to user", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.messageId = "mockmessageid";
			prismaMock.message.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockmessageid",
				sender: { uuid: "mockuseridother" },
			});
			await deleteMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as Request,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot delete someone else's message."] });
		});
		test("Failure - database error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.messageId = "mockmessageid";
			prismaMock.message.findUniqueOrThrow.mockRejectedValueOnce(new Error("DB Error"));
			await deleteMessageHandler(prismaMock as unknown as ExtendedPrismaClient)(
				mockReq as unknown as EditMessageRequest,
				mockRes as unknown as Response,
				mockNext
			);
			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
