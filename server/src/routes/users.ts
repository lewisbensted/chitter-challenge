import express, { Request, Response } from "express";
import { logError } from "../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import prisma, { ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import type { ExtendedUserClient } from "../../types/extendedClients.js";
import { IUser } from "../../types/responses.js";
import { PrismaClient } from "@prisma/client";
import { SearchUsersRequest } from "../../types/requests.js";

const router = express.Router({ mergeParams: true });

export const searchUsersHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: SearchUsersRequest, res: Response) => {
		try {
			const userSearch = typeof req.query.search === "string" ? req.query.search.trim() : "";
			const take = Math.min(req.query.take && Number(req.query.take) > 0 ? Number(req.query.take) : 10, 50);

			let cursor = typeof req.query.cursor === "string" ? req.query.cursor.trim() : undefined;
			if (cursor) {
				const userExists = await prismaClient.user.findUnique({ where: { uuid: cursor } });
				if (!userExists) cursor = undefined;
			}

			if (!userSearch) {
				return res.status(200).json({ users: [], hasNext: false });
			}

			const dbUsers = await prismaClient.user.findMany({
				where: {
					username: {
						contains: userSearch,
					},
				},
				include: req.session?.user?.uuid
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
				isFollowing: req.session.user?.uuid ? !!user.followers?.length : null,
			}));

			res.status(200).json({ users, hasNext });
		} catch (error) {
			console.error("Error retrieving users from the database:\n" + logError(error));
			sendErrorResponse(error, res);
		}
	};

export const getUserHandler = (prismaClient: ExtendedPrismaClient) => async (req: Request, res: Response) => {
	try {
		const user = await (prismaClient.user as ExtendedUserClient).findUniqueOrThrow({
			where: { uuid: req.params.userId },
			include: req.session.user?.uuid
				? { followers: { where: { followerId: req.session.user.uuid }, select: { followerId: true } } }
				: undefined,
		});
		res.status(200).json({
			user: { uuid: user.uuid, username: user.username },
			isFollowing: req.session.user?.uuid ? !!user.followers?.length : null,
		});
	} catch (error) {
		console.error("Error retrieving user from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
};

router.get("/", searchUsersHandler(prisma));
router.get("/:userId", getUserHandler(prisma));

export default router;
