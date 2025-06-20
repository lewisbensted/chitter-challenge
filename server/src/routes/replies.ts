import { Prisma } from "@prisma/client";
import express, { Request, Response } from "express";
import { CreateReplySchema, UpdateReplySchema } from "../schemas/reply.schema.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";

const router = express.Router({ mergeParams: true });

const isProduction = process.env.NODE_ENV === "production";

const createSchema = isProduction ? CreateReplySchema.omit({ createdAt: true, updatedAt: true }) : CreateReplySchema;
const updateSchema = isProduction ? UpdateReplySchema.omit({ updatedAt: true }) : UpdateReplySchema;

export const replyExtension = Prisma.defineExtension({
	query: {
		reply: {
			async create({ args, query }) {
				const parsedData = await createSchema.parseAsync({ ...args.data, text: args.data.text?.trim() });
				return query({ ...args, data: parsedData });
			},
			async update({ args, query }) {
				const parsedData = await updateSchema.parseAsync({
					...args.data,
					text: (args.data.text as string)?.trim(),
				});
				return query({ ...args, data: parsedData });
			},
		},
	},
});

export const fetchReplies = async (cheetId: string, cursor?: string, take?: number) => {
	take = isNaN(take!) ? 10 : take;

	const replies = await prisma.reply.findMany({
		include: { cheet: { omit: { id: true, userId: true } }, user: { omit: { id: true } } },
		omit: { id: true },
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
		const cheet = await prisma.cheet.findUniqueOrThrow({ where: { uuid: req.params.cheetId } });
		const newReply = await prisma.$extends(replyExtension).reply.create({
			data: {
				userId: req.session.user!.uuid,
				text: (req as { body: { text: string } }).body.text,
				cheetId: cheet.uuid
			},
			include: { cheet: { omit: { id: true} }, user: { omit: { id: true } } },
			omit: { id: true },
		});
		if (!cheet.hasReplies) {
			await prisma.cheet.update({
				where: {
					uuid: cheet.uuid,
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
			where: { uuid: req.params.replyId },
			include: { cheet: { omit: { id: true } }, user: { omit: { id: true } } },
			omit: { id: true },
		});
		if (targetReply.user.uuid === req.session.user!.uuid) {
			if (targetReply.cheet.uuid === req.params.cheetId) {
				if ((req as { body: { text: string | undefined } }).body.text !== targetReply.text) {
					const updatedReply = await prisma.$extends(replyExtension).reply.update({
						where: {
							uuid: targetReply.uuid,
						},
						data: {
							text: (req as { body: { text: string } }).body.text,
							
						},
						include: { cheet: { omit: { id: true } }, user: { omit: { id: true } } },
						omit: { id: true },
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
