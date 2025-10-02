import type { IConversation } from "../interfaces/interfaces";

export const mergeAndSortConvos = (
	prevConvos: Map<string, IConversation>,
	newConvos: Map<string, IConversation>,
	sort = false
) => {
	const merged = new Map([...prevConvos, ...newConvos]);
	if (!sort) return merged;

	const sorted = Array.from(merged.values()).sort((a, b) => {
		const aTime = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
		const bTime = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
		return bTime - aTime;
	});

	return new Map(sorted.map((c) => [c.interlocutorId, c]));
};
