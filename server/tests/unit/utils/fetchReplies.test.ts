import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { prismaMock } from "../../test-utils/prismaMock";
import { fetchReplies } from "../../../src/utils/fetchReplies";
import { ExtendedPrismaClient } from "../../../prisma/prismaClient";

describe("fetchReplies()", () => {
	beforeEach(() => {
		prismaMock.reply.findMany.mockResolvedValue(
			Array.from({ length: 5 }, (_, i) => ({
				uuid: `testreplyuuid${i + 1}`,
			}))
		);
	});
	afterEach(() => {
		prismaMock.cheet.findMany.mockReset();
	});
	test("Fetch replies to a specified cheet", async () => {
		const { replies, hasNext } = await fetchReplies(
			prismaMock as unknown as ExtendedPrismaClient,
			5,
			"mockcheetid"
		);
		expect(prismaMock.reply.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { cheet: { uuid: "mockcheetid" } },
				take: 6,
			})
		);
		expect(replies).toHaveLength(5);
		expect(hasNext).toBe(false);
	});
	test("take > replies.length", async () => {
		const { replies, hasNext } = await fetchReplies(
			prismaMock as unknown as ExtendedPrismaClient,
			6,
			"mockcheetid"
		);
		expect(prismaMock.reply.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { cheet: { uuid: "mockcheetid" } },
				take: 7,
			})
		);
		expect(replies).toHaveLength(5);
		expect(hasNext).toBe(false);
	});
	test("take < replies.length", async () => {
		const { replies, hasNext } = await fetchReplies(
			prismaMock as unknown as ExtendedPrismaClient,
			3,
			"mockcheetid"
		);
		expect(prismaMock.reply.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { cheet: { uuid: "mockcheetid" } },
				take: 4,
			})
		);
		expect(replies).toHaveLength(4);
		expect(hasNext).toBe(true);
	});
	test("take = 0", async () => {
		const { replies, hasNext } = await fetchReplies(
			prismaMock as unknown as ExtendedPrismaClient,
			0,
			"mockcheetid"
		);
		expect(prismaMock.reply.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { cheet: { uuid: "mockcheetid" } },
				take: 1,
			})
		);
		expect(replies).toHaveLength(4);
		expect(hasNext).toBe(false);
	});
	test("Pagination", async () => {
		const { replies, hasNext } = await fetchReplies(
			prismaMock as unknown as ExtendedPrismaClient,
			3,
			"mockcheetid",
			"mockcursor"
		);
		expect(prismaMock.reply.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { cheet: { uuid: "mockcheetid" } },
				take: 4,
				skip: 1,
				cursor: { uuid: "mockcursor" },
			})
		);
		expect(replies).toHaveLength(4);
		expect(hasNext).toBe(true);
	});
	test("Empty return", async () => {
		prismaMock.reply.findMany.mockResolvedValueOnce([]);
		const { replies, hasNext } = await fetchReplies(
			prismaMock as unknown as ExtendedPrismaClient,
			5,
			"mockcheetid"
		);
		expect(replies).toHaveLength(0);
		expect(hasNext).toBe(false);
	});
	test("Failure - database error", async () => {
		prismaMock.reply.findMany.mockRejectedValueOnce(new Error("DB Error"));
		await expect(fetchReplies(prismaMock as unknown as ExtendedPrismaClient, 5, "mockcheetid")).rejects.toThrow(
			"DB Error"
		);
	});
});
