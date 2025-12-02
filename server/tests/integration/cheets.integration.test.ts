import { describe, expect, test } from "vitest";

describe("Integration tests - Cheet routes", () => {
	describe("Fetch cheets at route [GET] /cheets", () => {
		test("Success - no userId provided", () => {
			expect(true).toBe(false);
		});
		test("Success - userId provided", () => {
			expect(true).toBe(false);
		});
		test("Success - empty return", () => {
			expect(true).toBe(false);
		});
		test("Failure - DB error", () => {
			expect(true).toBe(false);
		});
	});
	describe("Send cheet at route [POST] /cheets", () => {
		test("Success", () => {
			expect(true).toBe(false);
		});
		test("Failure - DB error", () => {
			expect(true).toBe(false);
		});
	});
	describe("Edit cheet at route [PUT] /cheets/:cheetId", () => {
		test("Success", () => {
			expect(true).toBe(false);
		});
		test("Failure - DB error", () => {
			expect(true).toBe(false);
		});
	});
	describe("Delete cheet at route [DELETE] /cheets/:cheetId", () => {
		test("Success", () => {
			expect(true).toBe(false);
		});
		test("Failure - DB error", () => {
			expect(true).toBe(false);
		});
	});
});
