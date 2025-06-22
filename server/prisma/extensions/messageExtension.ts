import { Prisma } from "@prisma/client";
import { CreateMessageSchema, UpdateMessageSchema } from "../../src/schemas/message.schema.js";

export const messageExtension = Prisma.defineExtension({
	query: {
		message: {
			async create({ args, query }) {
				const parsedData = await CreateMessageSchema.parseAsync(args.data);
				return query({ ...args, data: parsedData });
			},
			async update({ args, query }) {
				const parsedData = await UpdateMessageSchema.parseAsync(args.data);
				return query({ ...args, data: parsedData });
			},
		},
	},
});
