import express, { Request, Response } from "express";
import { authenticator } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import prisma, { ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";

const router = express.Router({ mergeParams: true });

export const followHandler = (prismaClient: ExtendedPrismaClient) => async (req: Request, res: Response) => {
	try {
		const sessionUser = req.session.user;
		if (!sessionUser) return res.status(401).json({ errors: ["Unauthorised."] });

		const followerId = sessionUser.uuid;
		const followingId = req.params.followingId;

		if (followerId === followingId) {
			return res.status(400).json({ errors: ["You cannot follow yourself."] });
		}
		await prismaClient.follow.create({
			data: {
				followerId: followerId,
				followingId: followingId,
			},
		});
		res.sendStatus(201);
	} catch (error) {
		console.error("Error following user:\n" + logError(error));
		sendErrorResponse(error, res);
	}
};

export const unfollowHandler = (prismaClient: ExtendedPrismaClient) => async (req: Request, res: Response) => {
	const sessionUser = req.session.user;
	if (!sessionUser) return res.status(401).json({ errors: ["Unauthorised."] });

	const followerId = sessionUser.uuid;
	const followingId = req.params.followingId;
	try {
		await prismaClient.follow.delete({
			where: { followerId_followingId: { followerId: followerId, followingId: followingId } },
		});
		res.sendStatus(204);
	} catch (error) {
		if (typeof error == "object" && error && "code" in error && error.code === "P2025") {
			return res.sendStatus(204);
		}
		console.error("Error unfollowing user:\n" + logError(error));
		sendErrorResponse(error, res);
	}
};

router.post("/", authenticator, followHandler(prisma));
router.delete("/", authenticator, unfollowHandler(prisma));

export default router;
