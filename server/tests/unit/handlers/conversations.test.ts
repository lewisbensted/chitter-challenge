import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../../../src/utils/sendErrorResponse", () => ({
	sendErrorResponse: vi.fn(),
}));
vi.mock("../../../src/utils/logError", () => ({
	logError: vi.fn(),
}));
import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { prismaMock } from "../../test-utils/prismaMock";
import { getConversationsHandler, getUnreadHandler } from "../../../src/routes/conversations";
import { Request, Response } from "express";
import { sendErrorResponse } from "../../../src/utils/sendErrorResponse";
import { logError } from "../../../src/utils/logError";

describe("Conversation handlers", () => {
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
	describe("Get unread messages at route: [GET] /unread", () => {
		test("Unauthorised", async () => {
			await getUnreadHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("No unread", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.conversation.findFirst.mockResolvedValueOnce(null);
			await getUnreadHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith(false);
		});
		test("Unread", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.conversation.findFirst.mockResolvedValueOnce({ key: "test-key" });
			await getUnreadHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith(true);
		});
		test("Error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			prismaMock.conversation.findFirst.mockRejectedValueOnce(new Error("DB exploded"));
			await getUnreadHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("Fetch conversations at route: [GET] /conversations", () => {
		let fetchConversationsMock: ReturnType<typeof vi.fn>;
		beforeEach(() => {
			fetchConversationsMock = vi.fn().mockResolvedValue({ conversations: [], hasNext: false });
		});
		afterEach(() => {
			vi.clearAllMocks();
		});
		test("Unauthorised", async () => {
			await getConversationsHandler(prismaMock, fetchConversationsMock)(
				mockReq as Request,
				mockRes as unknown as Response
			);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("No user IDs provided", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.take = String(20);
			mockReq.query.cursor = "valid";
			prismaMock.conversation.findUnique.mockResolvedValueOnce({ key: "valid" });
			await getConversationsHandler(prismaMock, fetchConversationsMock)(
				mockReq as Request,
				mockRes as unknown as Response
			);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ conversations: [], hasNext: false });
			expect(fetchConversationsMock).toHaveBeenCalledWith(prismaMock, 20, "mockuserid", undefined, "valid");
		});
		test("Empty user IDs string", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.userIds = "";
			await getConversationsHandler(prismaMock, fetchConversationsMock)(
				mockReq as Request,
				mockRes as unknown as Response
			);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ conversations: [], hasNext: false });
			expect(fetchConversationsMock).toHaveBeenCalledWith(prismaMock, 10, "mockuserid", [], undefined);
		});
		test("Valid user ID string", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.userIds = "abc,def,geh";
			await getConversationsHandler(prismaMock, fetchConversationsMock)(
				mockReq as Request,
				mockRes as unknown as Response
			);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ conversations: [], hasNext: false });
			expect(fetchConversationsMock).toHaveBeenCalledWith(
				prismaMock,
				10,
				"mockuserid",
				["abc", "def", "geh"],
				undefined
			);
		});
		test("Multiple commas in user ID string", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.userIds = "abc,,def, ,geh";
			await getConversationsHandler(prismaMock, fetchConversationsMock)(
				mockReq as Request,
				mockRes as unknown as Response
			);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ conversations: [], hasNext: false });
			expect(fetchConversationsMock).toHaveBeenCalledWith(
				prismaMock,
				10,
				"mockuserid",
				["abc", "def", "geh"],
				undefined
			);
		});
		test("Invalid take provide", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.take = "invalid";
			await getConversationsHandler(prismaMock, fetchConversationsMock)(
				mockReq as Request,
				mockRes as unknown as Response
			);
			expect(fetchConversationsMock).toHaveBeenCalledWith(prismaMock, 10, "mockuserid", undefined, undefined);
		});
		test("Take clamped at max value", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.take = String(100);
			await getConversationsHandler(prismaMock, fetchConversationsMock)(
				mockReq as Request,
				mockRes as unknown as Response
			);
			expect(fetchConversationsMock).toHaveBeenCalledWith(prismaMock, 50, "mockuserid", undefined, undefined);
		});
		test("Invalid cursor provided", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.query.take = String(100);
			mockReq.query.cursor = "invalid";
			prismaMock.conversation.findUnique.mockResolvedValueOnce(null);
			await getConversationsHandler(prismaMock, fetchConversationsMock)(
				mockReq as Request,
				mockRes as unknown as Response
			);
			expect(fetchConversationsMock).toHaveBeenCalledWith(prismaMock, 50, "mockuserid", undefined, undefined);
		});
		test("Error", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			fetchConversationsMock = vi.fn().mockRejectedValueOnce(new Error("DB exploded"));
			await getConversationsHandler(prismaMock, fetchConversationsMock)(
				mockReq as Request,
				mockRes as unknown as Response
			);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
