import { Prisma } from "@prisma/client";
import { CreateMessageSchema, UpdateMessageSchema } from "../../src/schemas/message.schema.js";
import { userFilters } from "./userExtension.js";
import type { IMessage } from "../../types/responses.js";
import prisma from "../prismaClient.js";

export const messageFilters = {
	include: {
		messageStatus: { omit: { messageId: true } },
		sender: userFilters,
		recipient: userFilters,
	},
	omit: { id: true, senderId: true, recipientId: true },
};

export const messageExtension = Prisma.defineExtension({
	query: {
		message: {
			async findFirst({ args, query }): Promise<IMessage | null> {
				const message = await query({
					...args,
					...messageFilters,
				});
				return message as unknown as IMessage | null;
			},
			async findMany({ args, query }): Promise<IMessage[]> {
				const messages = await query({
					...args,
					...messageFilters,
				});
				return messages as unknown as IMessage[];
			},
			async findUniqueOrThrow({ args, query }): Promise<IMessage> {
				const message = await query({
					...args,
					...messageFilters,
				});
				return message as unknown as IMessage;
			},
			async create({ args, query }): Promise<IMessage> {
				const parsedData = await CreateMessageSchema.parseAsync(args.data);
				const message = await query({ ...args, data: parsedData, ...messageFilters });
				return message as unknown as IMessage;
			},
			async update({ args, query }): Promise<IMessage> {
				const parsedData = await UpdateMessageSchema.parseAsync(args.data);
				const message = await query({ ...args, data: parsedData, ...messageFilters });
				return message as unknown as IMessage;
			},
		},
	},
});

export const messageStatusExtension = Prisma.defineExtension({
	model: {
		messageStatus: {
			async softDelete(messageId: string): Promise<IMessage> {
				const message = await prisma.messageStatus.update({
					where: { messageId: messageId },
					data: { isDeleted: true },
					include: {
						message: messageFilters,
					},
				});
				return message.message as unknown as IMessage;
			},
		},
	},
});
