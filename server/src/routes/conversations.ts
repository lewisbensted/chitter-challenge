import express, { Request, Response } from "express";
import { authenticator } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import prisma, { ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import { FetchConversationsType, fetchConversations } from "../utils/fetchConversations.js";

const router = express.Router({ mergeParams: true });

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

export const getConversationsHandler =
	(prismaClient: ExtendedPrismaClient, fetchFn: FetchConversationsType) => async (req: Request, res: Response) => {
		try {
			let cursor = (req.query.cursor as string | undefined)?.trim();

			const take = Math.min(req.query.take && Number(req.query.take) > 0 ? Number(req.query.take) : 10, 50);

			const userIds =
				req.query.userIds === undefined ? undefined : (req.query.userIds as string).split(",").filter(Boolean);
				
			if (cursor) {
				const convoExists = await prismaClient.conversation.findUnique({ where: { key: cursor } });
				if (!convoExists) cursor = undefined;
			}
			const conversations = await fetchFn(prismaClient, take, req.session.user!.uuid, userIds, cursor);
			res.status(200).json(conversations);
		} catch (error) {
			console.error("Error retrieving messages from the database:\n" + logError(error));
			sendErrorResponse(error, res);
		}
	};

router.get("/", authenticator, getConversationsHandler(prisma, fetchConversations));

export default router;
