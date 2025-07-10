import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import { Response } from "express";
import { ZodError } from "zod";

export const sendErrorResponse = (error: unknown, res: Response) => {
	if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
		res.status(404).json({ errors: [error.meta?.cause] });
	} else if (error instanceof ZodError) {
		const errors = error.errors.map((err) => err.message);
		res.status(400).json({errors: errors});
	} else {
		res.status(500).json({ errors: ["An unexpected error occured."] });
	}
};
