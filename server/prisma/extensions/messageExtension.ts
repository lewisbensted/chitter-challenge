import { Prisma } from "@prisma/client";
import { CreateMessageSchema, UpdateMessageSchema } from "../../src/schemas/message.schema.js";

const messageFilters = {
	include: {
		messageStatus: { omit: { messageId: true } },
		sender: { omit: { id: true, password:true  } },
		recipient: { omit: { id: true, password:true } },
	},
	omit: { id: true, senderId: true, recipientId: true },
};

export const messageExtension = Prisma.defineExtension({
	query: {
		message: {
			async findFirst({ args, query }) {
				return query({
					...args,
					...messageFilters,
				});
			},
			async findMany({ args, query }) {
				return query({
					...args,
					...messageFilters,
				});
			},
			async findUniqueOrThrow({ args, query }) {
				return query({
					...args,
					...messageFilters,
				});
			},
			async create({ args, query }) {
				const parsedData = await CreateMessageSchema.parseAsync(args.data);
				return query({ ...args, data: parsedData, ...messageFilters });
			},
			async update({ args, query }) {
				const parsedData = await UpdateMessageSchema.parseAsync(args.data);
				return query({ ...args, data: parsedData, ...messageFilters });
			},
		},
	},
});
