import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { Prisma } from "@prisma/client";
import { CreateCheetSchema, UpdateCheetSchema } from "../schemas/cheet.schema.js";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";

const router = express.Router({ mergeParams: true });

export const cheetExtension = Prisma.defineExtension({
	query: {
		cheet: {
			async create({ args, query }) {
				const parsedData = await CreateCheetSchema.parseAsync({ ...args.data, text: args.data.text?.trim() });
				return query({ ...args, data: parsedData });
			},
			async update({ args, query }) {
				const parsedData = await UpdateCheetSchema.parseAsync({
					...args.data,
					text: (args.data.text as string)?.trim(),
				});
				return query({ ...args, data: parsedData });
			},
		},
	},
});

export const fetchCheets = async (userId?: string, cursor?: string, take?: number) => {
	take = isNaN(take!) ? 10 : take;

	const cheets = await prisma.cheet.findMany({
		include: { user: { omit: { id: true } } },
		omit: { id: true },
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

router.get("/:cheetId", async (req: Request, res: Response) => {
	try {
		const cheet = await prisma.cheet.findUniqueOrThrow({
			where: { uuid: req.params.cheetId },
			include: { user: { omit: { id: true } } },
			omit: { id: true },
		});
		res.status(200).send(cheet);
	} catch (error) {
		console.error("Error retrieving cheet from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
	try {
		if (req.params.userId) {
			await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		}
		const newCheet = await prisma.$extends(cheetExtension).cheet.create({
			data: {
				userId: req.session.user!.uuid,
				text: (req as { body: { text: string } }).body.text,
			},
			include: { user: { omit: { id: true } } },
			omit: { id: true },
		});
		res.status(201).send(newCheet);
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
			include: { user: { omit: { id: true } } },
			omit: { id: true },
		});
		if (targetCheet.user.uuid === req.session.user!.uuid) {
			const oneHourAgo = new Date(new Date().getTime() - 1000 * 60 * 60);
			if (targetCheet.createdAt < oneHourAgo) {
				return res.status(400).send(["Cheet cannot be updated (time limit exceeded)."]);
			}
			if (targetCheet.hasReplies) {
				return res.status(400).send(["Cannot update a cheet with replies."]);
			}
			if ((req as { body: { text: string | undefined } }).body.text !== targetCheet.text) {
				const updatedCheet = await prisma.$extends(cheetExtension).cheet.update({
					where: {
						uuid: targetCheet.uuid,
					},
					data: {
						text: (req as { body: { text: string } }).body.text
					},
					include: { user: { omit: { id: true } } },
					omit: { id: true },
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
