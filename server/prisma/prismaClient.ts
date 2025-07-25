import { PrismaClient } from "@prisma/client";
import { cheetExtension } from "./extensions/cheetExtension.js";
import { replyExtension } from "./extensions/replyExtension.js";
import { userExtension } from "./extensions/userExtension.js";
import { messageExtension } from "./extensions/messageExtension.js";

const prisma = new PrismaClient()
	.$extends(userExtension)
	.$extends(cheetExtension)
	.$extends(replyExtension)
	.$extends(messageExtension);


export default prisma;
