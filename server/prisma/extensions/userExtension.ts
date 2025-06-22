import { Prisma, User } from "@prisma/client";
import { UserSchema } from "../../src/schemas/user.schema.js";
import bcrypt from "bcrypt";

export const userExtension = Prisma.defineExtension({
    query: {
        user: {
            async create({ args, query }): Promise<User> {
                const parsedData = await UserSchema.parseAsync(args.data);
                parsedData.password = await bcrypt.hash(parsedData.password, 5);
                return query({ ...args, data: parsedData }) as Promise<User>;
            },
        },
    },
});