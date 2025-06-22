import { Prisma } from "@prisma/client";
import { CreateReplySchema, UpdateReplySchema } from "../../src/schemas/reply.schema.js";

export const replyExtension = Prisma.defineExtension({
    query: {
        reply: {
            async create({ args, query }) {
                const parsedData = await CreateReplySchema.parseAsync(args.data);
                return query({ ...args, data: parsedData });
            },
            async update({ args, query }) {
                const parsedData = await UpdateReplySchema.parseAsync(args.data);
                return query({ ...args, data: parsedData });
            },
        },
    },
});