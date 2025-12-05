import { ZodError } from "zod";

export const logError = (error: unknown) =>
	console.error(
		"\n" +
			(error instanceof ZodError ? "Validation Error(s):\n" : "") +
			(error instanceof Error ? error.message.replace(/\n\n/g, "\n") : String(error)) +
			(error &&
			typeof error == "object" &&
			(("errorCode" in error && error.errorCode === "P1003") || ("code" in error && error.code === "P2021"))
				? "\n\nHave all migrations been executed successfully?"
				: "") +
			"\n"
	);
