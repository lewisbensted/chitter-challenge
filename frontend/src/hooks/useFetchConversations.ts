import { useCallback, useState } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import type { IConversation } from "../interfaces/interfaces";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";
import toast from "react-hot-toast";
import { mergeAndSortConvos } from "../utils/mergeAndSortConvos";

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
	const [isConversationsLoading, setConversationsLoading] = useState<boolean>(false);
	const [reloadConversationsTrigger, toggleConversationsTrigger] = useState<boolean>(false);
	const [conversationsError, setConversationsError] = useState<string>("");

	const isMounted = useIsMounted();

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
						setConversations((prevConvos) => mergeAndSortConvos(prevConvos, newConvos, sort));
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
