import type { ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import { generateConversationKey } from "./generateConversationKey.js";

export const readMessages = async (prismaClient: ExtendedPrismaClient, userId: string, interlocutorId: string) =>
	await prismaClient.$transaction(async (transaction) => {
		const readMessages = await transaction.messageStatus.updateMany({
			where: {
				message: { recipientId: userId, senderId: interlocutorId },
				isRead: false,
			},
			data: { isRead: true },
		});
		const [firstUser, secondUser] = [userId, interlocutorId].sort();
		const convoKey = generateConversationKey(firstUser, secondUser);
		const isFirstUserSession = firstUser === userId;
		await transaction.conversation.update({
			where: { key: convoKey },
			data: { ...(isFirstUserSession ? { user1Unread: false } : { user2Unread: false }) },
		});
		return readMessages.count;
	});

export type ReadMessagesType = typeof readMessages;