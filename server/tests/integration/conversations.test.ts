import { describe, expect, test } from "vitest";

describe("Integration tests - Conversation routes", () => {
	describe("Get unread boolean at route [GET] /conversations/unread", () => {
		test("Success", () => {
			expect(true).toBe(false);
		});
		test("Failure - DB error", () => {
			expect(true).toBe(false);
		});
	});
    describe("Get conversations at route [GET] /conversations", () => {
		test("Success - userIds provided", () => {
			expect(true).toBe(false);
		});
        test("Success - no userIds provided", () => {
			expect(true).toBe(false);
		});
        test("Success - empty return", () => {
			expect(true).toBe(false);
		});
        test("Success - cursor and take", () => {
			expect(true).toBe(false);
		});
		test("Failure - DB error", () => {
			expect(true).toBe(false);
		});
	});
});
