import { Prisma } from "@prisma/client";
import { UserSchema } from "../../src/schemas/user.schema.js";
import bcrypt from "bcrypt";
import type { IUser } from "../../types/responses.js";

export const userFilters = {
	omit: { id: true, passwordHash: true },
};

export const userExtension = Prisma.defineExtension({
	query: {
		user: {
			async findUnique({ args, query }): Promise<(IUser & { passwordHash: string }) | null> {
				const user = await query({
					...args,
					omit: { id: true },
				});
				return user as unknown as (IUser & { passwordHash: string }) | null;
			},
			async findUniqueOrThrow({ args, query }): Promise<IUser> {
				const user = await query({
					...args,
					...userFilters,
				});
				return user as unknown as IUser;
			},
			async create({ args, query }): Promise<IUser> {
				const parsedData = await UserSchema.parseAsync(args.data);

				const { password, ...rest } = parsedData;
				const passwordHash = await bcrypt.hash(password, 5);

				const user = await query({ ...args, data: { ...rest, passwordHash }, ...userFilters });
				return user as unknown as IUser;
			},
		},
	},
});
