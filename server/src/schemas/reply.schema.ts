import { z } from "zod";

export const CreateReplySchema = z
	.object({
		userId: z.string({ required_error: "User ID not provided." }),
		cheetId: z.string({ required_error: "Cheet ID not provided" }),
		text: z
			.string({ required_error: "Text not provided." })
			.trim()
			.min(5, "Reply too short - must be between 5 and 50 characters.")
			.max(50, "Reply too long - must be between 5 and 50 characters."),
	})

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

export const FullReplySchema = z
	.object({
		id: z.number(),
		uuid: z.string(),
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

	.strip();
