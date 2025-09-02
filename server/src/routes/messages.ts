import express, { Request, Response } from "express";
import prisma from "../../prisma/prismaClient.ts";
import { sendErrorResponse } from "../utils/sendErrorResponse.ts";
import { logError } from "../utils/logError.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";
import { EditMessageRequest, SendMessageRequest } from "../../types/requests.ts";
import { ExtendedMessageClient, ExtendedUserClient, ExtendedMessageStatusClient } from "../../types/extendedClients.ts";

const router = express.Router({ mergeParams: true });

const userClient = prisma.user as unknown as ExtendedUserClient;
const messageClient = prisma.message as unknown as ExtendedMessageClient;
const messageStatusClient = prisma.messageStatus as unknown as ExtendedMessageStatusClient;

export const fetchMessages = async (userId: string, interlocutorId: string, cursor?: string, take?: number) => {
	take = isNaN(take!) ? 20 : take;

	const messages = await messageClient.findMany({
		where: {
			OR: [
				{ senderId: userId, recipientId: interlocutorId },
				{ senderId: interlocutorId, recipientId: userId },
			],
		},
		orderBy: { createdAt: "desc" },
		take: take,
		skip: cursor ? 1 : 0,
		cursor: cursor ? { uuid: cursor } : undefined,
	});
	return messages.reverse();
};

export const readMessages = async (userId: string, interlocutorId: string) => {
	const readMessages = await prisma.messageStatus.updateMany({
		where: {
			message: { recipientId: userId, senderId: interlocutorId },
			isRead: false,
		},
		data: { isRead: true },
	});
	return readMessages;
};

router.get("/unread", authMiddleware, async (req: Request, res: Response) => {
	try {
		const unreadMessages = await messageClient.findFirst({
			where: { recipientId: req.session.user!.uuid, messageStatus: { isRead: false, isDeleted: false } },
		});
		res.status(200).json(!!unreadMessages);
	} catch (error) {
		console.error("Error retrieving messages from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.get("/:recipientId", authMiddleware, async (req: Request, res: Response) => {
	try {
		const recipient = await userClient.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
		const messages = await fetchMessages(
			req.session.user!.uuid,
			recipient.uuid,
			req.query.cursor as string,
			Number(req.query.take)
		);
		const formattedMessages = messages.map((message) => ({
			...message,
			text: message.messageStatus.isDeleted ? null : message.text,
		}));
		res.status(200).json(formattedMessages);
	} catch (error) {
		console.error("Error retrieving messages from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.put("/read/:recipientId", authMiddleware, async (req: Request, res: Response) => {
	try {
		const recipient = await userClient.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
		await readMessages(req.session.user!.uuid, recipient.uuid);
		res.sendStatus(200);
	} catch (error) {
		console.error("Error marking messages as read:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.post("/:recipientId", authMiddleware, async (req: SendMessageRequest, res: Response) => {
	try {
		const recipient = await userClient.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
		const newMessage = await messageClient.create({
			data: {
				senderId: req.session.user!.uuid,
				recipientId: recipient.uuid,
				text: req.body.text,
			},
		});
		const status = await prisma.messageStatus.create({
			data: {
				messageId: newMessage.uuid,
				isRead: newMessage.recipient.uuid === newMessage.sender.uuid ? true : false,
			},
		});
		res.status(201).json({ ...newMessage, messageStatus: status });
	} catch (error) {
		console.error("Error adding message to the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.put("/:recipientId/message/:messageId", authMiddleware, async (req: EditMessageRequest, res: Response) => {
	try {
		await userClient.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
		const targetMessage = await messageClient.findUniqueOrThrow({
			where: { uuid: req.params.messageId },
		});
		if (targetMessage.sender.uuid === req.session.user!.uuid) {
			if (targetMessage.messageStatus.isRead) {
				return res.status(400).json({ errors: ["Cannot update a message after it has been read."] });
			}
			if (targetMessage.messageStatus.isDeleted) {
				return res.status(400).json({ errors: ["Cannot update a deleted message."] });
			}
			if (req.body.text !== targetMessage.text) {
				const updatedMessage = await messageClient.update({
					where: {
						uuid: targetMessage.uuid,
					},
					data: { text: req.body.text },
				});
				return res.status(200).json(updatedMessage);
			} else {
				return res.status(200).json(targetMessage);
			}
		} else {
			res.status(403).json({ errors: ["Cannot update someone else's message."] });
		}
	} catch (error) {
		console.error("Error updating cheet in the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.delete("/:recipientId/message/:messageId", authMiddleware, async (req: Request, res: Response) => {
	try {
		await userClient.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
		const targetMessage = await messageClient.findUniqueOrThrow({
			where: { uuid: req.params.messageId },
		});
		if (targetMessage.sender.uuid === req.session.user!.uuid) {
			const deletedMessage = await messageStatusClient.softDelete(targetMessage.uuid);
			res.status(200).json({ ...deletedMessage, text: null });
		} else {
			res.status(403).json({ errors: ["Cannot delete someone else's message."] });
		}
	} catch (error) {
		console.error("Error deleting cheet from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
