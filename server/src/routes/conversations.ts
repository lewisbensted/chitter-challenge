import express, { Request, Response } from "express";
import { authenticator } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import prisma from "../../prisma/prismaClient.js";
import type { IConversation } from "../../types/responses.js";
import type { ExtendedMessageClient, ExtendedUserClient } from "../../types/extendedClients.js";

const router = express.Router({ mergeParams: true });

const userClient = prisma.user as unknown as ExtendedUserClient;
const messageClient = prisma.message as unknown as ExtendedMessageClient;

export const fetchConversations = async (userId: string, interlocutorIds?: string[]) => {
	const messages = await messageClient.findMany({
		where: {
			OR: [
				{
					sender: { uuid: userId },
					recipient: interlocutorIds ? { uuid: { in: interlocutorIds } } : undefined,
				},
				{
					recipient: { uuid: userId },
					sender: interlocutorIds ? { uuid: { in: interlocutorIds } } : undefined,
				},
			],
		},
		orderBy: { createdAt: "desc" },
	});

	const conversations = new Map<string, IConversation>();
	for (const message of messages) {
		const otherUser = message.sender.uuid === userId ? message.recipient : message.sender;
		if (!conversations.has(otherUser.uuid)) {
			conversations.set(otherUser.uuid, {
				interlocutorId: otherUser.uuid,
				interlocutorUsername: otherUser.username,
				unread: false,
				latestMessage: {
					text: message.messageStatus.isDeleted ? null : message.text,
					senderId: message.sender.uuid,
					createdAt: message.createdAt,
					messageStatus: {
						isRead: message.messageStatus.isRead,
						isDeleted: message.messageStatus.isDeleted,
					},
				},
			});
		}

		if (!message.messageStatus.isRead && message.recipient.uuid === userId && !message.messageStatus.isDeleted) {
			const conversation = conversations.get(otherUser.uuid);
			if (conversation?.unread === false) {
				conversation.unread = true;
			}
		}
	}
	if (interlocutorIds) {
		for (const id of interlocutorIds) {
			if (!conversations.has(id)) {
				const user = await userClient.findUnique({ where: { uuid: id } });
				if (user && user.uuid!==userId) {
					conversations.set(id, {
						interlocutorId: user.uuid,
						interlocutorUsername: user.username,
						unread: false,
						latestMessage: null,
					});
				}
			}
		}
	}
	return Array.from(conversations.values());
};

router.get("/", authenticator, async (req: Request, res: Response) => {
	try {
		const userIds  = req.query.userIds?(req.query.userIds as string).split(","): undefined;
		const conversations = await fetchConversations(req.session.user!.uuid, userIds);
		res.status(200).json(conversations);
	} catch (error) {
		console.error("Error retrieving messages from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
