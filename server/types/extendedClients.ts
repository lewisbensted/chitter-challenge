import prisma from "../prisma/prismaClient.js";
import { RegisterUserRequestBody } from "./requests.js";
import type { IUser, ICheet, IReply, IMessage } from "./responses.js";

export interface ExtendedUserClient {
	findMany(args: Parameters<typeof prisma.user.findMany>[0]): Promise<IUser[]>;
	findUniqueOrThrow(args: Parameters<typeof prisma.user.findUniqueOrThrow>[0]): Promise<IUser>;
	findUnique(args: Parameters<typeof prisma.user.findUnique>[0]): Promise<(IUser & { passwordHash: string }) | null>;
	create(args: { data: RegisterUserRequestBody }): Promise<IUser>;
}

export interface ExtendedCheetClient {
	findUniqueOrThrow(args: Parameters<typeof prisma.cheet.findUniqueOrThrow>[0]): Promise<ICheet>;
	findMany(args: Parameters<typeof prisma.cheet.findMany>[0]): Promise<ICheet[]>;
	create(args: Parameters<typeof prisma.cheet.create>[0]): Promise<ICheet>;
	update(args: Parameters<typeof prisma.cheet.update>[0]): Promise<ICheet>;
	delete(args: Parameters<typeof prisma.cheet.delete>[0]): Promise<ICheet>;
}

export interface ExtendedReplyClient {
	findUniqueOrThrow(args: Parameters<typeof prisma.reply.findUniqueOrThrow>[0]): Promise<IReply>;
	findMany(args: Parameters<typeof prisma.reply.findMany>[0]): Promise<IReply[]>;
	create(args: Parameters<typeof prisma.reply.create>[0]): Promise<IReply>;
	update(args: Parameters<typeof prisma.reply.update>[0]): Promise<IReply>;
	delete(args: Parameters<typeof prisma.cheet.delete>[0]): Promise<IReply>;
}

export interface ExtendedMessageClient {
	findUniqueOrThrow(args: Parameters<typeof prisma.message.findUniqueOrThrow>[0]): Promise<IMessage>;
	findFirst(args: Parameters<typeof prisma.message.findFirst>[0]): Promise<IMessage | null>;
	findMany(args: Parameters<typeof prisma.message.findMany>[0]): Promise<IMessage[]>;
	create(args: Parameters<typeof prisma.message.create>[0]): Promise<IMessage>;
	update(args: Parameters<typeof prisma.message.update>[0]): Promise<IMessage>;
}

export interface ExtendedMessageStatusClient {
	softDelete(messageId: string): Promise<IMessage>;
}
