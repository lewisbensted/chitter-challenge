import { PrismaClient } from "@prisma/client";
import { cheetExtension } from "./extensions/cheetExtension.js";
import { replyExtension } from "./extensions/replyExtension.js";
import { userExtension } from "./extensions/userExtension.js";
import { messageExtension, messageStatusExtension } from "./extensions/messageExtension.js";
import { conversationExtension } from "./extensions/conversationExtension.js";



const prisma = new PrismaClient()
	.$extends(userExtension)
	.$extends(cheetExtension)
	.$extends(replyExtension)
	.$extends(messageExtension)
	.$extends(messageStatusExtension)
	.$extends(conversationExtension);

export type ExtendedPrismaClient = typeof prisma;

export default prisma;
