import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { User } from "@prisma/client";
import prisma from "../../prisma/prismaClient.js";
import { IConversation } from "../../types/responses.js";

const router = express.Router({ mergeParams: true });

export const fetchConversations = async (userId: string, interlocutor?: User) => {
	const messages = await prisma.message.findMany({
		include: { messageStatus: true, sender: true, recipient: true },
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
			if (message.recipient.uuid === userId && message.messageStatus?.isRead===false && !message.messageStatus.isDeleted) {
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
						text: message.messageStatus?.isDeleted ? null : message.text,
						senderId: message.sender.uuid,
						createdAt: message.createdAt,
						messageStatus: {
							isRead: message.messageStatus?.isRead ===true ,
							isDeleted: message.messageStatus?.isDeleted === true,
						},
					},
				});
			}

			if (
				message.messageStatus?.isRead ===false &&
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

router.get("/", authMiddleware, async (req: Request, res: Response) => {
	try {
		const conversations = await fetchConversations(req.session.user!.uuid);
		res.status(200).json(conversations);
	} catch (error) {
		console.error("Error retrieving messages from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.get("/:userId", authMiddleware, async (req: Request, res: Response) => {
	try {
		const user = await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		const conversation = await fetchConversations(req.session.user!.uuid, user);
		res.status(200).json(conversation);
	} catch (error) {
		console.error("Error retrieving user from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
