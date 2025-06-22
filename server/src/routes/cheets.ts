import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";

const router = express.Router({ mergeParams: true });

export const fetchCheets = async (userId?: string, cursor?: string, take?: number) => {
	take = isNaN(take!) ? 10 : take;

	const cheets = await prisma.cheet.findMany({
		where: {
			user: { uuid: userId },
		},
		orderBy: { createdAt: "desc" },
		take: take,
		skip: cursor ? 1 : 0,
		cursor: cursor ? { uuid: cursor } : undefined,
	});
	return cheets;
};

router.get("/", async (req: Request, res: Response) => {
	try {
		let user;
		if (req.params.userId) {
			user = await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		}
		req.query.take = req.query.take === "" ? undefined : req.query.take;
		const cheets = await fetchCheets(user?.uuid, req.query.cursor as string, Number(req.query.take));
		res.status(200).send(cheets);
	} catch (error) {
		console.error("Error retrieving cheets from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});


router.post("/", authMiddleware, async (req: Request, res: Response) => {
	try {
		if (req.params.userId) {
			await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		}
		const newCheet = await prisma.cheet.create({
			data: {
				userId: req.session.user!.uuid,
				text: (req as { body: { text: string } }).body.text,
			},
		});
		const status = await prisma.cheetStatus.create({
			data: {
				cheetId: newCheet.uuid,
			},
		});
		res.status(201).send({ ...newCheet, cheetStatus: status });
	} catch (error) {
		console.error("Error adding cheet to the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.put("/:cheetId", authMiddleware, async (req: Request, res: Response) => {
	try {
		if (req.params.userId) {
			await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		}
		const targetCheet = await prisma.cheet.findUniqueOrThrow({
			where: { uuid: req.params.cheetId },
			include: {user: true, cheetStatus:true}

		});
		if (targetCheet.user.uuid === req.session.user!.uuid) {
			const oneHourAgo = new Date(new Date().getTime() - 1000 * 60 * 60);
			if (targetCheet.createdAt < oneHourAgo) {
				return res.status(400).send(["Cheet cannot be updated (time limit exceeded)."]);
			}
			if (targetCheet.cheetStatus?.hasReplies) {
				return res.status(400).send(["Cannot update a cheet with replies."]);
			}
			if ((req as { body: { text: string | undefined } }).body.text !== targetCheet.text) {
				const updatedCheet = await prisma.cheet.update({
					where: {
						uuid: targetCheet.uuid,
					},
					data: {
						text: (req as { body: { text: string } }).body.text,
					},
				});
				return res.status(200).send(updatedCheet);
			} else {
				return res.status(200).send(targetCheet);
			}
		} else {
			res.status(403).send(["Cannot update someone else's cheet."]);
		}
	} catch (error) {
		console.error("Error updating cheet in the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.delete("/:cheetId", authMiddleware, async (req: Request, res: Response) => {
	try {
		if (req.params.userId) {
			await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		}
		const targetCheet = await prisma.cheet.findUniqueOrThrow({ where: { uuid: req.params.cheetId } });
		if (targetCheet.userId === req.session.user!.uuid) {
			await prisma.cheet.delete({
				where: {
					uuid: targetCheet.uuid,
				},
			});

			res.status(204).send();
		} else {
			res.status(403).send(["Cannot delete someone else's cheet."]);
		}
	} catch (error) {
		console.error("Error deleting cheet from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
