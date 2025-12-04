import express, { NextFunction, Request, Response } from "express";
import { authenticator } from "../middleware/authentication.js";
import { type ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import type { EditCheetRequest, SendCheetRequest } from "../../types/requests.js";
import type { ExtendedCheetClient } from "../../types/extendedClients.js";
import { fetchCheets, type FetchCheetsType } from "../utils/fetchCheets.js";


export const getCheetsHandler =
	(prismaClient: ExtendedPrismaClient, fetchFn: FetchCheetsType) =>
		async (req: Request, res: Response, next: NextFunction) => {
			try {
				let user;
				if (req.params.userId) {
					user = await prismaClient.user.findUniqueOrThrow({ where: { uuid: req.params.userId } });
				}
				const take = Math.min(req.query.take && Number(req.query.take) > 0 ? Number(req.query.take) : 10, 50);

				let cursor = (req.query.cursor as string | undefined)?.trim();
				if (cursor) {
					const cheetExists = await prismaClient.cheet.findUnique({ where: { uuid: cursor } });
					if (!cheetExists) cursor = undefined;
				}

				const { cheets, hasNext } = await fetchFn(prismaClient, take, req.session.user?.uuid, user?.uuid, cursor);
				res.status(200).json({ cheets, hasNext });
			} catch (error) {
				console.error("Error retrieving cheets from the database:\n");
				next(error);
			}
		};

export const createCheetHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: SendCheetRequest, res: Response, next: NextFunction) => {
		try {
			const sessionUser = req.session.user;
			if (!sessionUser) return res.status(401).json({ errors: ["Unauthorised."] });
			const result = await prismaClient.$transaction(async (transaction) => {
				const newCheet = await transaction.cheet.create({
					data: {
						userId: sessionUser.uuid,
						text: req.body.text,
					},
				});
				const status = await transaction.cheetStatus.create({
					data: {
						cheetId: newCheet.uuid,
					},
					omit: { cheetId: true },
				});
				return { ...newCheet, cheetStatus: status };
			});
			res.status(201).json(result);
		} catch (error) {
			console.error("Error adding cheet to the database:\n");
			next(error);
		}
	};

export const updateCheetHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: EditCheetRequest, res: Response, next: NextFunction) => {
		try {
			const sessionUser = req.session.user;
			if (!sessionUser) return res.status(401).json({ errors: ["Unauthorised."] });

			const targetCheet = await (prismaClient.cheet as unknown as ExtendedCheetClient).findUniqueOrThrow({
				where: { uuid: req.params.cheetId },
			});

			if (targetCheet.user.uuid !== sessionUser.uuid)
				return res.status(403).json({ errors: ["Cannot update someone else's cheet."] });

			const oneHourAgo = new Date(new Date().getTime() - 1000 * 60 * 60);
			if (targetCheet.createdAt < oneHourAgo) {
				return res.status(400).json({ errors: ["Cheet cannot be updated (time limit exceeded)."] });
			}
			if (targetCheet.cheetStatus.hasReplies) {
				return res.status(400).json({ errors: ["Cannot update a cheet with replies."] });
			}
			if (req.body.text === targetCheet.text) return res.status(200).json(targetCheet);

			const updatedCheet = await prismaClient.cheet.update({
				where: {
					uuid: targetCheet.uuid,
				},
				data: {
					text: req.body.text,
				},
			});
			return res.status(200).json(updatedCheet);
		} catch (error) {
			console.error("Error updating cheet in the database:\n");
			next(error);
		}
	};

export const deleteCheetHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const sessionUser = req.session.user;
			if (!sessionUser) return res.status(401).json({ errors: ["Unauthorised."] });
			const targetCheet = await (prismaClient.cheet as unknown as ExtendedCheetClient).findUniqueOrThrow({
				where: { uuid: req.params.cheetId },
			});
			if (targetCheet.user.uuid !== sessionUser.uuid)
				return res.status(403).json({ errors: ["Cannot delete someone else's cheet."] });
			await prismaClient.cheet.delete({
				where: {
					uuid: targetCheet.uuid,
				},
			});
			res.sendStatus(204);
		} catch (error) {
			console.error("Error deleting cheet from the database:\n");
			next(error);
		}
	};

export default (prismaClient: ExtendedPrismaClient) => {
	const router = express.Router({ mergeParams: true });

	router.get("/", getCheetsHandler(prismaClient, fetchCheets));
	router.post("/", authenticator, createCheetHandler(prismaClient));
	router.put("/:cheetId", authenticator, updateCheetHandler(prismaClient));
	router.delete("/:cheetId", authenticator, deleteCheetHandler(prismaClient));

	return router;
};
