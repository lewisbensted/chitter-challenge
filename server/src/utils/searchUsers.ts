import type { ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import type { ExtendedUserClient } from "../../types/extendedClients.js";

export const searchUsers = async (
	prismaClient: ExtendedPrismaClient,
	take: number,
	searchString: string,
	sessionUserId?: string,
	cursor?: string
) => {
	const dbUsers = await (prismaClient.user as unknown as ExtendedUserClient).findMany({
		where: {
			username: {
				contains: searchString,
			},
		},
		include: sessionUserId
			? { followers: { where: { followerId: sessionUserId }, select: { followerId: true } } }
			: undefined,
		take: take + 1,
		orderBy: { username: "asc" },
		...(cursor && { skip: 1 }),
		...(cursor && { cursor: { uuid: cursor } }),
	});

	const hasNext = take > 0 && dbUsers.length > take;
	if (hasNext || take === 0) dbUsers.pop();

	const users = dbUsers.map((user) => ({
		user: { uuid: user.uuid, username: user.username },
		isFollowing: sessionUserId ? !!user.followers?.length : null,
	}));

	return { users, hasNext };
};
export type FetchUsersType = typeof searchUsers;
