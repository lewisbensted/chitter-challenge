import { ExtendedPrismaClient } from "./prismaClient.js";

export const resetDB = async (prismaClient: ExtendedPrismaClient) => {
	await prismaClient.reply.deleteMany();
	await prismaClient.cheetStatus.deleteMany();
	await prismaClient.cheet.deleteMany();
	await prismaClient.messageStatus.deleteMany();
	await prismaClient.message.deleteMany();
	await prismaClient.conversation.deleteMany();
	await prismaClient.user.deleteMany();
};
