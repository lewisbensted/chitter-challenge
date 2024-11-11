import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { checkUser } from "../utils/checkUser.js";
import { Message, User } from "@prisma/client";
import prisma from "../../prisma/prismaClient.js";

interface IConversation {
    interlocutorUsername: string;
    interlocutorId: number;
    unread: number;
}

const router = express.Router({ mergeParams: true });

export const fetchConversations = async (userId: number, interlocutor?: User) => {
    const messages = await prisma.message.findMany({
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
        (result: IConversation[], message: Message) => {
            if (message.senderId === userId) {
                if (!interlocutor && !result.find((item) => item.interlocutorId == message.recipientId)) {
                    result.push({
                        interlocutorId: message.recipientId,
                        interlocutorUsername: message.recipientUsername,
                        unread: 0,
                    });
                }
            } else {
                let target = result.find((item) => item.interlocutorId == message.senderId);
                if (!target) {
                    target = {
                        interlocutorId: message.senderId,
                        interlocutorUsername: message.senderUsername,
                        unread: 0,
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
            ? [{ interlocutorId: interlocutor.id, interlocutorUsername: interlocutor.username, unread: 0 }]
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

router.get("/:userId", authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = await checkUser(req.params.userId);
        const conversation = await fetchConversations(req.session.user!.id, user);
        res.status(200).send(conversation);
    } catch (error) {
        console.error("Error retrieving user from the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

export default router;
