import { describe, expect, test } from "vitest";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import { sendErrorResponse } from "./../../../src/utils/sendErrorResponse";
import { ZodError } from "zod";
import { createMockRes } from "../../test-utils/createMockRes";

describe("sendErrorResponse()", () => {
	describe("Unique constraint", () => {
		test("No constraint key", () => {
			const mockRes = createMockRes();
			const prismaError = Object.create(PrismaClientKnownRequestError.prototype);
			prismaError.message = "Unique constraint failed.";
			prismaError.code = "P2002";
			sendErrorResponse(prismaError, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(409);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: [] });
		});
		test("Invalid constraint key", () => {
			const mockRes = createMockRes();
			const prismaError = Object.create(PrismaClientKnownRequestError.prototype);
			prismaError.message = "Unique constraint failed.";
			prismaError.code = "P2002";
			prismaError.meta = { target: "Invalid_key" };
			sendErrorResponse(prismaError, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(409);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: [] });
		});
		test("Valid constraint key", () => {
			const mockRes = createMockRes();
			const prismaError = Object.create(PrismaClientKnownRequestError.prototype);
			prismaError.message = "Unique constraint failed.";
			prismaError.code = "P2002";
			prismaError.meta = { target: "Users_email_key" };
			sendErrorResponse(prismaError, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(409);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["Email address already taken."],
			});
		});
	});
	describe("Foreign key constraint", () => {
		test("No constraint key", () => {
			const mockRes = createMockRes();
			const prismaError = Object.create(PrismaClientKnownRequestError.prototype);
			prismaError.message = "Foreign key constraint failed.";
			prismaError.code = "P2003";
			sendErrorResponse(prismaError, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["The item you are trying to reference could not be found."],
			});
		});
		test("Invalid constraint key", () => {
			const mockRes = createMockRes();
			const prismaError = Object.create(PrismaClientKnownRequestError.prototype);
			prismaError.message = "Foreign key constraint failed.";
			prismaError.code = "P2003";
			prismaError.meta = { constraint: ["cheet"] };
			sendErrorResponse(prismaError, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["The item you are trying to reference could not be found."],
			});
		});
		test("Valid constraint key", () => {
			const mockRes = createMockRes();
			const prismaError = Object.create(PrismaClientKnownRequestError.prototype);
			prismaError.message = "Foreign key constraint failed.";
			prismaError.code = "P2003";
			prismaError.meta = { constraint: ["cheet_id"] };
			sendErrorResponse(prismaError, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["The Cheet you are trying to reference could not be found."],
			});
		});
	});
	describe("Resource not found", () => {
		test("modelName not provided", () => {
			const mockRes = createMockRes();
			const prismaError = Object.create(PrismaClientKnownRequestError.prototype);
			prismaError.message = "Resource not found.";
			prismaError.code = "P2025";
			sendErrorResponse(prismaError, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["The item you are trying to access could not be found."],
			});
		});
		test("modelName provided", () => {
			const mockRes = createMockRes();
			const prismaError = Object.create(PrismaClientKnownRequestError.prototype);
			prismaError.message = "Resource not found.";
			prismaError.code = "P2025";
			prismaError.meta = { modelName: "Cheet" };
			sendErrorResponse(prismaError, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["The Cheet you are trying to access could not be found."],
			});
		});
	});
	describe("Zod validation", () => {
		test("Zod validation", () => {
			const mockRes = createMockRes();
			const zodError = Object.create(ZodError.prototype);
			zodError.issues = [
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
			sendErrorResponse(zodError, mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["Username must be at least 2 characters", "Email is required"],
			});
		});
	});
	describe("Fallback", () => {
		test("Non-error object", () => {
			const mockRes = createMockRes();
			sendErrorResponse("Non-error object", mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["Internal server error."],
			});
		});
		test("Error object", () => {
			const mockRes = createMockRes();
			sendErrorResponse(new Error("Error object"), mockRes);
			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["Internal server error."],
			});
		});
	});
});
