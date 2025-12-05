import express, { NextFunction, Request, Response } from "express";
import { type ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import type { ExtendedUserClient } from "../../types/extendedClients.js";
import type { SearchUsersRequest } from "../../types/requests.js";
import { searchUsers, type FetchUsersType } from "../utils/searchUsers.js";


export const searchUsersHandler =
	(prismaClient: ExtendedPrismaClient, searchFn: FetchUsersType) =>
		async (req: SearchUsersRequest, res: Response, next: NextFunction) => {
			try {
				const searchString = typeof req.query.search === "string" ? req.query.search.trim() : "";
				const take = Math.min(req.query.take && Number(req.query.take) > 0 ? Number(req.query.take) : 10, 50);

				let cursor = typeof req.query.cursor === "string" ? req.query.cursor.trim() : undefined;
				if (cursor) {
					const userExists = await prismaClient.user.findUnique({ where: { uuid: cursor } });
					if (!userExists) cursor = undefined;
				}

				if (!searchString) {
					return res.status(200).json({ users: [], hasNext: false });
				}

				const { users, hasNext } = await searchFn(prismaClient, take, searchString, req.session.user?.uuid, cursor);

				res.status(200).json({ users, hasNext });
			} catch (error) {
				console.error("Error retrieving users from the database:\n");
				next(error);
			}
		};

export const getUserHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await (prismaClient.user as unknown as ExtendedUserClient).findUniqueOrThrow({
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
			console.error("Error retrieving user from the database:\n");
			next(error);
		}
	};

export default (prismaClient: ExtendedPrismaClient) => {
	const router = express.Router({ mergeParams: true });

	router.get("/", searchUsersHandler(prismaClient, searchUsers));
	router.get("/:userId", getUserHandler(prismaClient));

	return router;
};
