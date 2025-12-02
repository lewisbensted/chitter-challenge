import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { prismaMock } from "../../test-utils/prismaMock";
import { fetchConversations } from "../../../src/utils/fetchConversations";
import { ExtendedPrismaClient } from "../../../prisma/prismaClient";
import { Prisma } from "@prisma/client";

describe("fetchConversations()", () => {
	beforeEach(() => {
		prismaMock.conversation.findMany.mockResolvedValue(
			Array.from({ length: 5 }, (_, i) => ({
				key: `testkey${i + 1}`,
				user1:
					i % 2 === 0
						? { uuid: "mockuserid", username: "mockusername" }
						: { uuid: `mockuserid${i + 1}`, username: `mockusername${i + 1}` },
				user2:
					i % 2 !== 0
						? { uuid: "mockuserid", username: "mockusername" }
						: { uuid: `mockuserid${i + 1}`, username: `mockusername${i + 1}` },
				user1Unread: i % 2 === 0,
				user2Unread: i % 2 === 0,
				latestMessage: { text: `Message ${i + 1}` },
			}))
		);
	});
	afterEach(() => {
		prismaMock.conversation.findMany.mockReset();
	});
	test("Fetch all conversations - no interlocutors ID array provided", async () => {
		const { conversations, hasNext } = await fetchConversations(
			prismaMock as unknown as ExtendedPrismaClient,
			5,
			"mockuserid"
		);
		expect(prismaMock.conversation.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { OR: [{ user1Id: "mockuserid" }, { user2Id: "mockuserid" }] },
				take: 6,
			})
		);
		expect(conversations).toHaveLength(5);
		conversations.forEach((convo, i) => {
			expect(convo).toEqual({
				key: `testkey${i + 1}`,
				interlocutorId: `mockuserid${i + 1}`,
				interlocutorUsername: `mockusername${i + 1}`,
				latestMessage: { text: `Message ${i + 1}` },
				unread: i % 2 === 0,
			});
		});
		expect(hasNext).toBe(false);
	});
	test("Fetch no conversations - empty interlocutor ID array", async () => {
		prismaMock.conversation.findMany.mockResolvedValueOnce([]);
		const { conversations, hasNext } = await fetchConversations(
			prismaMock as unknown as ExtendedPrismaClient,
			5,
			"mockuserid",
			[],
			"mockcursor"
		);
		const calledArgs = prismaMock.conversation.findMany.mock.calls[0][0] as Prisma.ConversationFindManyArgs;
		expect(calledArgs).not.toHaveProperty("mockcursor");
		expect(calledArgs).not.toHaveProperty("take");
		expect(prismaMock.conversation.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					OR: [
						{ user1Id: "mockuserid", user2Id: { in: [] } },
						{ user2Id: "mockuserid", user1Id: { in: [] } },
					],
				},
			})
		);
		expect(conversations).toHaveLength(0);
		expect(hasNext).toBe(false);
	});
	test("Fetch specific conversations - populated interlocutor array", async () => {
		await fetchConversations(
			prismaMock as unknown as ExtendedPrismaClient,
			5,
			"mockuserid",
			["mockuser1", "mockuser2", "mockuser3"],
			"mockcursor"
		);
		const calledArgs = prismaMock.conversation.findMany.mock.calls[0][0] as Prisma.ConversationFindManyArgs;
		expect(calledArgs).not.toHaveProperty("mockcursor");
		expect(calledArgs).not.toHaveProperty("take");
		expect(prismaMock.conversation.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					OR: [
						{ user1Id: "mockuserid", user2Id: { in: ["mockuser1", "mockuser2", "mockuser3"] } },
						{ user2Id: "mockuserid", user1Id: { in: ["mockuser1", "mockuser2", "mockuser3"] } },
					],
				},
			})
		);
	});
	test("Pagination", async () => {
		await fetchConversations(
			prismaMock as unknown as ExtendedPrismaClient,
			5,
			"mockuserid",
			undefined,
			"mockcursor"
		);
		expect(prismaMock.conversation.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { OR: [{ user1Id: "mockuserid" }, { user2Id: "mockuserid" }] },
				take: 6,
				skip: 1,
				cursor: { key: "mockcursor" },
			})
		);
	});
	test("take > conversations.length", async () => {
		const { conversations, hasNext } = await fetchConversations(
			prismaMock as unknown as ExtendedPrismaClient,
			6,
			"mockuserid"
		);
		expect(prismaMock.conversation.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { OR: [{ user1Id: "mockuserid" }, { user2Id: "mockuserid" }] },
				take: 7,
			})
		);
		expect(conversations).toHaveLength(5);
		expect(hasNext).toBe(false);
	});
	test("take < conversations.length", async () => {
		const { conversations, hasNext } = await fetchConversations(
			prismaMock as unknown as ExtendedPrismaClient,
			3,
			"mockuserid"
		);
		expect(prismaMock.conversation.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { OR: [{ user1Id: "mockuserid" }, { user2Id: "mockuserid" }] },
				take: 4,
			})
		);
		expect(conversations).toHaveLength(4);
		expect(hasNext).toBe(true);
	});
	test("take = 0", async () => {
		const { conversations, hasNext } = await fetchConversations(
			prismaMock as unknown as ExtendedPrismaClient,
			0,
			"mockuserid"
		);
		expect(prismaMock.conversation.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { OR: [{ user1Id: "mockuserid" }, { user2Id: "mockuserid" }] },
				take: 1,
			})
		);
		expect(conversations).toHaveLength(4);
		expect(hasNext).toBe(false);
	});
});
