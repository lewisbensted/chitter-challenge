import { Prisma, User } from "@prisma/client";
import { UserSchema } from "../../src/schemas/user.schema.js";
import bcrypt from "bcrypt";

export const userFilters = {
	omit: { id: true, passwordHash: true },
};

export const userExtension = Prisma.defineExtension({
	query: {
		user: {
			async findUnique({ args, query }) {
				return query({
					...args,
					omit: { id: true },
				});
			},
			async findUniqueOrThrow({ args, query }) {
				return query({
					...args,
					...userFilters,
				});
			},
			async create({ args, query }): Promise<User> {
				const parsedData = await UserSchema.parseAsync(args.data);

				const { password, ...rest } = parsedData;
				const passwordHash = await bcrypt.hash(password, 5);

				return query({ ...args, data: { ...rest, passwordHash }, ...userFilters }) as Promise<User>;
			},
		},
	},
});
