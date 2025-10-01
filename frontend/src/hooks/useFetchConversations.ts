import { useCallback, useState } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import type { IConversation } from "../interfaces/interfaces";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";
import toast from "react-hot-toast";

interface UseFetchConversationsReturn {
	conversations: Map<string, IConversation>;
	conversationsError: string | undefined;
	isConversationsLoading: boolean;
	setConversations: React.Dispatch<React.SetStateAction<Map<string, IConversation>>>;
	toggleConversationsTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	fetchConversations: (userIds?: string[], isRefresh?: boolean, replace?: boolean, sort?: boolean) => Promise<void>;
	reloadConversationsTrigger: boolean;
	setConversationsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const useFetchConversations = (): UseFetchConversationsReturn => {
	const [conversations, setConversations] = useState<Map<string, IConversation>>(new Map<string, IConversation>());
	const [isConversationsLoading, setConversationsLoading] = useState<boolean>(true);
	const [reloadConversationsTrigger, toggleConversationsTrigger] = useState<boolean>(false);
	const [conversationsError, setConversationsError] = useState<string>("");

	const isMounted = useIsMounted();

	const mergeAndSort = (
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

	const fetchConversations = useCallback(
		async (userIds?: string[], isRefresh = false, merge = false, sort = false) => {
			if (!isRefresh && !isConversationsLoading) setConversationsLoading(true);
			try {
				const params = new URLSearchParams();
				if (userIds?.length) params.append("userIds", userIds.join(","));

				const res = await axios.get<IConversation[]>(`${serverURL}/api/conversations?${params}`, {
					withCredentials: true,
				});
				if (isMounted.current) {
					if (merge) {
						const newConvos = new Map(res.data.map((convo) => [convo.interlocutorId, convo]));
						setConversations((prevConvos) => mergeAndSort(prevConvos, newConvos, sort));
					} else {
						setConversations(new Map(res.data.map((convo) => [convo.interlocutorId, convo])));
					}

					setConversationsError("");
				}
			} catch (error) {
				logErrors(error);
				if (isMounted.current) {
					if (isRefresh) toast("Failed to refresh conversations - may be displaying outdated information.");
					else setConversationsError("An unexpected error occured while loading conversations.");
				}
			} finally {
				if (isMounted.current) setConversationsLoading(false);
			}
		},
		[]
	);

	return {
		conversations,
		fetchConversations,
		reloadConversationsTrigger,
		isConversationsLoading,
		conversationsError,
		toggleConversationsTrigger,
		setConversations,
		setConversationsLoading,
	};
};

export default useFetchConversations;
