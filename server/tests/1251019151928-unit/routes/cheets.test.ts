import { beforeAll, describe, expect, test } from "vitest";
import prisma from "../../../prisma/prismaClient";
import { testUsers } from "../../fixtures/users.fixtures";
import { resetDB } from "../../../prisma/resetDB";
import { testCheets } from "../../fixtures/cheets.fixtures";
import { fetchCheets } from "../../../src/routes/cheets";

describe("Cheets", () => {
	beforeAll(async () => {
		await resetDB();
		await prisma.user.createMany({ data: testUsers });
		await prisma.cheet.createMany({ data: testCheets });
	});
	describe("fetchCheets()", () => {
		test("fetch all cheets in chronological order", async () => {
			const cheets = await fetchCheets(prisma, 20);
			expect(cheets.cheets).toHaveLength(10);
			expect(cheets.cheets[0].text).toBe("Test Cheet 10");
			expect(cheets.cheets[9].text).toBe("Test Cheet 1");
			expect(cheets.hasNext).toBe(false);
		});
		test("check take. hasNext", async () => {
			expect(true).toBe(false);
		});
		test("check invalid take", async () => {
			expect(true).toBe(false);
		});
		test("fetch cheets from page user", async () => {
			expect(true).toBe(false);
		});
		test("fetch cheets from followed users", async () => {
			expect(true).toBe(false);
		});
		test("pagination - valid cursor", async () => {
			expect(true).toBe(false);
		});
		test("pagination - invalid cursor", async () => {
			expect(true).toBe(false);
		});
		test("no users", async () => {
			expect(true).toBe(false);
		});
	});
});
