import { ExtendedPrismaClient } from "./prismaClient.js";

export const resetDB = async (prismaClient: ExtendedPrismaClient) => {
	await prismaClient.$transaction([
		prismaClient.reply.deleteMany(),
		prismaClient.cheet.deleteMany(),
		prismaClient.message.deleteMany(),
		prismaClient.user.deleteMany(),
	]);
};
