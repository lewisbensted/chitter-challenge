import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { User } from "@prisma/client";
import prisma from "../../prisma/prismaClient.js";
import { authenticate } from "../utils/authenticate.js";

interface IConversation {
	interlocutorUsername: string;
	interlocutorId: string;
	unread: number;
	latestMessage?: { text: string; senderId: string; isRead: boolean };
}

const router = express.Router({ mergeParams: true });

export const fetchConversations = async (userId: number, interlocutor?: User) => {
	const messages = await prisma.message.findMany({
		include: { sender: true, recipient: true },
		where: {
			OR: [
				{ senderId: userId, recipientId: interlocutor ? interlocutor.id : undefined },
				{ recipientId: userId, senderId: interlocutor ? interlocutor.id : undefined },
			],
		},
	});

	messages.sort((messageA, messageB) => {
		return messageB.createdAt.valueOf() - messageA.createdAt.valueOf();
	});

	const conversations = messages.reduce(
		(result: IConversation[], message) => {
			if (message.senderId === userId) {
				if (
					!interlocutor &&
					!result.find((conversation) => conversation.interlocutorId == message.recipient.uuid)
				) {
					result.push({
						interlocutorId: message.recipient.uuid,
						interlocutorUsername: message.recipient.username,
						unread: 0,
						latestMessage: { text: message.text, isRead: message.isRead, senderId: message.sender.uuid },
					});
				}
			} else {
				let target = result.find((conversation) => conversation.interlocutorId == message.sender.uuid);
				if (!target) {
					target = {
						interlocutorId: message.sender.uuid,
						interlocutorUsername: message.sender.username,
						unread: 0,
						latestMessage: { text: message.text, isRead: message.isRead, senderId: message.sender.uuid },
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

router.get("/:userId", async (req: Request, res: Response) => {
	try {
		let conversation;
		const user = await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		if (authenticate(req)) {
			conversation = await fetchConversations(req.session.user!.id, user);
		}
		res.status(200).send({ username: user.username, conversation: conversation ? conversation[0] : undefined });
	} catch (error) {
		console.error("Error retrieving user from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
