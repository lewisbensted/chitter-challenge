import { Prisma } from "@prisma/client";
import { CreateCheetSchema, UpdateCheetSchema } from "../../src/schemas/cheet.schema.js";
import { userFilters } from "./userExtension.js";

const cheetFilters = {
	include: { user: userFilters, cheetStatus: { omit: { cheetId: true } } },
	omit: { id: true, userId: true },
};

export const cheetExtension = Prisma.defineExtension({
	query: {
		cheet: {
			async findUniqueOrThrow({ args, query }) {
				const cheet = await query({
					...args,
					...cheetFilters,
				});
				return cheet;
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
