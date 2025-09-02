import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Response } from "express";
import { ZodError } from "zod";

const constraintMap = {
	Users_username_key: "Username",
	Users_email_key: "Email",
};

export const sendErrorResponse = (error: unknown, res: Response) => {
	if (error instanceof PrismaClientKnownRequestError) {
		switch (error.code) {
			case "P2002": {
				const constraint = error.meta?.target as string;
				const fieldName =
					constraint in constraintMap ? constraintMap[constraint as keyof typeof constraintMap] : constraint;
				return res.status(409).json({ errors: [`${fieldName} already taken.`] });
			}
			case "P2025": {
				const modelName = typeof error.meta?.modelName === "string" ? error.meta.modelName : "Resource";
				return res.status(404).json({ errors: [`${modelName} not found.`] });
			}
			case "P2003": {
				return res.status(404).json({ errors: ["Related resource not found."] });
			}
			default:
				break;
		}
	} else if (error instanceof ZodError) {
		const errors = error.errors.map((err) => err.message);
		return res.status(400).json({ errors: errors });
	}
	return res.status(500).json({ errors: ["Internal server error."] });
};
