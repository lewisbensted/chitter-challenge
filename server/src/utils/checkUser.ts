import prisma from "../../prisma/prismaClient.js";

export const checkUser = async (userId: string, type?: string) => {
    if (isNaN(Number(userId))) {
        throw new TypeError(`Invalid ${type ? type : "user"} ID provided - must be a number.`);
    }
    return await prisma.user.findUniqueOrThrow({ where: { id: Number(userId) } });
};
