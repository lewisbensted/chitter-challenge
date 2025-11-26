import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { describe, expect, test } from "vitest";
import { logError } from "../../../src/utils/logError";
import { ZodError } from "zod";

describe("logError() function", () => {
	test("Zod error", () => {
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
		expect(logError(zodError)).toBe(`\nValidation Error(s):\n${zodError.message}\n`);
	});
	test("Error object", () => {
		expect(logError(new Error("Error message"))).toBe("\nError message\n");
	});
	test("Non-error object", () => {
		expect(logError("Non-error message")).toBe("\nNon-error message\n");
	});
	test("Prisma initialisation error P1003", () => {
		const prismaError = Object.create(PrismaClientInitializationError.prototype);
		prismaError.errorCode = "P1003";
		prismaError.message = "Cannot connect to database";
		expect(logError(prismaError)).toBe(
			"\nCannot connect to database\n\nHave all migrations been executed successfully?\n"
		);
	});
	test("Prisma table error P2021", () => {
		const prismaError = Object.create(PrismaClientKnownRequestError.prototype);
		prismaError.code = "P2021";
		prismaError.message = "Table does not exist";
		expect(logError(prismaError)).toBe(
			"\nTable does not exist\n\nHave all migrations been executed successfully?\n"
		);
	});
});
