import { IMessage } from "../../types/responses.js";
import { messageFilters } from "../extensions/messageExtension.js";
import type { ExtendedPrismaClient } from "../prismaClient.js";

export async function softDeleteMessageStatus(
	prismaClient: ExtendedPrismaClient,
	messageId: string
): Promise<IMessage> {
	const message = await prismaClient.messageStatus.update({
		where: { messageId },
		data: { isDeleted: true },
		include: { message: messageFilters },
	});

	return message.message as unknown as IMessage;
}
