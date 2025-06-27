import { z } from "zod";

export const CreateMessageSchema = z
	.object({
		senderId: z.string({ required_error: "Sender ID not provided." }),
		recipientId: z.string({ required_error: "Recipient ID not provided." }),
		text: z
			.string({ required_error: "Message not provided." })
			.trim()
			.min(1, "Message cannot be empty.")
			.max(200, "Message can be at most 200 characters."),
	})
	.strip();

export const UpdateMessageSchema = z
	.object({
		text: z
			.string({ required_error: "Message not provided." })
			.trim()
			.min(1, "Message cannot be empty.")
			.max(200, "Message can be at most 200 characters."),
	})
	.strip();

export const FullMessageSchema = z
	.object({
		id: z.number(),
		uuid: z.string(),
		senderId: z.string({ required_error: "Sender ID not provided." }),
		recipientId: z.string({ required_error: "Recipient ID not provided." }),
		text: z
			.string({ required_error: "Message not provided." })
			.trim()
			.min(1, "Message cannot be empty.")
			.max(200, "Message can be at most 200 characters."),
		createdAt: z.date().optional(),
		updatedAt: z.date().optional(),
	})
	.strip();
