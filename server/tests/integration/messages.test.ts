import { describe, expect, test } from "vitest";

describe("Integration tests - Message routes", () => {
	describe("Fetch messages at route [GET] /messages/:recipientId", () => {
		test("Success", () => {
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
	describe("Send message at route [POST] /messages/:recipientId", () => {
		test("Success", () => {
			expect(true).toBe(false);
		});
		test("Failure - DB error", () => {
			expect(true).toBe(false);
		});
	});
	describe("Edit message at route [PUT] /messages/:messageId", () => {
		test("Success", () => {
			expect(true).toBe(false);
		});
		test("Failure - DB error", () => {
			expect(true).toBe(false);
		});
	});
	describe("Delete message at route [DELETE] /messages/:messageId", () => {
		test("Success", () => {
			expect(true).toBe(false);
		});
		test("Failure - DB error", () => {
			expect(true).toBe(false);
		});
	});
	describe("Read messages at route [PUT] /messages/:recipientId/read", () => {
		test("Success", () => {
			expect(true).toBe(false);
		});
		test("Failure - DB error", () => {
			expect(true).toBe(false);
		});
	});
});
