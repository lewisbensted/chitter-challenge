import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";

const router = express.Router({ mergeParams: true });

export const fetchReplies = async (cheetId: string, cursor?: string, take?: number) => {
	take = isNaN(take!) ? 10 : take;

	const replies = await prisma.reply.findMany({
		where: {
			cheet: { uuid: cheetId },
		},
		take: take,
		skip: cursor ? 1 : 0,
		cursor: cursor ? { uuid: cursor } : undefined,
		orderBy: { createdAt: "desc" },
	});
	return replies;
};

router.get("/", async (req: Request, res: Response) => {
	try {
		const cheet = await prisma.cheet.findUniqueOrThrow({ where: { uuid: req.params.cheetId } });
		req.query.take = req.query.take === "" ? undefined : req.query.take;
		const replies = await fetchReplies(cheet.uuid, req.query.cursor as string, Number(req.query.take));
		res.status(200).send(replies);
	} catch (error) {
		console.error("Error retrieving replies from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
	try {
		const cheet = await prisma.cheet.findUniqueOrThrow({
			include: { cheetStatus: true },
			where: { uuid: req.params.cheetId },
		});
		const newReply = await prisma.reply.create({
			data: {
				userId: req.session.user!.uuid,
				text: (req as { body: { text: string } }).body.text,
				cheetId: cheet.uuid,
			},
		});
		if (!cheet.cheetStatus?.hasReplies) {
			await prisma.cheetStatus.update({
				where: {
					cheetId: cheet.uuid,
				},
				data: {
					hasReplies: true,
				},
			});
		}
		res.status(201).send(newReply);
	} catch (error) {
		console.error("Error adding reply to the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.put("/:replyId", authMiddleware, async (req: Request, res: Response) => {
	try {
		await prisma.cheet.findUniqueOrThrow({ where: { uuid: req.params.cheetId } });
		const targetReply = await prisma.reply.findUniqueOrThrow({
			where: { uuid: req.params.replyId },
			include: { cheet: true, user: true },
		});
		if (targetReply.user.uuid === req.session.user!.uuid) {
			if (targetReply.cheet.uuid === req.params.cheetId) {
				if ((req as { body: { text: string | undefined } }).body.text !== targetReply.text) {
					const updatedReply = await prisma.reply.update({
						where: {
							uuid: targetReply.uuid,
						},
						data: {
							text: (req as { body: { text: string } }).body.text,
						},
					});
					return res.status(200).send(updatedReply);
				} else {
					return res.status(200).send(targetReply);
				}
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
		await prisma.cheet.findUniqueOrThrow({ where: { uuid: req.params.cheetId } });
		const targetReply = await prisma.reply.findUniqueOrThrow({
			include: { cheet: true },
			where: { uuid: req.params.replyId },
		});
		if (targetReply.userId === req.session.user!.uuid) {
			if (targetReply.cheet.uuid === req.params.cheetId) {
				await prisma.reply.delete({
					where: {
						uuid: targetReply.uuid,
					},
				});
				res.status(204).send();
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
