import express, { Request, Response } from "express";

import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { logError } from "../utils/logError.js";
import { Prisma } from "@prisma/client";
import { CreateMessageSchema, UpdateMessageSchema } from "../schemas/message.schema.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkUser } from "../utils/checkUser.js";
import { checkMessage } from "../utils/checkMessage.js";

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
                if (args.data.text) {
                    args.data.text = (args.data.text as string).trim();
                }
                args.data = await UpdateMessageSchema.parseAsync(args.data);
                return query(args);
            },
        },
    },
});

export const fetchMessages = async (userId: number, interlocutorId: number) => {
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId, recipientId: interlocutorId },
                { senderId: interlocutorId, recipientId: userId },
            ],
        },
    });
    messages.sort((messageA, messageB) => {
        return messageA.createdAt.valueOf() - messageB.createdAt.valueOf();
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

router.get("/:recipientId", authMiddleware, async (req: Request, res: Response) => {
    try {
        await checkUser(req.params.recipientId, "recipient");
        const messages = await fetchMessages(req.session.user!.id, Number(req.params.recipientId));
        res.status(200).send(messages);
        await readMessages(req.session.user!.id, Number(req.params.recipientId));
    } catch (error) {
        console.error("Error retrieving messages from the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

router.post("/:recipientId", authMiddleware, async (req: Request, res: Response) => {
    const date = new Date();
    try {
        const recipientUser = await checkUser(req.params.recipientId, "recipient");
        await prisma.$extends(messageExtension).message.create({
            data: {
                senderId: req.session.user!.id,
                senderUsername: req.session.user!.username,
                recipientId: Number(req.params.recipientId),
                recipientUsername: recipientUser!.username,
                text: req.body.text,
                createdAt: date,
                updatedAt: date,
            },
        });
        const messages = await fetchMessages(req.session.user!.id, Number(req.params.recipientId));
        res.status(201).send(messages);
    } catch (error) {
        console.error("Error adding message to the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

router.put("/:recipientId/message/:messageId", authMiddleware, async (req: Request, res: Response) => {
    const date = new Date();
    try {
        await checkUser(req.params.recipientId, "recipient");
        const targetMessage = await checkMessage(req.params.messageId);
        if (targetMessage.senderId === req.session.user!.id) {
            if (req.body.text !== targetMessage.text) {
                await prisma.$extends(messageExtension).message.update({
                    where: {
                        id: Number(req.params.messageId),
                    },
                    data: { text: req.body.text, updatedAt: date },
                });
            }
            const messages = await fetchMessages(req.session.user!.id, Number(req.params.recipientId));
            res.status(200).send(messages);
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
        await checkUser(req.params.recipientId, "recipient");
        const targetMessage = await checkMessage(req.params.messageId);
        if (targetMessage.senderId === req.session.user!.id) {
            await prisma.message.delete({
                where: {
                    id: Number(req.params.messageId),
                },
            });
            const messages = await fetchMessages(req.session.user!.id, Number(req.params.recipientId));
            res.status(200).send(messages);
        } else {
            res.status(403).send(["Cannot delete someone else's message."]);
        }
    } catch (error) {
        console.error("Error deleting cheet from the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

export default router;
