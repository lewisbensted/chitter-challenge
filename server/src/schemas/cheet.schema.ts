import { z } from "zod";

export const CreateCheetSchema = z.object({
	id: z.number().optional(),
	userId: z.string({ required_error: "User ID not provided." }),
	text: z
		.string({ required_error: "Text not provided." })
		.min(5, "Cheet too short - must be between 5 and 50 characters.")
		.max(50, "Cheet too long - must be between 5 and 50 characters."),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

export const UpdateCheetSchema = z.object({
	text: z
		.string({ required_error: "Text not provided." })
		.min(5, "Cheet too short - must be between 5 and 50 characters.")
		.max(50, "Cheet too long - must be between 5 and 50 characters."),
	updatedAt: z.date().optional(),
});
