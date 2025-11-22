import { beforeAll, describe, expect, test } from "vitest";
import { resetDB } from "../../prisma/resetDB";
import prisma from "../../prisma/prismaClient";
import { testUsers } from "../fixtures/users.fixtures";
import { fetchCheets } from "../../src/routes/cheets";

describe("Cheets - unit tests", () => {
	beforeAll(async () => {
		await resetDB(prisma);
		await prisma.user.createMany({ data: testUsers });
		await prisma.cheet.createMany({ data: testCheets });
		await prisma.cheetStatus.createMany({ data: testCheetStatuses });
		await prisma.follow.createMany({ data: testFollows });
	});
	describe("fetchCheets() function", () => {
		test("Fetch all cheets - no filter.", async () => {
			const cheets = await fetchCheets(prisma, 20);
			expect(cheets.cheets).toHaveLength(12);
			expect(
				cheets.cheets.every((cheet, i, arr) => i === arr.length - 1 || cheet.createdAt >= arr[i + 1].createdAt)
			).toBe(true);
		});
		test("Fetch cheets from specific user - userId provided", async () => {
			const cheets = await fetchCheets(prisma, 20, undefined, "testuseruuid2");
			expect(cheets.cheets).toHaveLength(3);
			expect(cheets.cheets.every((cheet) => cheet.user.uuid === "testuseruuid2")).toBe(true);
			expect(
				cheets.cheets.every((cheet, i, arr) => i === arr.length - 1 || cheet.createdAt >= arr[i + 1].createdAt)
			).toBe(true);
		});
		test("Fetch cheets from specific user - userId and sessionId provided", async () => {
			const cheets = await fetchCheets(prisma, 20, undefined, "testuseruuid2");
			expect(cheets.cheets).toHaveLength(3);
			expect(cheets.cheets.every((cheet) => cheet.user.uuid === "testuseruuid2")).toBe(true);
			expect(
				cheets.cheets.every((cheet, i, arr) => i === arr.length - 1 || cheet.createdAt >= arr[i + 1].createdAt)
			).toBe(true);
		});
		test("Fetch cheets from followed users - sessionId provided", async () => {
			const user1Follows = await fetchCheets(prisma, 20, "testuseruuid1");
			expect(user1Follows.cheets).toHaveLength(9);
			expect(
				user1Follows.cheets.every((cheet) => ["testuseruuid1", "testuseruuid3"].includes(cheet.user.uuid))
			).toBe(true);
			expect(
				user1Follows.cheets.every(
					(cheet, i, arr) => i === arr.length - 1 || cheet.createdAt >= arr[i + 1].createdAt
				)
			).toBe(true);

			const user2Follows = await fetchCheets(prisma, 20, "testuseruuid2");
			expect(user2Follows.cheets).toHaveLength(12);
			expect(
				user2Follows.cheets.every((cheet) =>
					["testuseruuid1", "testuseruuid2", "testuseruuid3"].includes(cheet.user.uuid)
				)
			).toBe(true);
			expect(
				user2Follows.cheets.every(
					(cheet, i, arr) => i === arr.length - 1 || cheet.createdAt >= arr[i + 1].createdAt
				)
			).toBe(true);

			const user3Follows = await fetchCheets(prisma, 20, "testuseruuid3");
			expect(user3Follows.cheets).toHaveLength(3);
			expect(user3Follows.cheets.every((cheet) => ["testuseruuid3"].includes(cheet.user.uuid))).toBe(true);
			expect(
				user3Follows.cheets.every(
					(cheet, i, arr) => i === arr.length - 1 || cheet.createdAt >= arr[i + 1].createdAt
				)
			).toBe(true);

			const user4Follows = await fetchCheets(prisma, 20, "testuseruuid4");
			expect(user4Follows.cheets).toHaveLength(0);
		});
		test("Take and hasNext", async () => {
			const cheets10 = await fetchCheets(prisma, 10);
			expect(cheets10.cheets).toHaveLength(10);
			expect(cheets10.hasNext).toBe(true);

			const cheets12 = await fetchCheets(prisma, 12);
			expect(cheets12.cheets).toHaveLength(12);
			expect(cheets12.hasNext).toBe(false);

			const cheets0 = await fetchCheets(prisma, 0);
			expect(cheets0.cheets).toHaveLength(0);
			expect(cheets0.hasNext).toBe(false);
		});
		test("Pagination", async () => {
			const cheets1 = await fetchCheets(prisma, 20, undefined, undefined, "testcheetuuid8");
			expect(cheets1.cheets).toHaveLength(7);
			expect(cheets1.cheets[0].uuid).toBe("testcheetuuid7");
			expect(cheets1.hasNext).toBe(false);

			const cheets2 = await fetchCheets(prisma, 1, undefined, undefined, "testcheetuuid9");
			expect(cheets2.cheets).toHaveLength(1);
			expect(cheets2.cheets[0].uuid).toBe("testcheetuuid8");
			expect(cheets2.hasNext).toBe(true);
		});
		test("No cheets selected", async () => {
			const cheets = await fetchCheets(prisma, 10, undefined, "testuseruuid4");
			expect(cheets.cheets).toHaveLength(0);
			expect(cheets.hasNext).toBe(false);
		});
	});
});
