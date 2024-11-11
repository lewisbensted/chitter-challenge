import prisma from "../../prisma/prismaClient.js";

export const checkCheet = async (cheetId: string) => {
    if (isNaN(Number(cheetId))) {
        throw new TypeError("Invalid cheet ID provided - must be a number.");
    }
    return await prisma.cheet.findUniqueOrThrow({ where: { id: Number(cheetId) } });
};
