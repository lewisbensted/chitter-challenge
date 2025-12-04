import { Prisma } from "@prisma/client";
import { CreateCheetSchema, UpdateCheetSchema } from "../../src/schemas/cheet.schema.js";
import type { ICheet } from "../../types/responses.js";
import { userFilters } from "./userExtension.js";

const cheetFilters = {
	include: { user: userFilters, cheetStatus: { omit: { cheetId: true } } },
	omit: { id: true, userId: true },
};

export const cheetExtension = Prisma.defineExtension({
	query: {
		cheet: {
			async findUniqueOrThrow({ args, query }): Promise<ICheet> {
				const cheet = await query({
					...args,
					...cheetFilters,
				});
				return cheet as unknown as ICheet;
			},
			async findMany({ args, query }): Promise<ICheet[]> {
				const cheets = await query({
					...args,
					...cheetFilters,
				});
				return cheets as unknown as ICheet[];
			},
			async create({ args, query }): Promise<ICheet> {
				const parsedData = await CreateCheetSchema.parseAsync(args.data);
				const cheet = await query({
					...args,
					data: parsedData,
					...cheetFilters,
				});
				return cheet as unknown as ICheet;
			},
			async update({ args, query }): Promise<ICheet> {
				const parsedData = await UpdateCheetSchema.parseAsync(args.data);
				const cheet = await query({
					...args,
					data: parsedData,
					...cheetFilters,
				});
				return cheet as unknown as ICheet;
			},
			async delete({ args, query }): Promise<ICheet> {
				const cheet = await query({
					...args,
					...cheetFilters,
				});
				return cheet as unknown as ICheet;
			},
		},
	},
});
