import express, { Request, Response } from "express";
import { authenticator } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import prisma from "../../prisma/prismaClient.js";
import { ExtendedConversationClient } from "../../types/extendedClients.js";

const conversationClient = prisma.conversation as unknown as ExtendedConversationClient;

const router = express.Router({ mergeParams: true });

const fetchConversations = async (userId: string, interlocutorIds?: string[], cursor?: string, take?: number) => {
	const conversations = await conversationClient.findMany({
		where: interlocutorIds?.length
			? {
				OR: [
					{ user1Id: userId, user2Id: { in: interlocutorIds } },
					{ user2Id: userId, user1Id: { in: interlocutorIds } },
				],
			}
			: { OR: [{ user1Id: userId }, { user2Id: userId }] },
		orderBy: { latestMessage: { createdAt: "desc" } },
		...(take ? { take: take + 1 } : {}),
		...(cursor ? { cursor: { key: cursor }, skip: 1 } : {}),
	});

	let hasNext = false;
	if (take && conversations.length > take) {
		hasNext = true;
		conversations.pop();
	}

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

router.get("/unread", authenticator, async (req: Request, res: Response) => {
	try {
		const unreadMessages = await prisma.conversation.findFirst({
			where: {
				OR: [
					{ user1Id: req.session.user!.uuid, user1Unread: true },
					{ user2Id: req.session.user!.uuid, user2Unread: true },
				],
			},
		});
		res.status(200).json(!!unreadMessages);
	} catch (error) {
		console.error("Error retrieving unread messages from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.get("/", authenticator, async (req: Request, res: Response) => {
	try {
		let take: number | undefined;
		let cursor: string | undefined;
		const userIds = req.query.userIds ? (req.query.userIds as string).split(",") : undefined;
		if (!userIds?.length) {
			take = Math.min(req.query.take && Number(req.query.take) > 0 ? Number(req.query.take) : 10, 50);
			cursor = req.query.cursor as string | undefined;
		}
		const conversations = await fetchConversations(req.session.user!.uuid, userIds, cursor, take);
		res.status(200).json(conversations);
	} catch (error) {
		console.error("Error retrieving messages from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
