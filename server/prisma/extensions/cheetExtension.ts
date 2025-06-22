import { Prisma } from "@prisma/client";
import { CreateCheetSchema, UpdateCheetSchema } from "../../src/schemas/cheet.schema.js";

export const cheetExtension = Prisma.defineExtension({
	query: {
		cheet: {
			async create({ args, query }) {
				const parsedData = await CreateCheetSchema.parseAsync(args.data);
				return query({ ...args, data: parsedData });
			},
			async update({ args, query }) {
				const parsedData = await UpdateCheetSchema.parseAsync(args.data);
				return query({ ...args, data: parsedData });
			},
		},
	},
});
