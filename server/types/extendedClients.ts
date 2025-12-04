
import { RegisterUserRequestBody } from "./requests.js";
import { PrismaClient } from "@prisma/client";
import type { IUser, ICheet, IReply, IMessage, IConversation } from "./responses.js";

export interface ExtendedUserClient {
  findMany(args: Parameters<PrismaClient['user']['findMany']>[0]): Promise<IUser[]>;
  findUniqueOrThrow(args: Parameters<PrismaClient['user']['findUniqueOrThrow']>[0]): Promise<IUser>;
  findUnique(args: Parameters<PrismaClient['user']['findUnique']>[0]): Promise<(IUser & { passwordHash: string }) | null>;
  create(args: { data: RegisterUserRequestBody }): Promise<IUser>;
}

export interface ExtendedCheetClient {
  findUniqueOrThrow(args: Parameters<PrismaClient['cheet']['findUniqueOrThrow']>[0]): Promise<ICheet>;
  findMany(args: Parameters<PrismaClient['cheet']['findMany']>[0]): Promise<ICheet[]>;
  create(args: Parameters<PrismaClient['cheet']['create']>[0]): Promise<ICheet>;
  update(args: Parameters<PrismaClient['cheet']['update']>[0]): Promise<ICheet>;
  delete(args: Parameters<PrismaClient['cheet']['delete']>[0]): Promise<ICheet>;
}

export interface ExtendedReplyClient {
  findUniqueOrThrow(args: Parameters<PrismaClient['reply']['findUniqueOrThrow']>[0]): Promise<IReply>;
  findMany(args: Parameters<PrismaClient['reply']['findMany']>[0]): Promise<IReply[]>;
  create(args: Parameters<PrismaClient['reply']['create']>[0]): Promise<IReply>;
  update(args: Parameters<PrismaClient['reply']['update']>[0]): Promise<IReply>;
  delete(args: Parameters<PrismaClient['reply']['delete']>[0]): Promise<IReply>;
}

export interface ExtendedMessageClient {
  findUniqueOrThrow(args: Parameters<PrismaClient['message']['findUniqueOrThrow']>[0]): Promise<IMessage>;
  findFirst(args: Parameters<PrismaClient['message']['findFirst']>[0]): Promise<IMessage | null>;
  findMany(args: Parameters<PrismaClient['message']['findMany']>[0]): Promise<IMessage[]>;
  create(args: Parameters<PrismaClient['message']['create']>[0]): Promise<IMessage>;
  update(args: Parameters<PrismaClient['message']['update']>[0]): Promise<IMessage>;
}

export interface ExtendedConversationClient {
  findMany(args: Parameters<PrismaClient['conversation']['findMany']>[0]): Promise<IConversation[]>;
}

