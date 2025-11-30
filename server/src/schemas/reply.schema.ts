import { z } from "zod";

const isTestEnv = process.env.NODE_ENV === "test";

export const CreateReplySchema = z
	.object({
		uuid: z.string().optional(),
		userId: z.string({ required_error: "User ID not provided." }),
		cheetId: z.string({ required_error: "Cheet ID not provided" }),
		text: z
			.string({ required_error: "Text not provided." })
			.trim()
			.min(5, "Reply too short - must be between 5 and 50 characters.")
			.max(50, "Reply too long - must be between 5 and 50 characters."),
		createdAt: z.date().optional(),
		updatedAt: z.date().optional(),
	})
	.omit(isTestEnv ? {} : { uuid: true })
	.strip();

export const UpdateReplySchema = z
	.object({
		text: z
			.string({ required_error: "Text not provided." })
			.trim()
			.min(5, "Reply too short - must be between 5 and 50 characters.")
			.max(50, "Reply too long - must be between 5 and 50 characters."),
	})
	.strip();
