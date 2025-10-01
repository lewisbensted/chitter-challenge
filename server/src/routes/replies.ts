import express, { Request, Response } from "express";
import { authenticator } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { EditReplyRequest, SendReplyRequest } from "../../types/requests.js";
import type { ExtendedCheetClient, ExtendedReplyClient } from "../../types/extendedClients.js";

const router = express.Router({ mergeParams: true });

const cheetClient = prisma.cheet as unknown as ExtendedCheetClient;
const replyClient = prisma.reply as unknown as ExtendedReplyClient;

export const fetchReplies = async (take: number, cheetId: string, cursor?: string) => {
	const replies = await replyClient.findMany({
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

router.get("/", async (req: Request, res: Response) => {
	try {
		const cheet = await cheetClient.findUniqueOrThrow({ where: { uuid: req.params.cheetId } });
		const take = Math.min(req.query.take && Number(req.query.take) > 0 ? Number(req.query.take) : 10, 50);
		const {replies, hasNext} = await fetchReplies(take, cheet.uuid, req.query.cursor as string | undefined);
		res.status(200).json({replies, hasNext});
	} catch (error) {
		console.error("Error retrieving replies from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.post("/", authenticator, async (req: SendReplyRequest, res: Response) => {
	try {
		const newReply = await replyClient.create({
			data: {
				userId: req.session.user!.uuid,
				text: req.body.text,
				cheetId: req.params.cheetId,
			},
		});
		await prisma.cheetStatus.updateMany({
			where: {
				cheetId: req.params.cheetId,
				hasReplies: false,
			},
			data: {
				hasReplies: true,
			},
		});
		res.status(201).json(newReply);
	} catch (error) {
		console.error("Error adding reply to the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.put("/:replyId", authenticator, async (req: EditReplyRequest, res: Response) => {
	try {
		const targetReply = await replyClient.findUniqueOrThrow({
			where: { uuid: req.params.replyId },
		});
		if (targetReply.user.uuid !== req.session.user!.uuid)
			return res.status(403).json({ errors: ["Cannot update someone else's reply."] });
		if (targetReply.cheetId !== req.params.cheetId)
			return res.status(403).json({
				code: "OWNERSHIP_VIOLATION",
				errors: ["Reply does not belong to specified cheet"],
			});
		if (req.body.text === targetReply.text) return res.status(200).json(targetReply);
		const updatedReply = await replyClient.update({
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
});

router.delete("/:replyId", authenticator, async (req: Request, res: Response) => {
	try {
		const targetReply = await replyClient.findUniqueOrThrow({
			where: { uuid: req.params.replyId },
		});
		if (targetReply.user.uuid !== req.session.user!.uuid)
			return res.status(403).json({ errors: ["Cannot delete someone else's reply."] });
		if (targetReply.cheetId !== req.params.cheetId)
			return res.status(403).json({
				code: "OWNERSHIP_VIOLATION",
				errors: ["Reply does not belong to specified cheet"],
			});

		await replyClient.delete({
			where: {
				uuid: targetReply.uuid,
			},
		});
		res.sendStatus(204);
	} catch (error) {
		console.error("Error deleting reply from database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
