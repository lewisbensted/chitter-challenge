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
	fetchConversations: (isRefresh?: boolean, userIds?: string[]) => Promise<IConversation[] | undefined>;
	reloadConversationsTrigger: boolean;
	setConversationsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const useFetchConversations = (): UseFetchConversationsReturn => {
	const [conversations, setConversations] = useState<Map<string, IConversation>>(new Map<string, IConversation>());
	const [isConversationsLoading, setConversationsLoading] = useState<boolean>(true);
	const [reloadConversationsTrigger, toggleConversationsTrigger] = useState<boolean>(false);
	const [conversationsError, setConversationsError] = useState<string>("");

	const isMounted = useIsMounted();

	const fetchConversations = useCallback(async (isRefresh = false, userIds?: string[]) => {
		if (isMounted.current && !isRefresh && !isConversationsLoading) setConversationsLoading(true);
		try {
			const res = await axios.get<IConversation[]>(
				`${serverURL}/api/conversations${userIds ? "?userIds=" + userIds.join(",") : ""}`,
				{
					withCredentials: true,
				}
			);
			if (isMounted.current) {
				setConversations(new Map(res.data.map((convo) => [convo.interlocutorId, convo])));
				setConversationsError("");
			}
			return res.data;
		} catch (error) {
			logErrors(error);
			if (isMounted.current) {
				if (isRefresh) toast("Failed to refresh conversations - may be displaying outdated information.");
				else setConversationsError("An unexpected error occured while loading conversations.");
			}
		} finally {
			if (isMounted.current) setConversationsLoading(false);
		}
	}, []);

	return {
		conversations,
		fetchConversations,
		reloadConversationsTrigger,
		//isFirstLoad,
		isConversationsLoading,
		conversationsError,
		toggleConversationsTrigger,
		setConversations,
		setConversationsLoading,
	};
};

export default useFetchConversations;
