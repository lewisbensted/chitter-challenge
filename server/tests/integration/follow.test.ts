import { describe, expect, test } from "vitest";

describe("Integration tests - Follow routes", () => {
	describe("Follow user at route [POST] /follow", () => {
		test("Success", () => expect(true).toBe(false)); //check cookie
		test("Failure - DB error", () => expect(true).toBe(false));
	});
	describe("Unfollow user at route [DELETE] /follow", () => {
		test("Success", () => expect(true).toBe(false));
		test("Success - already unfollowed", () => expect(true).toBe(false));
		test("Failure - DB error", () => expect(true).toBe(false));
	});
});
