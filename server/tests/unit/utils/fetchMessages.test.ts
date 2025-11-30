import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { prismaMock } from "../../test-utils/prismaMock";
import { fetchMessages } from "../../../src/utils/fetchMessages";
import { ExtendedPrismaClient } from "../../../prisma/prismaClient";

describe("fetchMessages() function", () => {
	beforeEach(() => {
		prismaMock.message.findMany.mockResolvedValue(
			Array.from({ length: 5 }, (_, i) => ({
				uuid: `testmessageuuid${i + 1}`,
				text: `Test text ${i + 1}`,
				messageStatus: { isDeleted: i % 2 === 0 },
			}))
		);
	});

	afterEach(() => {
		prismaMock.message.findMany.mockReset();
	});
	test("Fetch all messages between specific users", async () => {
		const { messages, hasNext } = await fetchMessages(
			prismaMock as unknown as ExtendedPrismaClient,
			5,
			"mockuserid",
			"mockinterlocutorid"
		);
		expect(prismaMock.message.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					OR: [
						{ senderId: "mockuserid", recipientId: "mockinterlocutorid" },
						{ senderId: "mockinterlocutorid", recipientId: "mockuserid" },
					],
				},
				take: 6,
			})
		);
		expect(messages).toHaveLength(5);
		messages.reverse().forEach((message, i) => {
			expect(message.text === null).toBe(i % 2 === 0);
		});
		messages.reverse().forEach((message, i) => {
			expect(typeof message.text === "string").toBe(i % 2 !== 0);
		});
		expect(hasNext).toBe(false);
	});
	test("take > messages.length", async () => {
		const { messages, hasNext } = await fetchMessages(
			prismaMock as unknown as ExtendedPrismaClient,
			6,
			"mockuserid",
			"mockinterlocutorid"
		);
		expect(prismaMock.message.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					OR: [
						{ senderId: "mockuserid", recipientId: "mockinterlocutorid" },
						{ senderId: "mockinterlocutorid", recipientId: "mockuserid" },
					],
				},
				take: 7,
			})
		);
		expect(messages).toHaveLength(5);
		expect(hasNext).toBe(false);
	});
	test("take < messages.length", async () => {
		const { messages, hasNext } = await fetchMessages(
			prismaMock as unknown as ExtendedPrismaClient,
			4,
			"mockuserid",
			"mockinterlocutorid"
		);
		expect(prismaMock.message.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					OR: [
						{ senderId: "mockuserid", recipientId: "mockinterlocutorid" },
						{ senderId: "mockinterlocutorid", recipientId: "mockuserid" },
					],
				},
				take: 5,
			})
		);
		expect(messages).toHaveLength(4);
		expect(hasNext).toBe(true);
	});
	test("take = 0", async () => {
		const { messages, hasNext } = await fetchMessages(
			prismaMock as unknown as ExtendedPrismaClient,
			0,
			"mockuserid",
			"mockinterlocutorid"
		);
		expect(prismaMock.message.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					OR: [
						{ senderId: "mockuserid", recipientId: "mockinterlocutorid" },
						{ senderId: "mockinterlocutorid", recipientId: "mockuserid" },
					],
				},
				take: 1,
			})
		);
		expect(messages).toHaveLength(4);
		expect(hasNext).toBe(false);
	});
	test("Cursor provided", async () => {
		const { messages, hasNext } = await fetchMessages(
			prismaMock as unknown as ExtendedPrismaClient,
			0,
			"mockuserid",
			"mockinterlocutorid",
			"mockcursor"
		);
		expect(prismaMock.message.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					OR: [
						{ senderId: "mockuserid", recipientId: "mockinterlocutorid" },
						{ senderId: "mockinterlocutorid", recipientId: "mockuserid" },
					],
				},
				take: 1,
				skip: 1,
				cursor: { uuid: "mockcursor" },
			})
		);
		expect(messages).toHaveLength(4);
		expect(hasNext).toBe(false);
	});
	test("Empty return", async () => {
		prismaMock.message.findMany.mockResolvedValueOnce([]);
		const { messages, hasNext } = await fetchMessages(
			prismaMock as unknown as ExtendedPrismaClient,
			5,
			"mockuserid",
			"mockinterlocutorid"
		);
		expect(messages).toHaveLength(0);
		expect(hasNext).toBe(false);
	});
});
