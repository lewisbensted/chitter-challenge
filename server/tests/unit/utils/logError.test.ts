import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { logError } from "../../../src/utils/logError";
import { ZodError, ZodIssue } from "zod";

describe("logError()", () => {
	let consoleErrorSpy;
	beforeEach(() => {
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());
	});
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
		logError(zodError)
		expect(consoleErrorSpy).toHaveBeenCalledWith(`\nValidation Error(s):\n${zodError.message}\n`);
	});
	test("Error object", () => {
		logError(new Error("Error message"));
		expect(consoleErrorSpy).toHaveBeenCalledWith("\nError message\n");
	});
	test("Non-error object", () => {
		logError("Non-error message");
		expect(consoleErrorSpy).toHaveBeenCalledWith("\nNon-error message\n");
	});
	test("Prisma initialisation error P1003", () => {
		const prismaError = new PrismaClientInitializationError("Cannot connect to database", "", "P1003");
		logError(prismaError);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"\nCannot connect to database\n\nHave all migrations been executed successfully?\n"
		);
	});
	test("Prisma table error P2021", () => {
		const prismaError = new PrismaClientKnownRequestError("Table does not exist", {
			code: "P2021",
			clientVersion: "",
		});
		logError(prismaError);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"\nTable does not exist\n\nHave all migrations been executed successfully?\n"
		);
	});
});
