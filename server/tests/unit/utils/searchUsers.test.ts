import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { prismaMock } from "../../test-utils/prismaMock";
import { searchUsers } from "../../../src/utils/searchUsers";
import { ExtendedPrismaClient } from "../../../prisma/prismaClient";

describe("searchUsers() function", () => {
	beforeEach(() => {
		prismaMock.user.findMany.mockResolvedValue(
			Array.from({ length: 5 }, (_, i) => ({
				uuid: `testuseruuid${i + 1}`,
				followers: i % 2 === 0 ? [{ uuid: "mocksessionuuid" }] : [],
			}))
		);
	});
	afterEach(() => {
		prismaMock.user.findMany.mockReset();
	});
	test("Session user", async () => {
		const { users, hasNext } = await searchUsers(prismaMock as unknown as ExtendedPrismaClient, 5, "search", "mocksessionuuid");
		expect(prismaMock.user.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { username: { contains: "search" } },
				take: 6,
			})
		);
		expect(users).toHaveLength(5);
		users.forEach((user, i) => {
			expect(user.isFollowing).toBe(i % 2 === 0);
		});
		expect(hasNext).toBe(false);
	});
	test("No session user", async () => {
		const { users, hasNext } = await searchUsers(prismaMock as unknown as ExtendedPrismaClient, 5, "search");
		expect(prismaMock.user.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { username: { contains: "search" } },
				take: 6,
			})
		);
		expect(users).toHaveLength(5);
		expect(users.every((user) => user.isFollowing === null)).toBe(true);
		expect(hasNext).toBe(false);
	});
	test("take > users.length", async () => {
		const { users, hasNext } = await searchUsers(prismaMock as unknown as ExtendedPrismaClient, 6, "search");
		expect(prismaMock.user.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { username: { contains: "search" } },
				take: 7,
			})
		);
		expect(users).toHaveLength(5);
		expect(hasNext).toBe(false);
	});
	test("take < users.length", async () => {
		const { users, hasNext } = await searchUsers(prismaMock as unknown as ExtendedPrismaClient, 3, "search");
		expect(prismaMock.user.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { username: { contains: "search" } },
				take: 4,
			})
		);
		expect(users).toHaveLength(4);
		expect(hasNext).toBe(true);
	});
	test("take = 0", async () => {
		const { users, hasNext } = await searchUsers(prismaMock as unknown as ExtendedPrismaClient, 0, "search");
		expect(prismaMock.user.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { username: { contains: "search" } },
				take: 1,
			})
		);
		expect(users).toHaveLength(4);
		expect(hasNext).toBe(false);
	});
	test("Cursor provided", async () => {
		const { users, hasNext } = await searchUsers(prismaMock as unknown as ExtendedPrismaClient, 5, "search", undefined, "mockcursor");
		expect(prismaMock.user.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { username: { contains: "search" } },
				take: 6,
				skip: 1,
				cursor: { uuid: "mockcursor" },
			})
		);
		expect(users).toHaveLength(5);
		expect(hasNext).toBe(false);
	});
	test("Empty return", async () => {
		prismaMock.user.findMany.mockResolvedValue([]);
		const { users, hasNext } = await searchUsers(prismaMock as unknown as ExtendedPrismaClient, 5, "search", undefined, "mockcursor");
		expect(users).toHaveLength(0);
		expect(hasNext).toBe(false);
	});
});
