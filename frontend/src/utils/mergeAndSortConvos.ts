import type { IConversation } from "../interfaces/interfaces";

export const mergeAndSortConvos = (
	sort = false,
	newConvos: Map<string, IConversation>,
	prevConvos?: Map<string, IConversation>
) => {
	const merged = prevConvos ? new Map([...prevConvos, ...newConvos]) : newConvos;
	if (!sort) return merged;

	const sorted = Array.from(merged.values()).sort((a, b) => {
		const aTime = new Date(a.latestMessage?.createdAt ?? 0).getTime();
		const bTime = new Date(b.latestMessage?.createdAt ?? 0).getTime();
		return bTime - aTime;
	});

	return new Map(sorted.map((c) => [c.interlocutorId, c]));
};
