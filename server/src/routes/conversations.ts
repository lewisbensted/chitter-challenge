import express, { Request, Response } from "express";
import { authenticator } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import prisma from "../../prisma/prismaClient.js";
import { ExtendedConversationClient } from "../../types/extendedClients.js";

const conversationClient = prisma.conversation as unknown as ExtendedConversationClient;

const router = express.Router({ mergeParams: true });

const fetchConversations = async (userId: string, interlocutorIds?: string[]) => {
	const conversations = await conversationClient.findMany({
		where: interlocutorIds?.length
			? {
					OR: [
						{ user1Id: userId, user2Id: { in: interlocutorIds } },
						{ user2Id: userId, user1Id: { in: interlocutorIds } },
					],
				}
			: { OR: [{ user1Id: userId }, { user2Id: userId }] },
	});
	const sanitisedConvos = conversations.map((convo) => {
		const { user1, user2, latestMessage, user1Unread, user2Unread } = convo;
		const isFirstUserSession = user1.uuid === userId;
		return {
			interlocutorId: isFirstUserSession ? user2.uuid : user1.uuid,
			interlocutorUsername: isFirstUserSession ? user2.username : user1.username,
			latestMessage: latestMessage,
			unread: isFirstUserSession ? user1Unread : user2Unread,
		};
	});
	return sanitisedConvos;
};

router.get("/", authenticator, async (req: Request, res: Response) => {
	try {
		const userIds = req.query.userIds ? (req.query.userIds as string).split(",") : undefined;
		const conversations = await fetchConversations(req.session.user!.uuid, userIds);
		res.status(200).json(conversations);
	} catch (error) {
		console.error("Error retrieving messages from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
