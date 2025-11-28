import type { ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import type { ExtendedMessageClient } from "../../types/extendedClients.js";

export const fetchMessages = async (
	prismaClient: ExtendedPrismaClient,
	take: number,
	userId: string,
	interlocutorId: string,
	cursor?: string
) => {
	const messages = await (prismaClient.message as unknown as ExtendedMessageClient).findMany({
		where: {
			OR: [
				{ senderId: userId, recipientId: interlocutorId },
				{ senderId: interlocutorId, recipientId: userId },
			],
		},
		orderBy: { createdAt: "desc" },
		take: take + 1,
		...(cursor && { skip: 1 }),
		...(cursor && { cursor: { uuid: cursor } }),
	});
	const hasNext = take > 0 && messages.length > take;
	if (hasNext || take === 0) messages.pop();
	const formattedMessages = messages.map((message) => ({
		...message,
		text: message.messageStatus.isDeleted ? null : message.text,
	}));
	return { messages: formattedMessages.reverse(), hasNext };
};
export type FetchMessagesType = typeof fetchMessages;
