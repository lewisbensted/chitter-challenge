import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
vi.mock("../../../src/utils/generateConversationKey", () => ({
	generateConversationKey: vi.fn(() => "test-key"),
}));
import { prismaMock } from "../../test-utils/prismaMock";
import { readMessages } from "../../../src/utils/readMessages";
import { generateConversationKey } from "../../../src/utils/generateConversationKey";
import { ExtendedPrismaClient } from "../../../prisma/prismaClient";

describe("readMessages()", () => {
	beforeEach(() => {
		prismaMock.$transaction.mockImplementation(async (cb: (transaction: typeof prismaMock) => Promise<unknown>) =>
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
		const count = await readMessages(prismaMock as unknown as ExtendedPrismaClient, "mockuserA", "mockuserB");
		expect(generateConversationKey).toHaveBeenCalledWith("mockuserA", "mockuserB");
		expect(prismaMock.conversation.update).toHaveBeenCalledWith({
			data: { user1Unread: false },
			where: { key: "test-key" },
		});
		expect(count).toBe(1);
	});
	test("userId (session user) is secondUser", async () => {
		const count = await readMessages(prismaMock as unknown as ExtendedPrismaClient, "mockuserB", "mockuserA");
		expect(generateConversationKey).toHaveBeenCalledWith("mockuserA", "mockuserB");
		expect(prismaMock.conversation.update).toHaveBeenCalledWith({
			data: { user2Unread: false },
			where: { key: "test-key" },
		});
		expect(count).toBe(1);
	});
	test("Failure - database error", async () => {
		prismaMock.conversation.update.mockRejectedValueOnce(new Error("DB Error"));
		await expect(
			readMessages(prismaMock as unknown as ExtendedPrismaClient, "mockuserA", "mockuserB")
		).rejects.toThrow("DB Error");
	});
});
