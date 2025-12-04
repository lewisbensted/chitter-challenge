import { PrismaClient } from '@prisma/client';
import { userExtension } from '../../prisma/extensions/userExtension';
import { cheetExtension } from '../../prisma/extensions/cheetExtension';
import { replyExtension } from '../../prisma/extensions/replyExtension';
import { messageExtension, messageStatusExtension } from '../../prisma/extensions/messageExtension';
import { conversationExtension } from '../../prisma/extensions/conversationExtension';


export function createPrismaClient() {
  return new PrismaClient()
    .$extends(userExtension)
    .$extends(cheetExtension)
    .$extends(replyExtension)
    .$extends(messageExtension)
    .$extends(messageStatusExtension)
    .$extends(conversationExtension);
}

export type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;