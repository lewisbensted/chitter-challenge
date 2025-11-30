import { z } from "zod";

const isTestEnv = process.env.NODE_ENV === "test";

export const CreateMessageSchema = z
	.object({
		uuid: z.string().optional(),
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
	.omit(isTestEnv ? {} : { uuid: true })
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
