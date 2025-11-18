import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import { Response } from "express";
import { ZodError } from "zod";

const constraintModelMap: Record<string, string> = {
	cheet_id: "Cheet",
	user_id: "User",
	message_id: "Message",
	following_id: "User",
	follower_id: "User",
	recipient_id: "User",
	sender_id: "User",
};

const constraintErrorMap: Record<string, string> = {
	Users_username_key: "Username already taken.",
	Users_email_key: "Email address already taken.",
	Follows_followerId_followingId_key: "You are already following this user.",
};

export const sendErrorResponse = (error: unknown, res: Response) => {
	if (error instanceof PrismaClientKnownRequestError) {
		switch (error.code) {
			case "P2002": {
				const constraint = typeof error.meta?.target === "string" ? error.meta.target : undefined;
				const errorMessage = constraint ? constraintErrorMap[constraint] : "";
				return res.status(409).json({
					errors: errorMessage ? [errorMessage] : [],
				});
			}
			case "P2003": {
				const constraint =
					Array.isArray(error.meta?.constraint) && typeof error.meta.constraint[0] == "string"
						? error.meta.constraint[0]
						: undefined;
				const model = constraint ? constraintModelMap[constraint] : undefined;

				return res.status(404).json({
					errors: [`The ${model ?? "item"} you are trying to reference could not be found.`],
				});
			}
			case "P2025": {
				const modelName = typeof error.meta?.modelName === "string" ? error.meta.modelName : undefined;
				return res.status(404).json({
					errors: [`The ${modelName ?? "item"} you are trying to access could not be found.`],
				});
			}
			default:
				break;
		}
	} else if (error instanceof ZodError) {
		const errors = error.errors.map((err) => err.message);
		return res.status(400).json({ errors: errors });
	}
	return res.status(500).json({
		errors: ["Internal server error."],
	});
};
