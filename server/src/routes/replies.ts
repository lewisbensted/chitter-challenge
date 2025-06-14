import { Prisma } from "@prisma/client";
import express, { Request, Response } from "express";
import { CreateReplySchema, UpdateReplySchema } from "../schemas/reply.schema.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";

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

export const fetchReplies = async (cheetId: number, cursor?: string, take?: number) => {
	take = isNaN(take!) ? 10 : take;

	const replies = await prisma.reply.findMany({
		include: { cheet: { omit: { id: true, userId: true } }, user: { omit: { id: true } } },
		omit: { id: true, cheetId: true, userId: true },
		where: {
			cheet: { id: cheetId },
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
		const replies = await fetchReplies(cheet.id, req.query.cursor as string, Number(req.query.take));
		res.status(200).send(replies);
	} catch (error) {
		console.error("Error retrieving replies from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
	const date = new Date();
	try {
		const cheet = await prisma.cheet.findUniqueOrThrow({ where: { uuid: req.params.cheetId } });
		const newReply = await prisma.$extends(replyExtension).reply.create({
			data: {
				userId: req.session.user!.id,
				text: (req as { body: { text: string } }).body.text,
				cheetId: cheet.id,
				createdAt: date,
				updatedAt: date,
			},
			include: { cheet: { omit: { id: true, userId: true } }, user: { omit: { id: true } } },
			omit: { id: true, cheetId: true, userId: true },
		});
		if (!cheet.hasReplies) {
			await prisma.cheet.update({
				where: {
					id: cheet.id,
				},
				data: {
					hasReplies: true,
					updatedAt: cheet.updatedAt,
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
	const date = new Date();
	try {
		await prisma.cheet.findUniqueOrThrow({ where: { uuid: req.params.cheetId } });
		const targetReply = await prisma.reply.findUniqueOrThrow({
			include: { cheet: true },
			where: { uuid: req.params.replyId },
		});
		if (targetReply.userId === req.session.user!.id) {
			if (targetReply.cheet.uuid === req.params.cheetId) {
				if ((req as { body: { text: string | undefined } }).body.text !== targetReply.text) {
					const updatedReply = await prisma.$extends(replyExtension).reply.update({
						where: {
							id: targetReply.id,
						},
						data: {
							text: (req as { body: { text: string } }).body.text,
							updatedAt: date,
						},
						include: { cheet: { omit: { id: true, userId: true } }, user: { omit: { id: true } } },
						omit: { id: true, cheetId: true, userId: true },
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
		if (targetReply.userId === req.session.user!.id) {
			if (targetReply.cheet.uuid === req.params.cheetId) {
				await prisma.reply.delete({
					where: {
						id: targetReply.id,
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
