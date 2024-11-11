import prisma from "../../prisma/prismaClient.js";

export const checkMessage = async (messageId: string) => {
    if (isNaN(Number(messageId))) {
        throw new TypeError("Invalid message ID provided - must be a number.");
    }
    return await prisma.message.findUniqueOrThrow({ where: { id: Number(messageId) } });
};
