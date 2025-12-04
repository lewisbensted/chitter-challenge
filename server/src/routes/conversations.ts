import express, { NextFunction, Request, Response } from "express";
import { authenticator } from "../middleware/authentication.js";
import  { type ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import { type FetchConversationsType, fetchConversations } from "../utils/fetchConversations.js";

const router = express.Router({ mergeParams: true });

export const getUnreadHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const sessionUser = req.session.user;
			if (!sessionUser) return res.status(401).json({ errors: ["Unauthorised."] });
			const unreadMessages = await prismaClient.conversation.findFirst({
				where: {
					OR: [
						{ user1Id: sessionUser.uuid, user1Unread: true },
						{ user2Id: sessionUser.uuid, user2Unread: true },
					],
				},
			});
			res.status(200).json(!!unreadMessages);
		} catch (error) {
			console.error("Error retrieving unread messages from the database:\n");
			next(error);
		}
	};

export const getConversationsHandler =
	(prismaClient: ExtendedPrismaClient, fetchFn: FetchConversationsType) =>
		async (req: Request, res: Response, next: NextFunction) => {
			try {
				const sessionUser = req.session.user;
				if (!sessionUser) return res.status(401).json({ errors: ["Unauthorised."] });
				let cursor = (req.query.cursor as string | undefined)?.trim();

				const take = Math.min(req.query.take && Number(req.query.take) > 0 ? Number(req.query.take) : 10, 50);

				const userIds =
				req.query.userIds === undefined
					? undefined
					: (req.query.userIds as string)
						.split(",")
						.map((id) => id.trim())
						.filter(Boolean);

				if (cursor) {
					const convoExists = await prismaClient.conversation.findUnique({ where: { key: cursor } });
					if (!convoExists) cursor = undefined;
				}
				const conversations = await fetchFn(prismaClient, take, sessionUser.uuid, userIds, cursor);
				res.status(200).json(conversations);
			} catch (error) {
				console.error("Error retrieving messages from the database:\n");
				next(error);
			}
		};

export default (prismaClient: ExtendedPrismaClient) => {
	const router = express.Router({ mergeParams: true });

	router.get("/unread", authenticator, getUnreadHandler(prismaClient));
	router.get("/", authenticator, getConversationsHandler(prismaClient, fetchConversations));

	return router;
};

