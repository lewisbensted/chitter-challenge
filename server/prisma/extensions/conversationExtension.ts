import { Prisma } from "@prisma/client";
import { CreateCheetSchema, UpdateCheetSchema } from "../../src/schemas/cheet.schema.js";
import { userFilters } from "./userExtension.js";
import type { IConversation } from "../../types/responses.js";
import { messageFilters } from "./messageExtension.js";

const conversationFilters = {
	omit: { id: true, user1Id: true, user2Id: true, latestMessageId: true },
	include: {
		user1: userFilters,
		user2: userFilters,
		latestMessage: messageFilters ,
	},
};

export const conversationExtension = Prisma.defineExtension({
	query: {
		conversation: {
			async findMany({ args, query }): Promise<IConversation[]> {
				const cheets = await query({
					...args,
					...conversationFilters,
				});
				return cheets as unknown as IConversation[];
			},
		},
	},
});
