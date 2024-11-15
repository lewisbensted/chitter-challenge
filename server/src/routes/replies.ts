import { Prisma } from "@prisma/client";
import express, { Request, Response } from "express";
import { CreateReplySchema, UpdateReplySchema } from "../schemas/reply.schema.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { checkCheet } from "../utils/checkCheet.js";

const router = express.Router({ mergeParams: true });

export const replyExtension = Prisma.defineExtension({
    query: {
        reply: {
            async create({ args, query }) {
                if (args.data.text) {
                    args.data.text = args.data.text.trim();
                }
                args.data = await CreateReplySchema.parseAsync(args.data);
                return query(args);
            },
            async update({ args, query }) {
                if (args.data.text) {
                    args.data.text = (args.data.text as string).trim();
                }
                args.data = await UpdateReplySchema.parseAsync(args.data);
                return query(args);
            },
        },
    },
});

export const fetchReplies = async (cheetId: number) => {
    const replies = await prisma.reply.findMany({
        where: {
            cheetId: cheetId,
        },
    });
    replies.sort((replyA, replyB) => {
        return replyA.createdAt.valueOf() - replyB.createdAt.valueOf();
    });
    return replies;
};

router.get("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        await checkCheet(req.params.cheetId);
        const replies = await fetchReplies(Number(req.params.cheetId));
        res.status(200).send(replies);
    } catch (error) {
        console.error("Error retrieving replies from the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
    const date = new Date();
    try {
        await checkCheet(req.params.cheetId);
        await prisma.$extends(replyExtension).reply.create({
            data: {
                userId: req.session.user!.id,
                username: req.session.user!.username,
                text: req.body.text,
                cheetId: Number(req.params.cheetId),
                createdAt: date,
                updatedAt: date,
            },
        });
        const replies = await fetchReplies(Number(req.params.cheetId));
        res.status(201).send(replies);
    } catch (error) {
        console.error("Error adding reply to the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

router.put("/:replyId", authMiddleware, async (req: Request, res: Response) => {
    const date = new Date();
    try {
        await checkCheet(req.params.cheetId);
        if (isNaN(Number(req.params.replyId))) {
            throw new TypeError("Invalid reply ID provided - must be a number.");
        }
        const targetReply = await prisma.reply.findUniqueOrThrow({
            where: { id: Number(req.params.replyId) },
        });
        if (targetReply.userId === req.session.user!.id) {
            if (targetReply.cheetId === Number(req.params.cheetId)) {
                if (req.body.text !== targetReply.text) {
                    await prisma.$extends(replyExtension).reply.update({
                        where: {
                            id: Number(req.params.replyId),
                        },
                        data: {
                            text: req.body.text,
                            updatedAt: date,
                        },
                    });
                }
                const replies = await fetchReplies(Number(req.params.cheetId));
                res.status(200).send(replies);
            } else {
                res.status(403).send(["Cheet IDs do not match."]);
            }
        } else {
            res.status(403).send(["Cannot update someone else's reply."]);
        }
    } catch (error) {
        console.error("Error updating reply in the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

router.delete("/:replyId", authMiddleware, async (req: Request, res: Response) => {
    try {
        await checkCheet(req.params.cheetId);
        if (isNaN(Number(req.params.replyId))) {
            throw new TypeError("Invalid reply ID provided - must be a number.");
        }
        const targetReply = await prisma.reply.findUniqueOrThrow({
            where: { id: Number(req.params.replyId) },
        });
        if (targetReply.userId === req.session.user!.id) {
            if (targetReply.cheetId === Number(req.params.cheetId)) {
                await prisma.reply.delete({
                    where: {
                        id: Number(req.params.replyId),
                    },
                });
                const replies = await fetchReplies(Number(req.params.cheetId));
                res.status(200).send(replies);
            } else {
                res.status(403).send(["Cheet IDs do not match."]);
            }
        } else {
            res.status(403).send(["Cannot delete someone else's reply."]);
        }
    } catch (error) {
        console.error("Error deleting reply from database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

export default router;
