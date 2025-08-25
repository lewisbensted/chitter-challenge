import express, { Request, Response } from "express";
import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { logError } from "../utils/logError.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { messageFilters } from "../../prisma/extensions/messageExtension.js";
import { EditMessageRequest, SendMessageRequest } from "../../types/requests.js";

const router = express.Router({ mergeParams: true });

export const fetchMessages = async (userId: string, interlocutorId: string, cursor?: string, take?: number) => {
	take = isNaN(take!) ? 20 : take;

	const messages = await prisma.message.findMany({
		include: { messageStatus: true },
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
		const unreadMessages = await prisma.message.findFirst({
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
		const recipient = await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
		const messages = await fetchMessages(
			req.session.user!.uuid,
			recipient.uuid,
			req.query.cursor as string,
			Number(req.query.take)
		);
		const formattedMessages = messages.map((message) => ({
			...message,
			text: message.messageStatus?.isDeleted ? null : message.text,
		}));
		res.status(200).json(formattedMessages);
	} catch (error) {
		console.error("Error retrieving messages from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.put("/read/:recipientId", authMiddleware, async (req: Request, res: Response) => {
	try {
		const recipient = await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
		await readMessages(req.session.user!.uuid, recipient.uuid);
		res.sendStatus(200);
	} catch (error) {
		console.error("Error marking messages as read:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.post("/:recipientId", authMiddleware, async (req: SendMessageRequest, res: Response) => {
	try {
		const recipient = await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
		const newMessage = await prisma.message.create({
			data: {
				senderId: req.session.user!.uuid,
				recipientId: recipient.uuid,
				text: req.body.text,
			},
			include: { sender: true, recipient: true },
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
		await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
		const targetMessage = await prisma.message.findUniqueOrThrow({
			where: { uuid: req.params.messageId },
			include: { messageStatus: true, sender: true, recipient: true },
		});
		if (targetMessage.sender.uuid === req.session.user!.uuid) {
			if (targetMessage.messageStatus?.isRead) {
				return res.status(400).json({ errors: ["Cannot update a message after it has been read."] });
			}
			if (targetMessage.messageStatus?.isDeleted) {
				return res.status(400).json({ errors: ["Cannot update a deleted message."] });
			}
			if (req.body.text !== targetMessage.text) {
				const updatedMessage = await prisma.message.update({
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
		await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
		const targetMessage = await prisma.message.findUniqueOrThrow({
			where: { uuid: req.params.messageId },
			include: { sender: true },
		});
		if (targetMessage.sender.uuid === req.session.user!.uuid) {
			const deletedMessage = await prisma.messageStatus.update({
				where: {
					messageId: targetMessage.uuid,
				},
				data: { isDeleted: true },

				include: {
					message: messageFilters,
				},
			});
			res.status(200).json({ ...deletedMessage.message, text: null });
		} else {
			res.status(403).json({ errors: ["Cannot delete someone else's message."] });
		}
	} catch (error) {
		console.error("Error deleting cheet from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
