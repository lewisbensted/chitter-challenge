import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Response } from "express";
import { ZodError } from "zod";

export const sendErrorResponse = (error: unknown, res: Response) => {
	if (error instanceof TypeError) {
		res.status(400).send([error.message]);
	} else if (
		error instanceof PrismaClientKnownRequestError &&
		error.code == "P2025"
	) {
		res.status(404).send([error.message + " with ID provided."]);
	} else if (error instanceof ZodError) {
		const errors = error.errors.map((err) => err.message);
		res.status(400).send(errors);
	} else {
		res.status(500).send(["An unexpected error occured."]);
	}
};