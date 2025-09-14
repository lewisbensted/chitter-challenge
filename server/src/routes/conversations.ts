import express, { Request, Response } from "express";
import { authenticator } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import prisma from "../../prisma/prismaClient.js";
import type { IConversation, IUser } from "../../types/responses.js";
import type { ExtendedMessageClient, ExtendedUserClient } from "../../types/extendedClients.js";

const router = express.Router({ mergeParams: true });

const userClient = prisma.user as unknown as ExtendedUserClient;
const messageClient = prisma.message as unknown as ExtendedMessageClient;

export const fetchConversations = async (userId: string, interlocutor?: IUser) => {
	const messages = await messageClient.findMany({
		where: {
			OR: [
				{ sender: { uuid: userId }, recipient: interlocutor ? { uuid: interlocutor.uuid } : undefined },
				{ recipient: { uuid: userId }, sender: interlocutor ? { uuid: interlocutor.uuid } : undefined },
			],
		},
		orderBy: { createdAt: "desc" },
	});

	if (interlocutor) {
		let unread = false;
		for (const message of messages) {
			if (message.recipient.uuid === userId && !(message.messageStatus.isRead) && !message.messageStatus.isDeleted) {
				unread = true;
				break;
			}
		}
		return [{ interlocutorId: interlocutor.uuid, interlocutorUsername: interlocutor.username, unread: unread }];
	} else {
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
							isRead: message.messageStatus.isRead ,
							isDeleted: message.messageStatus.isDeleted,
						},
					},
				});
			}

			if (
				!(message.messageStatus.isRead) &&
				message.recipient.uuid === userId &&
				!(message.messageStatus.isDeleted)
			) {
				const conversation = conversations.get(otherUser.uuid);
				if (conversation?.unread === false) {
					conversation.unread = true;
				}
			}
		}
		return Array.from(conversations.values());
	}
};

router.get("/", authenticator, async (req: Request, res: Response) => {
	try {
		const conversations = await fetchConversations(req.session.user!.uuid);
		res.status(200).json(conversations);
	} catch (error) {
		console.error("Error retrieving messages from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.get("/:userId", authenticator, async (req: Request, res: Response) => {
	try {
		const user = await userClient.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		const conversation = await fetchConversations(req.session.user!.uuid, user);
		res.status(200).json(conversation);
	} catch (error) {
		console.error("Error retrieving user from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
