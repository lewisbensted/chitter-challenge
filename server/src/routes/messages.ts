import express, { Request, Response } from "express";
import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { logError } from "../utils/logError.js";
import { Prisma, PrismaClient } from "@prisma/client";
import { CreateMessageSchema, UpdateMessageSchema } from "../schemas/message.schema.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

export const messageExtension = Prisma.defineExtension({
	query: {
		message: {
			async create({ args, query }) {
				if (args.data.text) {
					args.data.text = args.data.text.trim();
				}
				args.data = await CreateMessageSchema.parseAsync(args.data);
				return query(args);
			},
			async update({ args, query }) {
				if (!("isDeleted" in args.data && Object.keys(args.data).length === 1)) {
					if (args.data.text) {
						args.data.text = (args.data.text as string).trim();
					}
					args.data = await UpdateMessageSchema.parseAsync(args.data);
				}
				return query(args);
			},
		},
	},
});

export const fetchMessages = async (userId: number, interlocutorId: number) => {
	const messages = await prisma.message.findMany({
		omit: { id: true, senderId: true, recipientId: true },
		include: { sender: { omit: { id: true } }, recipient: { omit: { id: true } } },
		where: {
			OR: [
				{ senderId: userId, recipientId: interlocutorId },
				{ senderId: interlocutorId, recipientId: userId },
			],
		},
		orderBy: { createdAt: "asc" },
	});
	return messages;
};

export const readMessages = async (userId: number, interlocutorId: number) => {
	const readMessages = await prisma.message.updateMany({
		where: {
			recipientId: userId,
			senderId: interlocutorId,
		},
		data: { isRead: true },
	});
	return readMessages;
};

router.get("/unread", authMiddleware, async (req: Request, res: Response) => {
	try {
		const unreadMessages = await prisma.message.findFirst({
			where: { recipientId: req.session.user!.id, isRead: false },
		});
		res.status(200).send(unreadMessages ? true : false);
	} catch (error) {
		console.error("Error retrieving messages from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.get("/:recipientId", authMiddleware, async (req: Request, res: Response) => {
	try {
		const recipient = await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
		const messages = await fetchMessages(req.session.user!.id, recipient.id);
		res.status(200).send(messages);
		await readMessages(req.session.user!.id, recipient.id);
	} catch (error) {
		console.error("Error retrieving messages from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.post("/:recipientId", authMiddleware, async (req: Request, res: Response) => {
	const date = new Date();
	try {
		const recipient = await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
		const newMessage = await prisma.$extends(messageExtension).message.create({
			data: {
				senderId: req.session.user!.id,
				recipientId: recipient.id,
				text: (req as { body: { text: string } }).body.text,
				createdAt: date,
				updatedAt: date,
			},
			omit: { id: true, senderId: true, recipientId: true },
			include: { sender: { omit: { id: true } }, recipient: { omit: { id: true } } },
		});
		res.status(201).send(newMessage);
	} catch (error) {
		console.error("Error adding message to the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.put("/:recipientId/message/:messageId", authMiddleware, async (req: Request, res: Response) => {
	const date = new Date();
	try {
		await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
		const targetMessage = await prisma.message.findUniqueOrThrow({
			where: { uuid: req.params.messageId },
			omit: { id: true, senderId: true, recipientId: true },
			include: { sender: { omit: { id: true } }, recipient: { omit: { id: true } } },
		});
		if (targetMessage.sender.uuid === req.session.user!.uuid) {
			if (targetMessage.isRead) {
				return res.status(400).send(["Cannot update a message after it has been read."]);
			}
			if ((req as { body: { text: string | undefined } }).body.text !== targetMessage.text) {
				const updatedMessage = await prisma.$extends(messageExtension).message.update({
					where: {
						uuid: targetMessage.uuid,
					},
					data: { text: (req as { body: { text: string } }).body.text, updatedAt: date },
					omit: { id: true, senderId: true, recipientId: true },
					include: { sender: { omit: { id: true } }, recipient: { omit: { id: true } } },
				});
				return res.status(200).send(updatedMessage);
			} else {
				return res.status(200).send(targetMessage);
			}
		} else {
			res.status(403).send(["Cannot update someone else's message."]);
		}
	} catch (error) {
		console.error("Error deleting cheet from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.delete("/:recipientId/message/:messageId", authMiddleware, async (req: Request, res: Response) => {
	try {
		await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
		const targetMessage = await prisma.message.findUniqueOrThrow({
			where: { uuid: req.params.messageId },
		});
		if (targetMessage.senderId === req.session.user!.id) {
			const deletedMessage = await prisma.$extends(messageExtension).message.update({
				where: {
					uuid: targetMessage.uuid,
				},
				data: { isDeleted: true },
				omit: { id: true, senderId: true, recipientId: true, text: true },
				include: { sender: { omit: { id: true } }, recipient: { omit: { id: true } } },
			});
			res.status(200).send(deletedMessage);
		} else {
			res.status(403).send(["Cannot delete someone else's message."]);
		}
	} catch (error) {
		console.error("Error deleting cheet from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
