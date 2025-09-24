import express, { Request, Response } from "express";
import { logError } from "../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import prisma from "../../prisma/prismaClient.js";
import type { ExtendedUserClient } from "../../types/extendedClients.js";

const router = express.Router({ mergeParams: true });

const userClient = prisma.user as unknown as ExtendedUserClient;

router.get("/", async (req: Request, res: Response) => {
	try {
		const userSearch = (req.query.search as string | undefined) ?? "";
		if (!userSearch) {
			return res.status(200).json([]);
		}

		const users = await userClient.findMany({
			where: {
				username: {
					contains: userSearch,
				},
			},
		});

		let follows: string[];
		if (req.session.user) {
			follows = (
				await prisma.follow.findMany({
					where: { followerId: req.session.user.uuid, followingId: { in: users.map((u) => u.uuid) } },
					select: { followingId: true },
				})
			).map((el) => el.followingId);
		}

		const returns = users.map((user) => {
			const isFollowing =
				req.session.user && req.session.user.uuid !== user.uuid ? follows.some((f) => f === user.uuid) : null;
			return { user: user, isFollowing };
		});

		res.status(200).json(returns);
	} catch (error) {
		console.error("Error retrieving users from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.get("/:userId", async (req: Request, res: Response) => {
	try {
		const user = await userClient.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		let isFollowing: null | boolean = null;
		if (req.session.user) {
			const follow = await prisma.follow.findUnique({
				where: {
					followerId_followingId: { followerId: req.session.user.uuid, followingId: req.params.userId },
				},
				select: { followingId: true },
			});
			isFollowing = !!follow;
		}
		res.json({ user: user, isFollowing });
	} catch (error) {
		console.error("Error retrieving user from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
