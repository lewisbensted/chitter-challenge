import express, { Request, Response } from "express";
import { authenticator } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import prisma, { ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { EditReplyRequest, SendReplyRequest } from "../../types/requests.js";
import type { ExtendedCheetClient, ExtendedReplyClient } from "../../types/extendedClients.js";

const router = express.Router({ mergeParams: true });

export const fetchReplies = async (
	prismaClient: ExtendedPrismaClient,
	take: number,
	cheetId: string,
	cursor?: string
) => {
	const replies = await prismaClient.reply.findMany({
		where: {
			cheet: { uuid: cheetId },
		},
		take: take + 1,
		skip: cursor ? 1 : 0,
		cursor: cursor ? { uuid: cursor } : undefined,
		orderBy: { createdAt: "desc" },
	});
	const hasNext = replies.length > take;
	if (hasNext) replies.pop();
	return { replies, hasNext };
};

export type FetchRepliesType = typeof fetchReplies;

export const getReplyHandler =
	(prismaClient: ExtendedPrismaClient, fetchReplies: FetchRepliesType) => async (req: Request, res: Response) => {
		try {
			const cheet = await prismaClient.cheet.findUniqueOrThrow({ where: { uuid: req.params.cheetId } });
			const take = Math.min(req.query.take && Number(req.query.take) > 0 ? Number(req.query.take) : 10, 50);
			let cursor = (req.query.cursor as string | undefined)?.trim();
			if (cursor) {
				const cheetExists = await prismaClient.cheet.findUnique({ where: { uuid: cursor } });
				if (!cheetExists) cursor = undefined;
			}
			const { replies, hasNext } = await fetchReplies(prismaClient, take, cheet.uuid, cursor);
			res.status(200).json({ replies, hasNext });
		} catch (error) {
			console.error("Error retrieving replies from the database:\n" + logError(error));
			sendErrorResponse(error, res);
		}
	};

export const postReplyHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: SendReplyRequest, res: Response) => {
		try {
			const result = await prismaClient.$transaction(async (transaction) => {
				const newReply = await transaction.reply.create({
					data: {
						userId: req.session.user!.uuid,
						text: req.body.text,
						cheetId: req.params.cheetId,
					},
				});
				await transaction.cheetStatus.updateMany({
					where: {
						cheetId: req.params.cheetId,
						hasReplies: false,
					},
					data: {
						hasReplies: true,
					},
				});
				return newReply;
			});
			res.status(201).json(result);
		} catch (error) {
			console.error("Error adding reply to the database:\n" + logError(error));
			sendErrorResponse(error, res);
		}
	};

export const putReplyHandler = (prismaClient: ExtendedPrismaClient) => async (req: EditReplyRequest, res: Response) => {
	try {
		const targetReply = await (prismaClient.reply as unknown as ExtendedReplyClient).findUniqueOrThrow({
			where: { uuid: req.params.replyId },
		});
		if (targetReply.user.uuid !== req.session.user!.uuid)
			return res.status(403).json({ errors: ["Cannot update someone else's reply."] });
		if (req.body.text === targetReply.text) return res.status(200).json(targetReply);
		const updatedReply = await prismaClient.reply.update({
			where: {
				uuid: targetReply.uuid,
			},
			data: {
				text: req.body.text,
			},
		});
		return res.status(200).json(updatedReply);
	} catch (error) {
		console.error("Error updating reply in the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
};

export const deleteReplyHandler = (prismaClient: ExtendedPrismaClient) => async (req: Request, res: Response) => {
	try {
		const targetReply = await (prismaClient.reply as unknown as ExtendedReplyClient).findUniqueOrThrow({
			where: { uuid: req.params.replyId },
		});
		if (targetReply.user.uuid !== req.session.user!.uuid)
			return res.status(403).json({ errors: ["Cannot delete someone else's reply."] });
		await prismaClient.reply.delete({
			where: {
				uuid: targetReply.uuid,
			},
		});
		res.sendStatus(204);
	} catch (error) {
		console.error("Error deleting reply from database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
};

router.get("/", getReplyHandler(prisma, fetchReplies));
router.get("/", authenticator, postReplyHandler(prisma));
router.put("/:replyId", authenticator, putReplyHandler(prisma));
router.delete("/:replyId", authenticator, deleteReplyHandler(prisma));

export default router;
