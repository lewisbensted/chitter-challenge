import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { User } from "@prisma/client";
import prisma from "../../prisma/prismaClient.js";

interface IConversation {
	interlocutorUsername: string;
	interlocutorId: string;
	unread: number;
	latestMessage?: { text: string; senderId: string; isRead: boolean; createdAt: Date };
}

const router = express.Router({ mergeParams: true });

export const fetchConversations = async (userId: number, interlocutor?: User) => {
	const messages = await prisma.message.findMany({
		include: { sender: true, recipient: true },
		where: {
			isDeleted: false, 
			OR: [
				{ senderId: userId, recipientId: interlocutor ? interlocutor.id : undefined },
				{ recipientId: userId, senderId: interlocutor ? interlocutor.id : undefined },
			],
		},
		orderBy: { createdAt: "desc" },
	});

	const conversations = messages.reduce(
		(result: IConversation[], message) => {
			if (message.senderId === userId) {
				if (
					!interlocutor &&
					!result.find((conversation) => conversation.interlocutorId === message.recipient.uuid)
				) {
					result.push({
						interlocutorId: message.recipient.uuid,
						interlocutorUsername: message.recipient.username,
						unread: 0,
						latestMessage: {
							text: message.text,
							isRead: message.isRead,
							senderId: message.sender.uuid,
							createdAt: message.createdAt,
						},
					});
				}
			} else {
				let target = result.find((conversation) => conversation.interlocutorId === message.sender.uuid);
				if (!target) {
					target = {
						interlocutorId: message.sender.uuid,
						interlocutorUsername: message.sender.username,
						unread: 0,
						latestMessage: {
							text: message.text,
							isRead: message.isRead,
							senderId: message.sender.uuid,
							createdAt: message.createdAt,
						},
					};
					result.push(target);
				}
				if (!message.isRead) {
					target.unread++;
				}
			}
			return result;
		},
		interlocutor
			? [{ interlocutorId: interlocutor.uuid, interlocutorUsername: interlocutor.username, unread: 0 }]
			: []
	);

	return conversations;
};

router.get("/", authMiddleware, async (req: Request, res: Response) => {
	try {
		const conversations = await fetchConversations(req.session.user!.id);
		res.status(200).send(conversations);
	} catch (error) {
		console.error("Error retrieving messages from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.get("/:userId", authMiddleware,async (req: Request, res: Response) => {
	try {
		const user = await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		const conversation = await fetchConversations(req.session.user!.id, user);
		res.status(200).send(conversation);
	} catch (error) {
		console.error("Error retrieving user from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
