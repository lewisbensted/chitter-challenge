import { beforeEach, describe, expect, test } from "vitest";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import { sendErrorResponse } from "../../../src/utils/sendErrorResponse";
import { ZodError, ZodIssue } from "zod";
import { Response } from "express";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";

describe("sendErrorResponse() function", () => {
	let mockRes: MockResponse;
	beforeEach(() => {
		mockRes = createMockRes();
	});
	describe("Unique constraint", () => {
		test("No constraint key", () => {
			const prismaError = new PrismaClientKnownRequestError("Unique constraint failed.", {
				code: "P2002",
				clientVersion: "",
			});
			sendErrorResponse(prismaError, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(409);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: [] });
		});
		test("Invalid constraint key", () => {
			const prismaError = new PrismaClientKnownRequestError("Unique constraint failed.", {
				code: "P2002",
				clientVersion: "",
				meta: { target: "Invalid_key" },
			});
			sendErrorResponse(prismaError, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(409);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: [] });
		});
		test("Valid constraint key", () => {
			const prismaError = new PrismaClientKnownRequestError("Unique constraint failed.", {
				code: "P2002",
				clientVersion: "",
				meta: { target: "Users_email_key" },
			});
			sendErrorResponse(prismaError, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(409);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["Email address already taken."],
			});
		});
	});
	describe("Foreign key constraint", () => {
		test("No constraint key", () => {
			const prismaError = new PrismaClientKnownRequestError("Foreign key constraint failed.", {
				code: "P2003",
				clientVersion: "",
			});
			sendErrorResponse(prismaError, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["The item you are trying to reference could not be found."],
			});
		});
		test("Invalid constraint key", () => {
			const prismaError = new PrismaClientKnownRequestError("Foreign key constraint failed.", {
				code: "P2003",
				clientVersion: "",
				meta: { constraint: ["cheet"] },
			});
			sendErrorResponse(prismaError, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["The item you are trying to reference could not be found."],
			});
		});
		test("Valid constraint key", () => {
			const prismaError = new PrismaClientKnownRequestError("Foreign key constraint failed.", {
				code: "P2003",
				clientVersion: "",
				meta: { constraint: ["cheet_id"] },
			});
			sendErrorResponse(prismaError, mockRes as unknown as Response);

			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["The Cheet you are trying to reference could not be found."],
			});
		});
	});
	describe("Resource not found", () => {
		test("modelName not provided", () => {
			const prismaError = new PrismaClientKnownRequestError("Resource not found.", {
				code: "P2025",
				clientVersion: "",
			});
			sendErrorResponse(prismaError, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["The item you are trying to access could not be found."],
			});
		});
		test("modelName provided", () => {
			const prismaError = new PrismaClientKnownRequestError("Resource not found.", {
				code: "P2025",
				clientVersion: "",
				meta: { modelName: "Cheet" },
			});
			sendErrorResponse(prismaError, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["The Cheet you are trying to access could not be found."],
			});
		});
	});
	describe("Zod validation", () => {
		test("Zod validation", () => {
			const issues: ZodIssue[] = [
				{
					code: "too_small",
					minimum: 2,
					type: "string",
					inclusive: true,
					message: "Username must be at least 2 characters",
					path: ["username"],
				},
				{
					code: "invalid_type",
					expected: "string",
					received: "undefined",
					message: "Email is required",
					path: ["email"],
				},
			];
			const zodError = new ZodError(issues);
			sendErrorResponse(zodError, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["Username must be at least 2 characters", "Email is required"],
			});
		});
	});
	describe("Fallback", () => {
		test("Non-error object", () => {
			sendErrorResponse("Non-error object", mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["Internal server error."],
			});
		});
		test("Error object", () => {
			sendErrorResponse(new Error("Error object"), mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["Internal server error."],
			});
		});
	});
});
