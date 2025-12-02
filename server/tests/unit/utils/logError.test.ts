import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { describe, expect, test } from "vitest";
import { logError } from "../../../src/utils/logError";
import { ZodError, ZodIssue } from "zod";

describe("logError()", () => {
	test("Zod error", () => {
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
		expect(logError(zodError)).toBe(`\nValidation Error(s):\n${zodError.message}\n`);
	});
	test("Error object", () => {
		expect(logError(new Error("Error message"))).toBe("\nError message\n");
	});
	test("Non-error object", () => {
		expect(logError("Non-error message")).toBe("\nNon-error message\n");
	});
	test("Prisma initialisation error P1003", () => {
		const prismaError = new PrismaClientInitializationError("Cannot connect to database", "", "P1003");
		expect(logError(prismaError)).toBe(
			"\nCannot connect to database\n\nHave all migrations been executed successfully?\n"
		);
	});
	test("Prisma table error P2021", () => {
		const prismaError = new PrismaClientKnownRequestError("Table does not exist", {
			code: "P2021",
			clientVersion: "",
		});
		expect(logError(prismaError)).toBe(
			"\nTable does not exist\n\nHave all migrations been executed successfully?\n"
		);
	});
});
