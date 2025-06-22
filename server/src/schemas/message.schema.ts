import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

export const CreateMessageSchema = z
	.object({
		id: z.number().optional(),
		senderId: z.string({ required_error: "Sender ID not provided." }),
		recipientId: z.string({ required_error: "Recipient ID not provided." }),
		text: z
			.string({ required_error: "Message not provided." })
			.trim()
			.min(1, "Message cannot be empty.")
			.max(200, "Message can be at most 200 characters."),
		createdAt: z.date().optional(),
		updatedAt: z.date().optional(),
		isRead: z.boolean().optional(),
	})
	.omit(isProduction ? { updatedAt: true, createdAt: true } : {})
	.strip();

export const UpdateMessageSchema = z
	.object({
		text: z
			.string({ required_error: "Message not provided." })
			.trim()
			.min(1, "Message cannot be empty.")
			.max(200, "Message can be at most 200 characters."),
		updatedAt: z.date().optional(),
	})
	.omit(isProduction ? { updatedAt: true } : {})
	.strip();
