import { PrismaClient } from "@prisma/client";
import { cheetExtension } from "./extensions/cheetExtension.ts";
import { replyExtension } from "./extensions/replyExtension.ts";
import { userExtension } from "./extensions/userExtension.ts";
import { messageExtension, messageStatusExtension } from "./extensions/messageExtension.ts";

const prisma = new PrismaClient()
	.$extends(userExtension)
	.$extends(cheetExtension)
	.$extends(replyExtension)
	.$extends(messageExtension)
	.$extends(messageStatusExtension);


export default prisma;
