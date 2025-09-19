import express, { Request, Response } from "express";
import { authenticator } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import type { ExtendedUserClient } from "../../types/extendedClients.js";

const router = express.Router({ mergeParams: true });

const userClient = prisma.user as unknown as ExtendedUserClient;

router.post("/", authenticator, async (req: Request, res: Response) => {
	try {
		const followerId = req.session.user!.uuid;
		const followingId = req.params.followingId;

		if (followerId === followingId) {
			return res.status(400).json({ error: ["You cannot follow yourself."] });
		}

		await userClient.findUniqueOrThrow({ where: { uuid: req.params.followingId } });
		await prisma.follow.create({
			data: {
				followerId: followerId,
				followingId: followingId,
			},
		});
		res.status(201).json({ message: "success" });
	} catch (error) {
		console.error("Error following user:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.delete("/", authenticator, async (req: Request, res: Response) => {
	const followerId = req.session.user!.uuid;
	const followingId = req.params.followingId;
	try {
		await prisma.follow.delete({
			where: { followerId_followingId: { followerId: followerId, followingId: followingId } },
		});
		res.status(200).json({ message: "success" });
	} catch (error) {
		console.error("Error unfollowing user:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
