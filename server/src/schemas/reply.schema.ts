import { z } from "zod";

export const CreateReplySchema = z.object({
	id: z.number().optional(),
	userId: z.string({ required_error: "User ID not provided." }),
	text: z
		.string({ required_error: "Text not provided." })
		.min(5, "Reply too short - must be between 5 and 50 characters.")
		.max(50, "Reply too long - must be between 5 and 50 characters."),
	cheetId: z.string({ required_error: "Cheet ID not provided" }),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

export const UpdateReplySchema = z.object({
	text: z
		.string({ required_error: "Text not provided." })
		.min(5, "Reply too short - must be between 5 and 50 characters.")
		.max(50, "Reply too long - must be between 5 and 50 characters."),
	updatedAt: z.date().optional(),
});
