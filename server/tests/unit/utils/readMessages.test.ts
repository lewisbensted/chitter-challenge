import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
vi.mock("../../../src/utils/generateConversationKey", () => ({
	generateConversationKey: vi.fn(() => "test-key"),
}));
import { prismaMock } from "../../test-utils/prismaMock";
import { readMessages } from "../../../src/utils/readMessages";
import { generateConversationKey } from "../../../src/utils/generateConversationKey";

describe("readMessages() function", () => {
	beforeEach(() => {
		prismaMock.$transaction.mockImplementation(async (cb: (transaction: typeof prismaMock) => Promise<any>) =>
			cb(prismaMock)
		);
		prismaMock.messageStatus.updateMany.mockResolvedValue({
			count: 1,
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});
	test("userId (session user) is firstUser", async () => {
		const count = await readMessages(prismaMock, "mockuserA", "mockuserB");
		expect(generateConversationKey).toHaveBeenCalledWith("mockuserA", "mockuserB");
		expect(prismaMock.conversation.update).toHaveBeenCalledWith({
			data: { user1Unread: false },
			where: { key: "test-key" },
		});
		expect(count).toBe(1);
	});
	test("userId (session user) is secondUser", async () => {
		const count = await readMessages(prismaMock, "mockuserB", "mockuserA");
		expect(generateConversationKey).toHaveBeenCalledWith("mockuserA", "mockuserB");
		expect(prismaMock.conversation.update).toHaveBeenCalledWith({
			data: { user2Unread: false },
			where: { key: "test-key" },
		});
		expect(count).toBe(1);
	});
});
