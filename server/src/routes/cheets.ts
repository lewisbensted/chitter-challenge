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
				if (args.data.text) {
					args.data.text = args.data.text.trim();
				}
				args.data = await CreateCheetSchema.parseAsync(args.data);
				return query(args);
			},
			async update({ args, query }) {
				if (args.data.text) {
					args.data.text = (args.data.text as string).trim();
				}
				args.data = await UpdateCheetSchema.parseAsync(args.data);
				return query(args);
			},
		},
	},
});

export const fetchCheets = async (take: number, cursor: string, userId?: number) => {
	take = isNaN(take) ? 10 : take;

	const cheets = await prisma.cheet.findMany({
		include: { user: { omit: { id: true } } },
		omit: { id: true, userId: true },
		where: {
			userId: userId,
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

		const cheets = await fetchCheets(Number(req.query.take), req.query.cursor as string, user?.id);
		res.status(200).send(cheets);
	} catch (error) {
		console.error("Error retrieving cheets from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
	const date = new Date();
	try {
		let user;
		if (req.params.userId) {
			user = await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		}
		await prisma.$extends(cheetExtension).cheet.create({
			data: {
				userId: req.session.user!.id,
				text: (req as { body: { text: string } }).body.text,
				createdAt: date,
				updatedAt: date,
			},
		});
		const cheets = await fetchCheets(Number(req.query.take), req.query.cursor as string, user?.id);
		res.status(201).send(cheets);
	} catch (error) {
		console.error("Error adding cheet to the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.put("/:cheetId", authMiddleware, async (req: Request, res: Response) => {
	const date = new Date();
	try {
		let user;
		if (req.params.userId) {
			user = await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		}
		const targetCheet = await prisma.cheet.findUniqueOrThrow({
			where: { uuid: req.params.cheetId },
		});
		if (targetCheet.userId === req.session.user!.id) {
			if ((req as { body: { text: string | undefined } }).body.text !== targetCheet.text) {
				await prisma.$extends(cheetExtension).cheet.update({
					where: {
						id: targetCheet.id,
					},
					data: {
						text: (req as { body: { text: string } }).body.text,
						updatedAt: date,
					},
				});
			}
			const cheets = await fetchCheets(Number(req.query.take), req.query.cursor as string, user?.id);
			res.status(200).send(cheets);
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
		let user;
		if (req.params.userId) {
			user = await prisma.user.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		}
		const targetCheet = await prisma.cheet.findUniqueOrThrow({ where: { uuid: req.params.cheetId } });
		if (targetCheet.userId === req.session.user!.id) {
			await prisma.cheet.delete({
				where: {
					id: targetCheet.id,
				},
			});
			const cheets = await fetchCheets(Number(req.query.take), req.query.cursor as string, user?.id);
			res.status(200).send(cheets);
		} else {
			res.status(403).send(["Cannot delete someone else's cheet."]);
		}
	} catch (error) {
		console.error("Error deleting cheet from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
