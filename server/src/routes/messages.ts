import express, { Request, Response } from "express";
import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { logError } from "../utils/logError.js";
import { authenticator } from "../middleware/authMiddleware.js";
import { EditMessageRequest, SendMessageRequest } from "../../types/requests.js";
import type {
	ExtendedMessageClient,
	ExtendedUserClient,
	ExtendedMessageStatusClient,
} from "../../types/extendedClients.js";
import { generateConversationKey } from "../utils/generateConversationKey.js";
import { messageFilters } from "../../prisma/extensions/messageExtension.js";

const router = express.Router({ mergeParams: true });

const userClient = prisma.user as unknown as ExtendedUserClient;
const messageClient = prisma.message as unknown as ExtendedMessageClient;
const messageStatusClient = prisma.messageStatus as unknown as ExtendedMessageStatusClient;

export const fetchMessages = async (take: number, userId: string, interlocutorId: string, cursor?: string) => {
	const messages = await messageClient.findMany({
		where: {
			OR: [
				{ senderId: userId, recipientId: interlocutorId },
				{ senderId: interlocutorId, recipientId: userId },
			],
		},
		orderBy: { createdAt: "desc" },
		take: take + 1,
		skip: cursor ? 1 : 0,
		cursor: cursor ? { uuid: cursor } : undefined,
	});
	const hasNext = messages.length > take;
	if (hasNext) messages.pop();
	return { messages: messages.reverse(), hasNext };
};

export const readMessages = async (userId: string, interlocutorId: string) => {
	return await prisma.$transaction(async (transaction) => {
		const readMessages = await transaction.messageStatus.updateMany({
			where: {
				message: { recipientId: userId, senderId: interlocutorId },
				isRead: false,
			},
			data: { isRead: true },
		});
		const [firstUser, secondUser] = [userId, interlocutorId].sort();
		const convoKey = generateConversationKey(firstUser, secondUser);
		const isFirstUserSession = firstUser === userId;
		await transaction.conversation.update({
			where: { key: convoKey },
			data: { ...(isFirstUserSession ? { user1Unread: false } : { user2Unread: false }) },
		});
		return readMessages.count;
	});
};

router.get("/unread", authenticator, async (req: Request, res: Response) => {
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

router.get("/:recipientId", authenticator, async (req: Request, res: Response) => {
	try {
		const recipient = await userClient.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
		const take = Math.min(req.query.take && Number(req.query.take) > 0 ? Number(req.query.take) : 10, 50);
		const { messages, hasNext } = await fetchMessages(
			take,
			req.session.user!.uuid,
			recipient.uuid,
			req.query.cursor as string | undefined
		);
		const formattedMessages = messages.map((message) => ({
			...message,
			text: message.messageStatus.isDeleted ? null : message.text,
		}));
		res.status(200).json({ messages: formattedMessages, hasNext });
	} catch (error) {
		console.error("Error retrieving messages from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.put("/read/:recipientId", authenticator, async (req: Request, res: Response) => {
	try {
		const updatedCount = await readMessages(req.session.user!.uuid, req.params.recipientId);
		if (updatedCount === 0) console.warn("No messages marked as read");
		res.sendStatus(200);
	} catch (error) {
		console.error("Error marking messages as read:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.post("/:recipientId", authenticator, async (req: SendMessageRequest, res: Response) => {
	try {
		const result = await prisma.$transaction(async (transaction) => {
			const newMessage = await transaction.message.create({
				data: {
					senderId: req.session.user!.uuid,
					recipientId: req.params.recipientId,
					text: req.body.text,
				},
				...messageFilters,
			});
			const isSelfMessage = newMessage.recipient.uuid === newMessage.sender.uuid;

			const status = await transaction.messageStatus.create({
				data: {
					messageId: newMessage.uuid,
					isRead: isSelfMessage,
				},
			});

			const [firstUser, secondUser] = [newMessage.sender.uuid, newMessage.recipient.uuid].sort();
			const convoKey = generateConversationKey(firstUser, secondUser);
			const isFirstUserSender = firstUser === newMessage.sender.uuid;
			const updateUnread = isSelfMessage ? {} : isFirstUserSender ? { user2Unread: true } : { user1Unread: true };
			await transaction.conversation.upsert({
				where: { key: convoKey },
				update: {
					latestMessageId: newMessage.uuid,
					...updateUnread,
				},
				create: {
					user1Id: firstUser,
					user2Id: secondUser,
					key: convoKey,
					latestMessageId: newMessage.uuid,
					...updateUnread,
				},
			});
			return { ...newMessage, messageStatus: status };
		});
		res.status(201).json(result);
	} catch (error) {
		console.error("Error adding message to the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.put("/:recipientId/message/:messageId", authenticator, async (req: EditMessageRequest, res: Response) => {
	try {
		const targetMessage = await messageClient.findUniqueOrThrow({
			where: { uuid: req.params.messageId },
		});
		if (targetMessage.recipient.uuid !== req.params.recipientId)
			return res.status(403).json({ code: "OWNERSHIP_VIOLATION", errors: ["Message does not match recipient"] });
		if (targetMessage.sender.uuid !== req.session.user!.uuid)
			return res.status(403).json({ errors: ["Cannot update someone else's message."] });
		if (targetMessage.messageStatus.isRead)
			return res.status(400).json({ errors: ["Cannot update a message after it has been read."] });
		if (targetMessage.messageStatus.isDeleted)
			return res.status(400).json({ errors: ["Cannot update a deleted message."] });

		if (req.body.text === targetMessage.text) return res.status(200).json(targetMessage);

		const updatedMessage = await messageClient.update({
			where: {
				uuid: targetMessage.uuid,
			},
			data: { text: req.body.text },
		});

		return res.status(200).json(updatedMessage);
	} catch (error) {
		console.error("Error updating cheet in the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.delete("/:recipientId/message/:messageId", authenticator, async (req: Request, res: Response) => {
	try {
		const targetMessage = await messageClient.findUniqueOrThrow({
			where: { uuid: req.params.messageId },
		});
		if (targetMessage.recipient.uuid !== req.params.recipientId)
			return res.status(403).json({ code: "OWNERSHIP_VIOLATION", errors: ["Message does not match recipient"] });
		if (targetMessage.sender.uuid !== req.session.user!.uuid)
			return res.status(403).json({ errors: ["Cannot delete someone else's message."] });
		const deletedMessage = await messageStatusClient.softDelete(targetMessage.uuid);
		res.status(200).json({ ...deletedMessage, text: null });
	} catch (error) {
		console.error("Error deleting cheet from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
