import { Prisma } from "@prisma/client";
import { CreateCheetSchema, UpdateCheetSchema } from "../../src/schemas/cheet.schema.js";

const cheetFilters = {
	include: { user: { omit: { id: true } }, cheetStatus: { omit: { cheetId: true } } },
	omit: { id: true, userId: true },
};

export const cheetExtension = Prisma.defineExtension({
	query: {
		cheet: {
			async findUniqueOrThrow({ args, query }) {
				return query({
					...args,
					...cheetFilters,
				});
			},
			async findMany({ args, query }) {
				return query({
					...args,
					...cheetFilters,
				});
			},
			async create({ args, query }) {
				const parsedData = await CreateCheetSchema.parseAsync(args.data);
				return query({
					...args,
					data: parsedData,
					...cheetFilters,
				});
			},
			async update({ args, query }) {
				const parsedData = await UpdateCheetSchema.parseAsync(args.data);
				return query({
					...args,
					data: parsedData,
					...cheetFilters,
				});
			},
		},
	},
});
