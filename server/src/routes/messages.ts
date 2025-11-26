import express, { Request, Response } from "express";
import prisma, { ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { logError } from "../utils/logError.js";
import { authenticator } from "../middleware/authMiddleware.js";
import { EditMessageRequest, SendMessageRequest } from "../../types/requests.js";
import type { ExtendedMessageClient } from "../../types/extendedClients.js";
import { generateConversationKey } from "../utils/generateConversationKey.js";
import { messageFilters } from "../../prisma/extensions/messageExtension.js";
import { fetchMessages, FetchMessagesType } from "../utils/fetchMessages.js";

const router = express.Router({ mergeParams: true });

export const readMessages = async (userId: string, interlocutorId: string) =>
	await prisma.$transaction(async (transaction) => {
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

export const getMessageHandler =
	(prismaClient: ExtendedPrismaClient, fetchFn: FetchMessagesType) => async (req: Request, res: Response) => {
		try {
			const recipient = await prismaClient.user.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
			const take = Math.min(req.query.take && Number(req.query.take) > 0 ? Number(req.query.take) : 10, 50);

			let cursor = (req.query.cursor as string | undefined)?.trim();
			if (cursor) {
				const messageExists = await prismaClient.message.findUnique({ where: { uuid: cursor } });
				if (!messageExists) cursor = undefined;
			}

			const { messages, hasNext } = await fetchFn(
				prismaClient,
				take,
				req.session.user!.uuid,
				recipient.uuid,
				cursor
			);
			res.status(200).json({ messages, hasNext });
		} catch (error) {
			console.error("Error retrieving messages from the database:\n" + logError(error));
			sendErrorResponse(error, res);
		}
	};

router.put("/:recipientId/read", authenticator, async (req: Request, res: Response) => {
	try {
		const updatedCount = await readMessages(req.session.user!.uuid, req.params.recipientId);
		if (updatedCount === 0) console.warn("No messages marked as read");
		res.sendStatus(200);
	} catch (error) {
		console.error("Error marking messages as read:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export const postMessageHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: SendMessageRequest, res: Response) => {
		try {
			const result = await prismaClient.$transaction(async (transaction) => {
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
				const updateUnread = isSelfMessage
					? {}
					: isFirstUserSender
						? { user2Unread: true }
						: { user1Unread: true };
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
	};

export const editMessageHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: EditMessageRequest, res: Response) => {
		try {
			const targetMessage = await (prismaClient.message as unknown as ExtendedMessageClient).findUniqueOrThrow({
				where: { uuid: req.params.messageId },
			});
			if (targetMessage.sender.uuid !== req.session.user!.uuid)
				return res.status(403).json({ errors: ["Cannot update someone else's message."] });
			if (targetMessage.messageStatus.isRead)
				return res.status(400).json({ errors: ["Cannot update a message after it has been read."] });
			if (targetMessage.messageStatus.isDeleted)
				return res.status(400).json({ errors: ["Cannot update a deleted message."] });

			if (req.body.text === targetMessage.text) return res.status(200).json(targetMessage);

			const updatedMessage = await prismaClient.message.update({
				where: {
					uuid: targetMessage.uuid,
				},
				data: { text: req.body.text },
			});

			return res.status(200).json(updatedMessage);
		} catch (error) {
			console.error("Error updating message in the database:\n" + logError(error));
			sendErrorResponse(error, res);
		}
	};

export const deleteMessageHandler = (prismaClient: ExtendedPrismaClient) => async (req: Request, res: Response) => {
	try {
		const targetMessage = await (prismaClient.message as unknown as ExtendedMessageClient).findUniqueOrThrow({
			where: { uuid: req.params.messageId },
		});
		if (targetMessage.sender.uuid !== req.session.user!.uuid)
			return res.status(403).json({ errors: ["Cannot delete someone else's message."] });
		const deletedMessage = await prismaClient.messageStatus.softDelete(targetMessage.uuid);
		res.status(200).json({ ...deletedMessage, text: null });
	} catch (error) {
		console.error("Error deleting message from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
};

router.get("/:recipientId", authenticator, getMessageHandler(prisma, fetchMessages));
router.post("/:recipientId", authenticator, postMessageHandler(prisma));
router.put("/:messageId", authenticator, editMessageHandler(prisma));
router.delete("/:messageId", authenticator, deleteMessageHandler(prisma));

export default router;
