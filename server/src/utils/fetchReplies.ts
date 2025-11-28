import type { ExtendedPrismaClient } from "../../prisma/prismaClient.js";

export const fetchReplies = async (
	prismaClient: ExtendedPrismaClient,
	take: number,
	cheetId: string,
	cursor?: string
) => {
	const replies = await prismaClient.reply.findMany({
		where: {
			cheet: { uuid: cheetId },
		},
		take: take + 1,
		orderBy: { createdAt: "desc" },
		...(cursor && { skip: 1 }),
		...(cursor && { cursor: { uuid: cursor } }),
	});

	const hasNext = take > 0 && replies.length > take;
	if (hasNext || take === 0) replies.pop();
	return { replies, hasNext };
};

export type FetchRepliesType = typeof fetchReplies;
