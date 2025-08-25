import { useCallback, useEffect, useRef, useState } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import { IConversation } from "../interfaces/interfaces";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";
import toast from "react-hot-toast";

interface UseFetchConversationsReturn {
	conversations: IConversation[];
	conversationsError: string | undefined;
	isConversationsLoading: boolean;
	setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
	toggleConversationsTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}

const useFetchConversations = (pageUserId?: string): UseFetchConversationsReturn => {
	const [conversations, setConversations] = useState<IConversation[]>([]);
	const [isConversationsLoading, setConversationsLoading] = useState<boolean>(true);
	const [reloadConversationsTrigger, toggleConversationsTrigger] = useState<boolean>(false);
	const [conversationsError, setConversationsError] = useState<string>("");

	const isMounted = useIsMounted();

	const isFirstLoad = useRef(true);

	const fetchConversations = useCallback(async () => {
		try {
			const res = await axios.get<IConversation[]>(
				`${serverURL}/conversations${pageUserId ? "/" + pageUserId : ""}`,
				{
					withCredentials: true,
				}
			);
			if (isMounted()) {
				setConversations(res.data);
				setConversationsError("");
			}
		} catch (error) {
			if (isFirstLoad.current) {
				logErrors(error);
				if (isMounted()) setConversationsError("An unexpected error occured while loading conversations.");
			} else {
				toast("Failed to refresh conversations - may be displaying outdated information.");
			}
		} finally {
			if (isMounted()) setConversationsLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchConversations().finally(() => {
			if (isFirstLoad.current) {
				isFirstLoad.current = false;
			}
		});
	}, [reloadConversationsTrigger, fetchConversations]);

	return {
		conversations,
		isConversationsLoading,
		conversationsError,
		toggleConversationsTrigger,
		setConversations,
	};
};

export default useFetchConversations;
