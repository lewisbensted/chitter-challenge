import { useCallback, useRef, useState, type MutableRefObject } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import type { IConversation } from "../interfaces/interfaces";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";
import toast from "react-hot-toast";

interface UseFetchConversationsReturn {
	conversations: Map<string,IConversation>;
	conversationsError: string | undefined;
	isConversationsLoading: boolean;
	setConversations: React.Dispatch<React.SetStateAction<Map<string,IConversation>>>;
	toggleConversationsTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	fetchConversations: (userIds?: string[] ) => Promise<IConversation[]|undefined>;
	reloadConversationsTrigger: boolean;
	isFirstLoad: MutableRefObject<boolean>
}

const useFetchConversations = (): UseFetchConversationsReturn => {
	const [conversations, setConversations] = useState<Map<string,IConversation>>(new Map<string,IConversation>);
	const [isConversationsLoading, setConversationsLoading] = useState<boolean>(true);
	const [reloadConversationsTrigger, toggleConversationsTrigger] = useState<boolean>(false);
	const [conversationsError, setConversationsError] = useState<string>("");

	const isMounted = useIsMounted();

	const isFirstLoad = useRef(true);

	const fetchConversations = useCallback(async (userIds?: string[]) => {
		try {
			const res = await axios.get<IConversation[]>(
				`${serverURL}/api/conversations${userIds ? "?userIds=" + userIds.join(",") : ""}`,
				{
					withCredentials: true,
				}
			);
			if (isMounted.current) {
				setConversations(new Map(res.data.map(convo=>[convo.interlocutorId, convo])));
				setConversationsError("");
			}
			return res.data;
		} catch (error) {
			if (isFirstLoad.current) {
				logErrors(error);
				if (isMounted.current) setConversationsError("An unexpected error occured while loading conversations.");
			} else {
				toast("Failed to refresh conversations - may be displaying outdated information.");
			}
		} finally {
			if (isMounted.current) setConversationsLoading(false);
		}
	}, []);

	return {
		conversations,
		fetchConversations,
		reloadConversationsTrigger,
		isFirstLoad,
		isConversationsLoading,
		conversationsError,
		toggleConversationsTrigger,
		setConversations,
	};
};

export default useFetchConversations;
