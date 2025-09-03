import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export const logError = (error: unknown) => (
	"\n" +
		(error instanceof ZodError ? "Validation Error(s):\n" : "") +
		(error instanceof Error ? error.message.replace(/\n\n/g, "\n") : "An unknown error has occured.") +
		((error instanceof Prisma.PrismaClientInitializationError && error.errorCode === "P1003") ||
		(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021")
			? "\n\nHave all migrations been executed successfully?"
			: "") +
		"\n"
);
