import { z } from "zod";

export const CreateMessageSchema = z.object({
	id: z.number().optional(),
	senderId: z.string({ required_error: "Sender ID not provided." }),
	recipientId: z.string({ required_error: "Recipient ID not provided." }),
	text: z
		.string({ required_error: "Message not provided." })
		.min(1, "Message cannot be empty.")
		.max(200, "Message can be at most 200 characters."),
	createdAt: z.date(),
	updatedAt: z.date(),
	isRead: z.boolean().optional(),
});

export const UpdateMessageSchema = z.object({
	text: z
		.string({ required_error: "Message not provided." })
		.min(1, "Message cannot be empty.")
		.max(200, "Message can be at most 200 characters."),
	updatedAt: z.date(),
});
