import prisma from "./prismaClient";

export const resetDB = async () => {
	await prisma.$transaction([
		prisma.reply.deleteMany(),
		prisma.cheet.deleteMany(),
		prisma.message.deleteMany(),
		prisma.user.deleteMany(),
	]);
};
