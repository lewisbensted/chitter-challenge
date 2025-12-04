import express, { NextFunction, Request, Response } from "express";
import { type ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import { authenticator } from "../middleware/authentication.js";
import type { EditMessageRequest, SendMessageRequest } from "../../types/requests.js";
import type { ExtendedMessageClient } from "../../types/extendedClients.js";
import { generateConversationKey } from "../utils/generateConversationKey.js";
import { messageFilters } from "../../prisma/extensions/messageExtension.js";
import { fetchMessages, type FetchMessagesType } from "../utils/fetchMessages.js";
import { readMessages } from "../utils/readMessages.js";

export const getMessagesHandler =
	(prismaClient: ExtendedPrismaClient, fetchFn: FetchMessagesType) =>
		async (req: Request, res: Response, next: NextFunction) => {
			try {
				const sessionUser = req.session.user;
				if (!sessionUser) return res.status(401).json({ errors: ["Unauthorised."] });
				const recipient = await prismaClient.user.findUniqueOrThrow({ where: { uuid: req.params.recipientId } });
				const take = Math.min(req.query.take && Number(req.query.take) > 0 ? Number(req.query.take) : 10, 50);

				let cursor = (req.query.cursor as string | undefined)?.trim();
				if (cursor) {
					const messageExists = await prismaClient.message.findUnique({ where: { uuid: cursor } });
					if (!messageExists) cursor = undefined;
				}

				const { messages, hasNext } = await fetchFn(prismaClient, take, sessionUser.uuid, recipient.uuid, cursor);
				res.status(200).json({ messages, hasNext });
			} catch (error) {
				console.error("Error retrieving messages from the database:\n");
				next(error);
			}
		};

export const readMessagesHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const sessionUser = req.session.user;
			if (!sessionUser) return res.status(401).json({ errors: ["Unauthorised."] });
			const updatedCount = await readMessages(prismaClient, sessionUser.uuid, req.params.recipientId);
			if (updatedCount === 0) console.warn("No messages marked as read");
			res.sendStatus(200);
		} catch (error) {
			console.error("Error marking messages as read:\n");
			next(error);
		}
	};

export const postMessageHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: SendMessageRequest, res: Response, next: NextFunction) => {
		try {
			const sessionUser = req.session.user;
			if (!sessionUser) return res.status(401).json({ errors: ["Unauthorised."] });
			const result = await prismaClient.$transaction(async (transaction) => {
				const newMessage = await transaction.message.create({
					data: {
						senderId: sessionUser.uuid,
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
			console.error("Error adding message to the database:\n");
			next(error);
		}
	};

export const updateMessageHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: EditMessageRequest, res: Response, next: NextFunction) => {
		try {
			const sessionUser = req.session.user;
			if (!sessionUser) return res.status(401).json({ errors: ["Unauthorised."] });
			const targetMessage = await (prismaClient.message as unknown as ExtendedMessageClient).findUniqueOrThrow({
				where: { uuid: req.params.messageId },
			});
			if (targetMessage.sender.uuid !== sessionUser.uuid)
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
			console.error("Error updating message in the database:\n");
			next(error);
		}
	};

export const deleteMessageHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const sessionUser = req.session.user;
			if (!sessionUser) return res.status(401).json({ errors: ["Unauthorised."] });
			const targetMessage = await (prismaClient.message as unknown as ExtendedMessageClient).findUniqueOrThrow({
				where: { uuid: req.params.messageId },
			});
			if (targetMessage.sender.uuid !== sessionUser.uuid)
				return res.status(403).json({ errors: ["Cannot delete someone else's message."] });
			const deletedMessage = await prismaClient.messageStatus.softDelete(targetMessage.uuid);
			res.status(200).json({ ...deletedMessage, text: null });
		} catch (error) {
			console.error("Error deleting message from the database:\n");
			next(error);
		}
	};

export default (prismaClient: ExtendedPrismaClient) => {
	const router = express.Router({ mergeParams: true });
	router.get("/:recipientId", authenticator, getMessagesHandler(prismaClient, fetchMessages));
	router.post("/:recipientId", authenticator, postMessageHandler(prismaClient));
	router.put("/:messageId", authenticator, updateMessageHandler(prismaClient));
	router.delete("/:messageId", authenticator, deleteMessageHandler(prismaClient));
	router.put("/:recipientId/read", authenticator, readMessagesHandler(prismaClient));

	return router;
};
