import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import { Response } from "express";
import { ZodError } from "zod";

const constraintMap = {
	Users_username_key: "Username",
	Users_email_key: "Email",
	cheet_id: "Cheet",
	following_id: "User",
	recipient_id: "User",
};

export const sendErrorResponse = (error: unknown, res: Response) => {
	if (error instanceof PrismaClientKnownRequestError) {
		switch (error.code) {
			case "P2002": {
				const constraint = error.meta?.target as string;
				const fieldName = constraintMap[constraint as keyof typeof constraintMap] ?? constraint;
				return res.status(409).json({
					errors: [
						fieldName === "Follows_followerId_followingId_key"
							? "You are already following this user."
							: `${fieldName} already taken.`,
					],
				});
			}
			case "P2025": {
				const modelName = typeof error.meta?.modelName === "string" ? error.meta.modelName : undefined;
				return res.status(404).json({ errors: [`Resource not found${modelName ? `: ${modelName}` : ""}.`] });
			}
			case "P2003": {
				const constraint = Array.isArray(error.meta?.constraint) ? error.meta.constraint[0] : undefined;
				const modelName = constraintMap[constraint as keyof typeof constraintMap] ?? constraint;
				return res
					.status(404)
					.json({ errors: [`Related resource not found${modelName ? `: ${modelName}` : ""}.`] });
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
