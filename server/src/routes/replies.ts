import express, { NextFunction, Request, Response } from "express";
import { authenticator } from "../middleware/authentication.js";
import { type ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import type { EditReplyRequest, SendReplyRequest } from "../../types/requests.js";
import type { ExtendedReplyClient } from "../../types/extendedClients.js";
import { fetchReplies, type FetchRepliesType } from "../utils/fetchReplies.js";

export const getRepliesHandler =
	(prismaClient: ExtendedPrismaClient, fetchReplies: FetchRepliesType) =>
		async (req: Request, res: Response, next: NextFunction) => {
			try {
				const cheet = await prismaClient.cheet.findUniqueOrThrow({ where: { uuid: req.params.cheetId } });
				const take = Math.min(req.query.take && Number(req.query.take) > 0 ? Number(req.query.take) : 10, 50);
				let cursor = (req.query.cursor as string | undefined)?.trim();
				if (cursor) {
					const replyExists = await prismaClient.reply.findUnique({ where: { uuid: cursor } });
					if (!replyExists) cursor = undefined;
				}
				const { replies, hasNext } = await fetchReplies(prismaClient, take, cheet.uuid, cursor);
				res.status(200).json({ replies, hasNext });
			} catch (error) {
				console.error("Error retrieving replies from the database:\n");
				next(error);
			}
		};

export const createReplyHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: SendReplyRequest, res: Response, next: NextFunction) => {
		try {
			const sessionUser = req.session.user;
			if (!sessionUser) return res.status(401).json({ errors: ["Unauthorised."] });

			const result = await prismaClient.$transaction(async (transaction) => {
				const newReply = await transaction.reply.create({
					data: {
						userId: sessionUser.uuid,
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
			console.error("Error adding reply to the database:\n");
			next(error);
		}
	};

export const updateReplyHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: EditReplyRequest, res: Response, next: NextFunction) => {
		try {
			const sessionUser = req.session.user;
			if (!sessionUser) return res.status(401).json({ errors: ["Unauthorised."] });
			const targetReply = await (prismaClient.reply as unknown as ExtendedReplyClient).findUniqueOrThrow({
				where: { uuid: req.params.replyId },
			});
			if (targetReply.user.uuid !== sessionUser.uuid)
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
			console.error("Error updating reply in the database:\n");
			next(error);
		}
	};

export const deleteReplyHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const sessionUser = req.session.user;
			if (!sessionUser) return res.status(401).json({ errors: ["Unauthorised."] });
			const targetReply = await (prismaClient.reply as unknown as ExtendedReplyClient).findUniqueOrThrow({
				where: { uuid: req.params.replyId },
			});
			if (targetReply.user.uuid !== sessionUser.uuid)
				return res.status(403).json({ errors: ["Cannot delete someone else's reply."] });
			await prismaClient.reply.delete({
				where: {
					uuid: targetReply.uuid,
				},
			});
			res.sendStatus(204);
		} catch (error) {
			console.error("Error deleting reply from database:\n");
			next(error);
		}
	};

export default (prismaClient: ExtendedPrismaClient) => {
	const router = express.Router({ mergeParams: true });

	router.get("/", getRepliesHandler(prismaClient, fetchReplies));
	router.post("/", authenticator, createReplyHandler(prismaClient));
	router.put("/:replyId", authenticator, updateReplyHandler(prismaClient));
	router.delete("/:replyId", authenticator, deleteReplyHandler(prismaClient));
	
	return router;
};
