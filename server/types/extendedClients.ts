import { Prisma } from "@prisma/client";

import { RegisterUserRequestBody } from "./requests.js";
import type { IUser, ICheet, IReply, IMessage, IConversation } from "./responses.js";

export interface ExtendedUserClient {
	createMany(args: Prisma.UserCreateManyArgs): Promise<Prisma.BatchPayload>;
	findMany(args: Prisma.UserFindManyArgs): Promise<IUser[]>;
	findUniqueOrThrow(args: Prisma.UserFindUniqueOrThrowArgs): Promise<IUser>;
	findUnique(args: Prisma.UserFindUniqueArgs): Promise<(IUser & { passwordHash: string }) | null>;
	create(args: { data: Omit<Prisma.UserCreateInput, "passwordHash"> & { password: string } }): Promise<IUser>;
}

export interface ExtendedCheetClient {
	createMany(args: Prisma.CheetCreateManyArgs): Promise<Prisma.BatchPayload>;
	findUniqueOrThrow(args: Prisma.CheetFindUniqueOrThrowArgs): Promise<ICheet>;
	findMany(args: Prisma.CheetFindManyArgs): Promise<ICheet[]>;
	create(args: Prisma.CheetCreateArgs): Promise<ICheet>;
	update(args: Prisma.CheetUpdateArgs): Promise<ICheet>;
	delete(args: Prisma.CheetDeleteArgs): Promise<ICheet>;
}

export interface ExtendedReplyClient {
	findUniqueOrThrow(args: Prisma.ReplyFindUniqueOrThrowArgs): Promise<IReply>;
	findMany(args: Prisma.ReplyFindManyArgs): Promise<IReply[]>;
	create(args: Prisma.ReplyCreateArgs): Promise<IReply>;
	update(args: Prisma.ReplyUpdateArgs): Promise<IReply>;
	delete(args: Prisma.ReplyDeleteArgs): Promise<IReply>;
}

export interface ExtendedMessageClient {
	findUniqueOrThrow(args: Prisma.MessageFindUniqueOrThrowArgs): Promise<IMessage>;
	findFirst(args: Prisma.MessageFindFirstArgs): Promise<IMessage | null>;
	findMany(args: Prisma.MessageFindManyArgs): Promise<IMessage[]>;
	create(args: Prisma.MessageCreateArgs): Promise<IMessage>;
	update(args: Prisma.MessageUpdateArgs): Promise<IMessage>;
}

export interface ExtendedMessageStatusClient {
	softDelete(messageId: string): Promise<IMessage>;
}

export interface ExtendedConversationClient {
	findMany(args: Prisma.ConversationFindManyArgs): Promise<IConversation[]>;
}
