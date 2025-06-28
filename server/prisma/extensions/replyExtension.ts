import { Prisma } from "@prisma/client";
import { CreateReplySchema, UpdateReplySchema } from "../../src/schemas/reply.schema.js";

const replyFilters = {
	include: { cheet: { omit: { id: true, userId: true } }, user: { omit: { id: true, passwordHash: true } } },
	omit: { id: true, cheetId: true, userId: true },
};

export const replyExtension = Prisma.defineExtension({
	query: {
		reply: {
			async findUniqueOrThrow({ args, query }) {
				return query({
					...args,
					...replyFilters,
				});
			},
			async findMany({ args, query }) {
				return query({
					...args,
					...replyFilters,
				});
			},
			async create({ args, query }) {
				const parsedData = await CreateReplySchema.parseAsync(args.data);
				return query({ ...args, data: parsedData, ...replyFilters });
			},
			async update({ args, query }) {
				const parsedData = await UpdateReplySchema.parseAsync(args.data);
				return query({ ...args, data: parsedData, ...replyFilters });
			},
		},
	},
});
