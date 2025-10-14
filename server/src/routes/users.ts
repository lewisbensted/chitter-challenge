import express, { Request, Response } from "express";
import { logError } from "../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import prisma from "../../prisma/prismaClient.js";
import type { ExtendedUserClient } from "../../types/extendedClients.js";
import { IUser } from "../../types/responses.js";

const router = express.Router({ mergeParams: true });

const userClient = prisma.user as unknown as ExtendedUserClient;

router.get("/", async (req: Request, res: Response) => {
	try {
		const userSearch = (req.query.search as string | undefined) ?? "";
		const take = Math.min(req.query.take && Number(req.query.take) > 0 ? Number(req.query.take) : 10, 50);
		const cursor = req.query.cursor as string | undefined;

		if (!userSearch) {
			return res.status(200).json({ users: [], hasNext: false });
		}

		const dbUsers = await userClient.findMany({
			where: {
				username: {
					contains: userSearch,
				},
			},
			include: req.session.user?.uuid
				? { followers: { where: { followerId: req.session.user.uuid }, select: { followerId: true } } }
				: undefined,
			take: take + 1,
			skip: cursor ? 1 : 0,
			cursor: cursor ? { uuid: cursor } : undefined,
			orderBy: { username: "asc" },
		});

		const hasNext = dbUsers.length > take;
		if (hasNext) dbUsers.pop();

		const users = dbUsers.map((user: IUser) => ({
			user: { uuid: user.uuid, username: user.username },
			isFollowing: !!user.followers?.length,
		}));

		res.status(200).json({ users, hasNext });
	} catch (error) {
		console.error("Error retrieving users from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

router.get("/:userId", async (req: Request, res: Response) => {
	try {
		const user = await userClient.findUniqueOrThrow({
			where: { uuid: req.params.userId },
			include: req.session.user?.uuid
				? { followers: { where: { followerId: req.session.user.uuid }, select: { followerId: true } } }
				: undefined,
		});
		res.json({ user: { uuid: user.uuid, username: user.username }, isFollowing: !!user.followers?.length });
	} catch (error) {
		console.error("Error retrieving user from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
