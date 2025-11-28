import type { ExtendedPrismaClient } from "../../prisma/prismaClient.js";

export const fetchCheets = async (
	prismaClient: ExtendedPrismaClient,
	take: number,
	sessionUserId?: string,
	pageUserId?: string,
	cursor?: string
) => {
	const userFilter = pageUserId
		? { uuid: pageUserId }
		: sessionUserId
			? { OR: [{ uuid: sessionUserId }, { followers: { some: { followerId: sessionUserId } } }] }
			: undefined;

	const cheets = await prismaClient.cheet.findMany({
		where: {
			user: userFilter,
		},
		orderBy: { createdAt: "desc" },
		take: take + 1,
		...(cursor && { skip: 1 }),
		...(cursor && { cursor: { uuid: cursor } }),
	});
	const hasNext = take > 0 && cheets.length > take;
	if (hasNext || take === 0) cheets.pop();
	return { cheets, hasNext };
};

export type FetchCheetsType = typeof fetchCheets;
