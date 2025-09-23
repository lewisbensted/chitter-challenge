import { Prisma } from "@prisma/client";
import { CreateReplySchema, UpdateReplySchema } from "../../src/schemas/reply.schema.js";
import { userFilters } from "./userExtension.js";
import type { IReply } from "../../types/responses.js";

const replyFilters = {
	include: { user: userFilters },
	omit: { id: true, userId: true },
};

export const replyExtension = Prisma.defineExtension({
	query: {
		reply: {
			async findUniqueOrThrow({ args, query }): Promise<IReply> {
				const reply = await query({
					...args,
					...replyFilters,
				});
				return reply as unknown as IReply;
			},
			async findMany({ args, query }): Promise<IReply[]> {
				const replies = await query({
					...args,
					...replyFilters,
				});
				return replies as unknown as IReply[];
			},
			async create({ args, query }): Promise<IReply> {
				const parsedData = await CreateReplySchema.parseAsync(args.data);
				const reply = await query({ ...args, data: parsedData, ...replyFilters });
				return reply as unknown as IReply;
			},
			async update({ args, query }): Promise<IReply> {
				const parsedData = await UpdateReplySchema.parseAsync(args.data);
				const reply = await query({ ...args, data: parsedData, ...replyFilters });
				return reply as unknown as IReply;
			},
			async delete({ args, query }): Promise<IReply> {
				const cheet = await query({
					...args,
					...replyFilters,
				});
				return cheet as unknown as IReply;
			},
		},
	},
});
