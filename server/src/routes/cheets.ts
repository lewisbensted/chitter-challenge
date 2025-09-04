import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { EditCheetRequest, SendCheetRequest } from "../../types/requests.js";
import type { ExtendedCheetClient, ExtendedUserClient } from "../../types/extendedClients.js";

const router = express.Router({ mergeParams: true });

const userClient = prisma.user as unknown as ExtendedUserClient;
const cheetClient = prisma.cheet as unknown as ExtendedCheetClient;

export const fetchCheets = async (userId?: string, cursor?: string, take?: number) => {
	take = isNaN(take!) ? 10 : take;

	const cheets = await cheetClient.findMany({
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
			user = await userClient.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		}
		req.query.take = req.query.take === "" ? undefined : req.query.take;
		const cheets = await fetchCheets(user?.uuid, req.query.cursor as string, Number(req.query.take));
		res.status(200).json(cheets);
	} catch (error) {
		console.error("Error retrieving cheets from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.post("/", authMiddleware, async (req: SendCheetRequest, res: Response) => {
	try {
		if (req.params.userId) {
			await userClient.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		}
		const newCheet = await cheetClient.create({
			data: {
				userId: req.session.user!.uuid,
				text: req.body.text,
			},
		});
		const status = await prisma.cheetStatus.create({
			data: {
				cheetId: newCheet.uuid,
			},
		});
		res.status(201).json({ ...newCheet, cheetStatus: status });
	} catch (error) {
		console.error("Error adding cheet to the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.put("/:cheetId", authMiddleware, async (req: EditCheetRequest, res: Response) => {
	try {
		if (req.params.userId) {
			await userClient.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		}
		const targetCheet = await cheetClient.findUniqueOrThrow({
			where: { uuid: req.params.cheetId },
		});
		if (targetCheet.user.uuid === req.session.user!.uuid) {
			const oneHourAgo = new Date(new Date().getTime() - 1000 * 60 * 60);
			if (targetCheet.createdAt < oneHourAgo) {
				return res.status(400).json({ errors: ["Cheet cannot be updated (time limit exceeded)."] });
			}
			if (targetCheet.cheetStatus.hasReplies) {
				return res.status(400).json({ errors: ["Cannot update a cheet with replies."] });
			}
			if (req.body.text !== targetCheet.text) {
				const updatedCheet = await cheetClient.update({
					where: {
						uuid: targetCheet.uuid,
					},
					data: {
						text: req.body.text,
					},
				});
				return res.status(200).json(updatedCheet);
			} else {
				return res.status(200).json(targetCheet);
			}
		} else {
			res.status(403).json({ errors: ["Cannot update someone else's cheet."] });
		}
	} catch (error) {
		console.error("Error updating cheet in the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.delete("/:cheetId", authMiddleware, async (req: Request, res: Response) => {
	try {
		if (req.params.userId) {
			await userClient.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		}
		const targetCheet = await cheetClient.findUniqueOrThrow({
			where: { uuid: req.params.cheetId },
		});
		if (targetCheet.user.uuid === req.session.user!.uuid) {
			await cheetClient.delete({
				where: {
					uuid: targetCheet.uuid,
				},
			});
			res.sendStatus(204);
		} else {
			res.status(403).json({ errors: ["Cannot delete someone else's cheet."] });
		}
	} catch (error) {
		console.error("Error deleting cheet from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
