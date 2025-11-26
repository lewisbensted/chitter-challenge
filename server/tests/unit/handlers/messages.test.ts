import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../../../src/utils/sendErrorResponse", () => ({
	sendErrorResponse: vi.fn(),
}));
vi.mock("../../../src/utils/logError", () => ({
	logError: vi.fn(),
}));
vi.mock("../../../src/utils/generateConversationKey", () => ({
	generateConversationKey: vi.fn(() => "test-key"),
}));

import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { prismaMock } from "../../test-utils/prismaMock";
import {
	deleteMessageHandler,
	editMessageHandler,
	getMessageHandler,
	postMessageHandler,
} from "../../../src/routes/messages";
import { sendErrorResponse } from "../../../src/utils/sendErrorResponse";
import { logError } from "../../../src/utils/logError";
import { EditMessageRequest, SendMessageRequest } from "../../../types/requests";
import { generateConversationKey } from "../../../src/utils/generateConversationKey";

describe("Messages - unit test", () => {
	let mockReq: MockRequest;
	let mockRes: MockResponse;
	beforeEach(() => {
		mockReq = createMockReq();
		mockRes = createMockRes();
	});
	describe("Fetch message at route: [GET] /messages", () => {
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
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			mockReq.query.take = 20;
			mockReq.query.cursor = "valid";
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockrecipientuuid" });
			prismaMock.message.findUnique.mockResolvedValueOnce({ uuid: "valid" });
			await getMessageHandler(prismaMock, fetchMessagesMock)(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				messages: [],
				hasNext: false,
			});
			expect(fetchMessagesMock).toHaveBeenCalledWith(
				prismaMock,
				20,
				"mockuseruuid",
				"mockrecipientuuid",
				"valid"
			);
		});
		test("Invalid recipient ID provided", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			prismaMock.user.findUniqueOrThrow.mockRejectedValueOnce(new Error("Recipient not found"));
			await getMessageHandler(prismaMock, fetchMessagesMock)(mockReq, mockRes);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Invalid take provided", async () => {
			mockReq.query.take = "invalid";
			mockReq.session.user = { uuid: "mockuseruuid" };
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockrecipientuuid" });
			await getMessageHandler(prismaMock, fetchMessagesMock)(mockReq, mockRes);
			expect(fetchMessagesMock).toHaveBeenCalledWith(
				prismaMock,
				10,
				"mockuseruuid",
				"mockrecipientuuid",
				undefined
			);
		});
		test("Take clamped at max value", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			mockReq.query.take = 100;
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockrecipientuuid" });
			await getMessageHandler(prismaMock, fetchMessagesMock)(mockReq, mockRes);
			expect(fetchMessagesMock).toHaveBeenCalledWith(
				prismaMock,
				50,
				"mockuseruuid",
				"mockrecipientuuid",
				undefined
			);
		});
		test("Invalid cursor provided", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			mockReq.query.cursor = "invalid";
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({ uuid: "mockrecipientuuid" });
			prismaMock.message.findUnique.mockResolvedValueOnce(null);
			await getMessageHandler(prismaMock, fetchMessagesMock)(mockReq, mockRes);
			expect(fetchMessagesMock).toHaveBeenCalledWith(
				prismaMock,
				10,
				"mockuseruuid",
				"mockrecipientuuid",
				undefined
			);
		});
	});
	describe("Send message at route: [POST] /messages", () => {
		test("Success - self message", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			mockReq.body = { text: "Mock message" };
			prismaMock.$transaction.mockImplementationOnce(
				async (cb: (transaction: typeof prismaMock) => Promise<any>) => cb(prismaMock)
			);
			prismaMock.message.create.mockResolvedValueOnce({
				uuid: "mockmessageuuid",
				sender: { uuid: "mockuseruuid" },
				recipient: { uuid: "mockuseruuid" },
			});
			prismaMock.messageStatus.create.mockResolvedValueOnce({
				isRead: false,
			});
			await postMessageHandler(prismaMock)(mockReq as SendMessageRequest, mockRes);
			const upsertCall = prismaMock.conversation.upsert.mock.calls[0][0];
			expect(upsertCall.update).toEqual({ latestMessageId: "mockmessageuuid" });
			expect(upsertCall.create).toEqual({
				user1Id: "mockuseruuid",
				user2Id: "mockuseruuid",
				latestMessageId: "mockmessageuuid",
				key: "test-key",
			});
			expect(mockRes.status).toHaveBeenCalledWith(201);
			expect(mockRes.json).toHaveBeenCalledWith({
				messageStatus: {
					isRead: false,
				},
				recipient: {
					uuid: "mockuseruuid",
				},
				sender: {
					uuid: "mockuseruuid",
				},
				uuid: "mockmessageuuid",
			});
		});
		test("Success - first user sender", async () => {
			mockReq.session.user = { uuid: "a-mocksenderuuid" };
			mockReq.body = { text: "Mock message" };
			prismaMock.$transaction.mockImplementationOnce(
				async (cb: (transaction: typeof prismaMock) => Promise<any>) => cb(prismaMock)
			);
			prismaMock.message.create.mockResolvedValueOnce({
				uuid: "mockmessageuuid",
				sender: { uuid: "a-mocksenderuuid" },
				recipient: { uuid: "b-mockrecipientuuid" },
			});
			prismaMock.messageStatus.create.mockResolvedValueOnce({
				isRead: false,
			});
			await postMessageHandler(prismaMock)(mockReq as SendMessageRequest, mockRes);
			expect(prismaMock.conversation.upsert).toHaveBeenCalledWith(
				expect.objectContaining({
					update: expect.objectContaining({ user2Unread: true, latestMessageId: "mockmessageuuid" }),
					create: expect.objectContaining({
						user1Id: "a-mocksenderuuid",
						user2Id: "b-mockrecipientuuid",
						latestMessageId: "mockmessageuuid",
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
					uuid: "b-mockrecipientuuid",
				},
				sender: {
					uuid: "a-mocksenderuuid",
				},
				uuid: "mockmessageuuid",
			});
		});
		test("Success - second user sender", async () => {
			mockReq.session.user = { uuid: "b-mocksenderuuid" };
			mockReq.body = { text: "Mock message" };
			prismaMock.$transaction.mockImplementationOnce(
				async (cb: (transaction: typeof prismaMock) => Promise<any>) => cb(prismaMock)
			);
			prismaMock.message.create.mockResolvedValueOnce({
				uuid: "mockmessageuuid",
				sender: { uuid: "b-mocksenderuuid" },
				recipient: { uuid: "a-mockrecipientuuid" },
			});
			prismaMock.messageStatus.create.mockResolvedValueOnce({
				isRead: false,
			});
			await postMessageHandler(prismaMock)(mockReq as SendMessageRequest, mockRes);
			expect(prismaMock.conversation.upsert).toHaveBeenCalledWith(
				expect.objectContaining({
					update: expect.objectContaining({ user1Unread: true, latestMessageId: "mockmessageuuid" }),
					create: expect.objectContaining({
						user1Id: "a-mockrecipientuuid",
						user2Id: "b-mocksenderuuid",
						latestMessageId: "mockmessageuuid",
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
					uuid: "a-mockrecipientuuid",
				},
				sender: {
					uuid: "b-mocksenderuuid",
				},
				uuid: "mockmessageuuid",
			});
		});
		test("Failure", async () => {
			prismaMock.$transaction.mockRejectedValueOnce(new Error("DB exploded"));
			await postMessageHandler(prismaMock)(mockReq as SendMessageRequest, mockRes);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("Edit message at route: [PUT] /messages", () => {
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			mockReq.params.messageId = "mockmessageuuid";
			mockReq.body = { text: "Mock message" };
			prismaMock.message.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockmessageuuid",
				sender: { uuid: "mockuseruuid" },
				text: "Mock message other",
				messageStatus: { isRead: false, isDeleted: false },
			});
			prismaMock.message.update.mockResolvedValueOnce({ uuid: "mockmessageuuid", text: "Mock message" });
			await editMessageHandler(prismaMock)(mockReq as EditMessageRequest, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ uuid: "mockmessageuuid", text: "Mock message" });
		});
		test("Success - message text unchanged", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			mockReq.params.messageId = "mockmessageuuid";
			mockReq.body = { text: "Mock message" };
			prismaMock.message.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockmessageuuid",
				sender: { uuid: "mockuseruuid" },
				text: "Mock message",
				messageStatus: { isRead: false, isDeleted: false },
			});
			await editMessageHandler(prismaMock)(mockReq as EditMessageRequest, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				uuid: "mockmessageuuid",
				sender: { uuid: "mockuseruuid" },
				text: "Mock message",
				messageStatus: { isRead: false, isDeleted: false },
			});
		});
		test("Failure - invalid target message ID", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			mockReq.params.messageId = "mockmessageuuid";
			prismaMock.message.findUniqueOrThrow.mockRejectedValueOnce(new Error("Message not found"));
			await editMessageHandler(prismaMock)(mockReq as EditMessageRequest, mockRes);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - message already read", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			mockReq.params.messageId = "mockmessageuuid";
			prismaMock.message.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockmessageuuid",
				sender: { uuid: "mockuseruuid" },
				messageStatus: {
					isRead: true,
				},
			});
			await editMessageHandler(prismaMock)(mockReq as EditMessageRequest, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot update a message after it has been read."] });
		});
		test("Failure - message doesn't belong to user", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			mockReq.params.messageId = "mockmessageuuid";
			prismaMock.message.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockmessageuuid",
				sender: { uuid: "mockuseruuidother" },
			});
			await editMessageHandler(prismaMock)(mockReq as EditMessageRequest, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot update someone else's message."] });
		});
		test("Failure - message deleted", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			mockReq.params.messageId = "mockmessageuuid";
			prismaMock.message.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockmessageuuid",
				sender: { uuid: "mockuseruuid" },
				messageStatus: {
					isDeleted: true,
				},
			});
			await editMessageHandler(prismaMock)(mockReq as EditMessageRequest, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot update a deleted message."] });
		});
	});
	describe("Delete message at route: [DELETE] /messages", () => {
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			mockReq.params.messageId = "mockmessageuuid";
			prismaMock.message.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockmessageuuid",
				sender: { uuid: "mockuseruuid" },
			});
			prismaMock.message.delete.mockResolvedValueOnce({ uuid: "mockmessageuuid", text: null });
			await deleteMessageHandler(prismaMock)(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(200);
		});
		test("Failure - invalid target message ID", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			mockReq.params.messageId = "mockmessageuuid";
			prismaMock.message.findUniqueOrThrow.mockRejectedValueOnce(new Error("Message not found"));
			await deleteMessageHandler(prismaMock)(mockReq, mockRes);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Failure - message doesn't belong to user", async () => {
			mockReq.session.user = { uuid: "mockuseruuid" };
			mockReq.params.messageId = "mockmessageuuid";
			prismaMock.message.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockmessageuuid",
				sender: { uuid: "mockuseruuidother" },
			});
			await deleteMessageHandler(prismaMock)(mockReq, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Cannot delete someone else's message."] });
		});
	});
});
