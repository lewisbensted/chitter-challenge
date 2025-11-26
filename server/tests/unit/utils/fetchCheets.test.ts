import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { prismaMock } from "../../test-utils/prismaMock";
import { fetchCheets } from "../../../src/utils/fetchCheets";

describe("fetchCheets() function", () => {
	beforeEach(() => {
		prismaMock.cheet.findMany.mockResolvedValue(
			Array.from({ length: 5 }, (_, i) => ({
				uuid: `testcheetuuid${i + 1}`,
			}))
		);
	});
	afterEach(() => {
		prismaMock.cheet.findMany.mockReset();
	});
	test("Fetch all cheets", async () => {
		const { cheets, hasNext } = await fetchCheets(prismaMock, 5);
		expect(prismaMock.cheet.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { user: undefined },
				take: 6,
			})
		);
		expect(cheets).toHaveLength(5);
		expect(hasNext).toBe(false);
	});
	test("Fetch cheets from a specific user - userId provided", async () => {
		const { cheets, hasNext } = await fetchCheets(prismaMock, 5, undefined, "mockuserid");
		expect(prismaMock.cheet.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { user: { uuid: "mockuserid" } },
				take: 6,
			})
		);
		expect(cheets).toHaveLength(5);
		expect(hasNext).toBe(false);
	});
	test("Fetch cheets from specific user - userId and sessionId provided", async () => {
		const { cheets, hasNext } = await fetchCheets(prismaMock, 5, "mocksessionid", "mockuserid");
		expect(prismaMock.cheet.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { user: { uuid: "mockuserid" } },
				take: 6,
			})
		);
		expect(cheets).toHaveLength(5);
		expect(hasNext).toBe(false);
	});
	test("Fetch cheets from followed users - sessionId provided", async () => {
		const { cheets, hasNext } = await fetchCheets(prismaMock, 5, "mocksessionid");
		expect(prismaMock.cheet.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					user: {
						OR: [{ uuid: "mocksessionid" }, { followers: { some: { followerId: "mocksessionid" } } }],
					},
				},
				take: 6,
			})
		);
		expect(cheets).toHaveLength(5);
		expect(hasNext).toBe(false);
	});
	test("take > cheets.length", async () => {
		const { cheets, hasNext } = await fetchCheets(prismaMock, 6);
		expect(prismaMock.cheet.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { user: undefined },
				take: 7,
			})
		);
		expect(cheets).toHaveLength(5);
		expect(hasNext).toBe(false);
	});
	test("take < cheets.length", async () => {
		const { cheets, hasNext } = await fetchCheets(prismaMock, 3);
		expect(prismaMock.cheet.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { user: undefined },
				take: 4,
			})
		);
		expect(cheets).toHaveLength(4);
		expect(hasNext).toBe(true);
	});
	test("take = 0", async () => {
		const { cheets, hasNext } = await fetchCheets(prismaMock, 0);
		expect(prismaMock.cheet.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { user: undefined },
				take: 1,
			})
		);
		expect(cheets).toHaveLength(4);
		expect(hasNext).toBe(false);
	});
	test("Pagination", async () => {
		const { cheets, hasNext } = await fetchCheets(prismaMock, 3, undefined, undefined, "mockcursor");
		expect(prismaMock.cheet.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { user: undefined },
				take: 4,
				skip: 1,
				cursor: { uuid: "mockcursor" },
			})
		);
		expect(cheets).toHaveLength(4);
		expect(hasNext).toBe(true);
	});
	test("Empty return", async () => {
		prismaMock.cheet.findMany.mockResolvedValueOnce([]);
		const { cheets, hasNext } = await fetchCheets(prismaMock, 5);
		expect(cheets).toHaveLength(0);
		expect(hasNext).toBe(false);
	});
});
