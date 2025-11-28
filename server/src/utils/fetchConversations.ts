import type { ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import type { ExtendedConversationClient } from "../../types/extendedClients.js";

export const fetchConversations = async (
	prismaClient: ExtendedPrismaClient,
	take: number,
	userId: string,
	interlocutorIds?: string[],
	cursor?: string
) => {
	const conversations = await (prismaClient.conversation as unknown as ExtendedConversationClient).findMany({
		where: interlocutorIds
			? {
				OR: [
					{ user1Id: userId, user2Id: { in: interlocutorIds } },
					{ user2Id: userId, user1Id: { in: interlocutorIds } },
				],
			}
			: { OR: [{ user1Id: userId }, { user2Id: userId }] },
		orderBy: { latestMessage: { createdAt: "desc" } },
		...(interlocutorIds ? {} : { take: take + 1 }),
		...(cursor && !interlocutorIds && { cursor: { key: cursor }, skip: 1 }),
	});

	const hasNext = take > 0 && conversations.length > take;
	if (hasNext || take === 0) conversations.pop();

	const sanitisedConvos = conversations.map((convo) => {
		const { user1, user2, latestMessage, user1Unread, user2Unread, key } = convo;
		const isFirstUserSession = user1.uuid === userId;
		return {
			key: key,
			interlocutorId: isFirstUserSession ? user2.uuid : user1.uuid,
			interlocutorUsername: isFirstUserSession ? user2.username : user1.username,
			latestMessage: latestMessage,
			unread: isFirstUserSession ? user1Unread : user2Unread,
		};
	});
	return { conversations: sanitisedConvos, hasNext };
};

export type FetchConversationsType = typeof fetchConversations;
